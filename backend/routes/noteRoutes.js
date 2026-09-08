const express = require('express');
const router = express.Router();
const { getNotes, createNote, deleteNote, upvoteNote, trackDownload, toggleSaveNote, getNotesActivity } = require('../controllers/noteController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../utils/multer');

// Activity — must be before /:id to avoid param collision
router.route('/activity')
  .get(protect, getNotesActivity);

router.route('/')
  .get(getNotes)
  .post(protect, upload.single('file'), createNote);

router.route('/:id')
  .delete(protect, deleteNote);

router.route('/:id/upvote')
  .post(protect, upvoteNote);

router.route('/:id/download')
  .post(protect, trackDownload);

router.route('/:id/save')
  .post(protect, toggleSaveNote);

module.exports = router;
