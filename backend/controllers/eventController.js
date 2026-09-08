const Event = require('../models/Event');
const User = require('../models/User');

// @desc    Fetch all events
// @route   GET /api/events
// @access  Public
const getEvents = async (req, res) => {
  try {
    const events = await Event.find({})
      .populate('organizer', 'name avatar')
      .sort({ date: 1 });
    
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Create an event
// @route   POST /api/events
// @access  Private/Admin
const createEvent = async (req, res) => {
  try {
    const { title, description, date, time, venue, image } = req.body;

    const event = new Event({
      title,
      description,
      date,
      time,
      venue,
      image: image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
      organizer: req.user._id
    });

    const createdEvent = await event.save();
    const populatedEvent = await Event.findById(createdEvent._id).populate('organizer', 'name avatar');
    
    res.status(201).json(populatedEvent);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Delete an event
// @route   DELETE /api/events/:id
// @access  Private/Admin
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (event) {
      await Event.findByIdAndDelete(req.params.id);
      // Optional: Cleanup user registrations for this event
      await User.updateMany(
        { 'eventRegistrations.event': req.params.id },
        { $pull: { eventRegistrations: { event: req.params.id } } }
      );
      res.json({ message: 'Event removed' });
    } else {
      res.status(404).json({ message: 'Event not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    RSVP to an event
// @route   POST /api/events/:id/rsvp
// @access  Private
const rsvpEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    const user = await User.findById(req.user._id);

    if (event && user) {
      const isAttending = event.attendees.includes(req.user._id);
      
      if (isAttending) {
        event.attendees = event.attendees.filter(id => id.toString() !== req.user._id.toString());
        user.eventRegistrations = user.eventRegistrations.filter(reg => reg.event.toString() !== req.params.id);
      } else {
        event.attendees.push(req.user._id);
        const registrationId = `EVT-${Math.floor(100000 + Math.random() * 900000)}`;
        user.eventRegistrations.push({
          event: event._id,
          registrationId,
          status: 'registered'
        });
      }
      
      await event.save();
      await user.save();
      
      res.json({ 
        attendeesCount: event.attendees.length, 
        isAttending: !isAttending,
        registration: user.eventRegistrations.find(reg => reg.event.toString() === req.params.id)
      });
    } else {
      res.status(404).json({ message: 'Event or User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Cancel RSVP
const cancelRsvp = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    const user = await User.findById(req.user._id);

    if (event && user) {
      event.attendees = event.attendees.filter(id => id.toString() !== req.user._id.toString());
      user.eventRegistrations = user.eventRegistrations.filter(reg => reg.event.toString() !== req.params.id);
      
      await event.save();
      await user.save();
      
      res.json({ message: 'Registration cancelled successfully' });
    } else {
      res.status(404).json({ message: 'Registration not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get user registered events
const getUserEvents = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: 'eventRegistrations.event',
        populate: { path: 'organizer', select: 'name avatar' }
      });

    if (!user) return res.status(404).json({ message: 'User not found' });

    const now = new Date();
    const registrations = user.eventRegistrations.filter(reg => reg.event);
    
    const upcoming = registrations.filter(reg => new Date(reg.event.date) >= now);
    const past = registrations.filter(reg => new Date(reg.event.date) < now);

    res.json({ upcoming, past, all: registrations });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = { getEvents, createEvent, deleteEvent, rsvpEvent, cancelRsvp, getUserEvents };
