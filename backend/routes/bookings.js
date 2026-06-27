const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const validateObjectId = require('../middleware/validateObjectId');
const Event = require('../models/Event');
const Booking = require('../models/Booking');
const User = require('../models/User'); 
const { sendConfirmationEmail } = require('../utils/email');
const QRCode = require('qrcode');

// student books event or joins waitlist
router.post('/book', protect, async (req, res) => {
  if (req.user.role !== 'student') return res.status(403).json({ msg: 'Only students can book events' });
  
  const { eventId, department, phoneNumber } = req.body; 
  if (!department || !phoneNumber) return res.status(400).json({ msg: 'Department and Phone Number are required.' });

  const existingBooking = await Booking.findOne({ user: req.user._id, event: eventId });
  if (existingBooking) return res.status(400).json({ msg: 'You are already registered for this event.' });

  // Atomic Update to prevent Double Booking Race Condition
  const ev = await Event.findOneAndUpdate(
      { _id: eventId, availableSeats: { $gte: 1 } },
      { $inc: { availableSeats: -1 } },
      { new: true }
  );

  // If no seats, push to Waitlist
  if (!ev) {
      const waitlistEv = await Event.findById(eventId);
      if (!waitlistEv) return res.status(404).json({ msg: 'Event not found' });
      
      if (waitlistEv.waitlist.includes(req.user._id)) {
          return res.status(400).json({ msg: 'You are already on the waitlist.' });
      }

      waitlistEv.waitlist.push(req.user._id);
      await waitlistEv.save();
      return res.json({ msg: 'Event is full! You have been added to the waitlist.', waitlisted: true });
  }

  // Seat secured, generate QR Code
  const qrData = JSON.stringify({ userId: req.user._id, eventId });
  const qrCodeUrl = await QRCode.toDataURL(qrData);

  const totalPrice = ev.price || 0;
  
  const booking = await Booking.create({ 
      user: req.user._id, 
      event: eventId, 
      tickets: 1, 
      totalPrice,
      department,
      phoneNumber,
      qrCode: qrCodeUrl,
      paymentStatus: 'completed' // Mocking successful payment
  });

  // Dispatch Confirmation Email (in background to prevent blocking)
  sendConfirmationEmail({
      userEmail: req.user.email,
      userName: req.user.name,
      eventTitle: ev.title,
      eventDate: ev.date,
      eventLocation: ev.location,
      tickets: 1,
      qrCode: qrCodeUrl
  });

  res.json({ msg: 'Successfully registered!', booking }); 
});

// student sees own bookings
router.get('/my', protect, async (req, res) => {
  if (req.user.role !== 'student') return res.status(403).json({ msg: 'Only students can view bookings' });
  const bookings = await Booking.find({ user: req.user._id }).populate('event').sort({ createdAt: -1 });
  res.json(bookings);
});

// Cancel booking & trigger waitlist shift
router.delete('/cancel/:id', protect, validateObjectId, async (req, res) => {
    if (req.user.role !== 'student') return res.status(403).json({ msg: 'Unauthorized' });

    const booking = await Booking.findOne({ _id: req.params.id, user: req.user._id });
    if (!booking) return res.status(404).json({ msg: 'Booking not found' });

    const eventId = booking.event;
    await Booking.deleteOne({ _id: booking._id });

    const ev = await Event.findById(eventId);
    if (ev && ev.waitlist.length > 0) {
        // Shift first person off waitlist
        const nextUserId = ev.waitlist.shift();
        const nextUser = await User.findById(nextUserId);
        
        // Generate QR and create booking for them
        const qrData = JSON.stringify({ userId: nextUser._id, eventId: ev._id });
        const qrCodeUrl = await QRCode.toDataURL(qrData);

        await Booking.create({
            user: nextUser._id,
            event: ev._id,
            tickets: 1,
            totalPrice: ev.price || 0,
            department: "Unknown", // Needs manual update
            phoneNumber: "Unknown",
            qrCode: qrCodeUrl,
            paymentStatus: ev.price > 0 ? 'pending' : 'completed'
        });

        await ev.save(); // save waitlist pop

        // Dispatch Confirmation Email (in background to prevent blocking)
        sendConfirmationEmail({
            userEmail: nextUser.email,
            userName: nextUser.name,
            eventTitle: ev.title,
            eventDate: ev.date,
            eventLocation: ev.location,
            tickets: 1,
            qrCode: qrCodeUrl
        });
    } else if (ev) {
        // No one on waitlist, just restore the seat
        ev.availableSeats += 1;
        await ev.save();
    }

    res.json({ msg: 'Booking cancelled successfully.' });
});

// Organizer scan QR code
router.post('/scan/:id', protect, validateObjectId, async (req, res) => {
    if (req.user.role !== 'organizer') return res.status(403).json({ msg: 'Only organizers can scan' });

    const booking = await Booking.findById(req.params.id).populate('event');
    if (!booking) return res.status(404).json({ msg: 'Booking not found' });

    if (booking.event.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({ msg: 'Not authorized for this event' });
    }

    if (booking.attended) return res.status(400).json({ msg: 'Ticket has already been scanned!' });

    booking.attended = true;
    await booking.save();
    res.json({ msg: 'Ticket verified! Student marked as attended.' });
});

// Organizer sees aggregated summary (Fixes O(N) memory crash)
router.get('/event-bookings', protect, async (req, res) => {
  if (req.user.role !== 'organizer') return res.status(403).json({ msg: 'Only organizers can view registrations' });
  
  const summary = await Event.aggregate([
      { $match: { createdBy: req.user._id } },
      { 
          $lookup: {
              from: 'bookings',
              localField: '_id',
              foreignField: 'event',
              as: 'bookingsList'
          }
      },
      {
          $project: {
              event: "$$ROOT",
              registrations: { $size: "$bookingsList" }
          }
      }
  ]);

  res.json(summary);
});

module.exports = router;