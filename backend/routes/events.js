// C:\Users\U GEYA MALINI\OneDrive\文件\Event_Registration\backend\routes\events.js

const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const Booking = require('../models/Booking'); 
const { protect } = require('../middleware/authMiddleware');

// list all events
router.get('/', async (req, res) => {
  const events = await Event.find().sort({ date: 1 });
  res.json(events);
});

// create event (organizer only)
router.post('/add', protect, async (req, res) => {
  if (req.user.role !== 'organizer') return res.status(403).json({ msg: 'Not allowed' });
  const { title, description, date, time, location, totalSeats, price, image } = req.body;
  const ev = await Event.create({
    title, description, date, time, location,
    totalSeats, availableSeats: totalSeats, price, image, createdBy: req.user._id
  });
  res.json(ev);
});

// ✅ FINAL CORRECTION: Get detailed list of registrations for an event
router.get('/registrations/:eventId', protect, async (req, res) => {
    if (req.user.role !== 'organizer') {
        return res.status(403).json({ msg: 'Not authorized.' });
    }

    try {
        const { eventId } = req.params;
        const event = await Event.findById(eventId);

        if (!event) return res.status(404).json({ msg: 'Event not found' });

        // Ensure the organizer created this event (req.user.id is a string/ObjectId)
        if (event.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ msg: 'Not authorized to view details for this event.' });
        }

        // 🛑 CRITICAL FIX: The query must select all necessary fields from BOTH models.
        // 1. We find all bookings for the event.
        // 2. We populate the 'user' field to get name and email from the User collection.
        // 3. We select the populated 'user' object and the registration-specific fields (department, phoneNumber) from the Booking collection.
        const registrations = await Booking.find({ event: eventId })
            .populate({
                path: 'user',
                select: 'name email' 
            })
            .select('user department phoneNumber tickets createdAt'); 
            
        res.json({ eventTitle: event.title, registrations });

    } catch (err) {
        console.error('Registration details error:', err);
        res.status(500).json({ msg: 'Internal server error fetching registration details.' });
    }
});


// DELETE event (organizer only, and must be the creator)
router.delete('/:id', protect, async (req, res) => {
    if (req.user.role !== 'organizer') {
        return res.status(403).json({ msg: 'Not authorized to delete events' });
    }
    
    try {
        const eventId = req.params.id;
        const ev = await Event.findById(eventId);
        
        if (!ev) {
            return res.status(404).json({ msg: 'Event not found' });
        }

        if (ev.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ msg: 'Not authorized to delete this specific event' });
        }

        await Event.deleteOne({ _id: eventId });
        await Booking.deleteMany({ event: eventId });
        
        res.json({ msg: 'Event and all associated bookings deleted successfully' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error during event deletion' });
    }
});

module.exports = router;