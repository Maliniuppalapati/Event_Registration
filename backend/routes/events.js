const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const Booking = require('../models/Booking'); 
const { protect } = require('../middleware/authMiddleware');
const validateObjectId = require('../middleware/validateObjectId');
const { Parser } = require('json2csv');

// list all events
router.get('/', async (req, res) => {
  const events = await Event.find().sort({ date: 1 });
  res.json(events);
});

// create event (organizer only)
router.post('/add', protect, async (req, res) => {
  if (req.user.role !== 'organizer') return res.status(403).json({ msg: 'Not allowed' });
  const { title, description, date, time, location, totalSeats, price, image } = req.body;
  if (!title || !date || totalSeats === undefined) {
      return res.status(400).json({ msg: 'Title, date, and totalSeats are required' });
  }
  const ev = await Event.create({
    title, description, date, time, location,
    totalSeats, availableSeats: totalSeats, price, image, createdBy: req.user._id
  });
  res.json(ev);
});

// Get detailed list of registrations for an event
router.get('/registrations/:eventId', protect, validateObjectId, async (req, res) => {
    if (req.user.role !== 'organizer') return res.status(403).json({ msg: 'Not authorized.' });

    const event = await Event.findById(req.params.eventId).populate('waitlist', 'name email');
    if (!event) return res.status(404).json({ msg: 'Event not found' });
    if (event.createdBy.toString() !== req.user._id.toString()) return res.status(403).json({ msg: 'Not authorized to view details for this event.' });

    const registrations = await Booking.find({ event: req.params.eventId })
        .populate({ path: 'user', select: 'name email' })
        .select('user department phoneNumber tickets createdAt attended paymentStatus qrCode'); 
        
    res.json({ eventTitle: event.title, registrations, waitlist: event.waitlist });
});

// Export to CSV
router.get('/export/:eventId', protect, validateObjectId, async (req, res) => {
    if (req.user.role !== 'organizer') return res.status(403).json({ msg: 'Not authorized.' });

    const event = await Event.findById(req.params.eventId);
    if (!event) return res.status(404).json({ msg: 'Event not found' });
    if (event.createdBy.toString() !== req.user._id.toString()) return res.status(403).json({ msg: 'Not authorized' });

    const bookings = await Booking.find({ event: req.params.eventId }).populate('user', 'name email');
    
    const csvData = bookings.map(b => ({
        BookingID: b._id.toString(),
        Name: b.user?.name || 'Unknown',
        Email: b.user?.email || 'Unknown',
        Department: b.department,
        Phone: b.phoneNumber,
        Attended: b.attended ? 'Yes' : 'No',
        PaymentStatus: b.paymentStatus,
        BookedAt: b.createdAt
    }));

    if (csvData.length === 0) return res.status(400).json({ msg: 'No bookings to export' });

    const json2csvParser = new Parser();
    const csv = json2csvParser.parse(csvData);

    res.header('Content-Type', 'text/csv');
    res.attachment(`${event.title}_attendees.csv`);
    return res.send(csv);
});

// DELETE event
router.delete('/:id', protect, validateObjectId, async (req, res) => {
    if (req.user.role !== 'organizer') return res.status(403).json({ msg: 'Not authorized' });
    
    const ev = await Event.findById(req.params.id);
    if (!ev) return res.status(404).json({ msg: 'Event not found' });
    if (ev.createdBy.toString() !== req.user._id.toString()) return res.status(403).json({ msg: 'Not authorized' });

    await Event.deleteOne({ _id: req.params.id });
    await Booking.deleteMany({ event: req.params.id });
    
    res.json({ msg: 'Event and all associated bookings deleted successfully' });
});

module.exports = router;