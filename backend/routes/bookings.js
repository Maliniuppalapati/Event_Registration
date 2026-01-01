// backend/routes/bookings.js

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Event = require('../models/Event');
const Booking = require('../models/Booking');
const User = require('../models/User'); 
// const { sendConfirmationEmail } = require('../utils/email'); // 🛑 REMOVED/COMMENTED OUT

// student books event
router.post('/book', protect, async (req, res) => {
  if (req.user.role !== 'student') return res.status(403).json({ msg: 'Only students can book events' });
  
  const { eventId, department, phoneNumber } = req.body; 
  const ticketsNum = 1; 

  if (!department || !phoneNumber) return res.status(400).json({ msg: 'Department and Phone Number are required.' });

  try {
    const ev = await Event.findById(eventId);
    if (!ev) return res.status(404).json({ msg: 'Event not found' });
    
    // Check for double registration
    const existingBooking = await Booking.findOne({ user: req.user._id, event: eventId });
    if (existingBooking) {
      return res.status(400).json({ msg: 'You are already registered for this event.' });
    }

    // Check seat availability
    if (ev.availableSeats < ticketsNum) return res.status(400).json({ msg: 'Not enough seats available' });

    const totalPrice = (ev.price || 0) * ticketsNum;
    
    // Create booking, saving new fields
    const booking = await Booking.create({ 
        user: req.user._id, 
        event: eventId, 
        tickets: ticketsNum, 
        totalPrice: totalPrice,
        department, // Save new fields
        phoneNumber, // Save new fields
    });

    // Decrement available seats
    ev.availableSeats -= ticketsNum;
    await ev.save();

    // 🛑 EMAIL SECTION REMOVED/COMMENTED OUT: 
    /*
    const user = await User.findById(req.user._id);
    if (user) {
        await sendConfirmationEmail({
            userEmail: user.email,
            userName: user.name,
            eventTitle: ev.title,
            eventDate: ev.date,
            eventTime: ev.time,
            eventLocation: ev.location,
            tickets: ticketsNum,
            totalPrice: totalPrice,
            department: department,
            phoneNumber: phoneNumber
        });
    }
    */

    // 🛑 CHANGE SUCCESS MESSAGE HERE:
    res.json({ msg: 'Successfully registered!', booking }); 
  } catch (err) {
    console.error('Booking error:', err);
    res.status(500).json({ msg: 'Server error during booking' });
  }
});

// student sees own bookings
router.get('/my', protect, async (req, res) => {
  if (req.user.role !== 'student') return res.status(403).json({ msg: 'Only students can view bookings' });
  const bookings = await Booking.find({ user: req.user._id }).populate('event').sort({ createdAt: -1 });
  res.json(bookings);
});

// organizer sees bookings per their events
router.get('/event-bookings', protect, async (req, res) => {
  if (req.user.role !== 'organizer') return res.status(403).json({ msg: 'Only organizers can view registrations' });
  
  const events = await Event.find({ createdBy: req.user._id });
  
  const bookings = await Booking.find({ event: { $in: events.map(e => e._id) } })
    .populate('event')
    .populate('user');

  const summary = events.map(event => {
    const registrations = bookings
      .filter(b => b.event._id.toString() === event._id.toString())
      .reduce((total, booking) => total + booking.tickets, 0);

    return {
      event: event,
      registrations: registrations,
    };
  });

  res.json(summary);
});

module.exports = router;