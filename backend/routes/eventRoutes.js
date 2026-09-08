const express = require('express');
const router = express.Router();
const { getEvents, createEvent, rsvpEvent, cancelRsvp, getUserEvents, deleteEvent } = require('../controllers/eventController');
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../utils/multer');

router.route('/')
  .get(getEvents)
  .post(protect, admin, createEvent);

router.get('/user-registrations', protect, getUserEvents);

router.route('/:id')
  .delete(protect, admin, deleteEvent);

router.route('/:id/rsvp')
  .post(protect, rsvpEvent)
  .delete(protect, cancelRsvp);

// Event image upload route
router.post('/upload-image', protect, admin, upload.single('image'), (req, res) => {
  if (req.file) {
    res.json({ url: `/uploads/${req.file.filename}` });
  } else {
    res.status(400).json({ message: 'No file uploaded' });
  }
});

module.exports = router;
