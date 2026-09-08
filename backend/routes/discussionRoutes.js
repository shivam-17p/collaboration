const express = require('express');
const router = express.Router();
const { getDiscussions, createDiscussion, replyToDiscussion, likeDiscussion, deleteReply, deleteDiscussion, editDiscussion, editReply } = require('../controllers/discussionController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(getDiscussions)
  .post(protect, createDiscussion);

router.route('/:id')
  .delete(protect, deleteDiscussion)
  .put(protect, editDiscussion);

router.route('/:id/reply')
  .post(protect, replyToDiscussion);

router.route('/:id/reply/:replyId')
  .delete(protect, deleteReply)
  .put(protect, editReply);

router.route('/:id/like')
  .post(protect, likeDiscussion);

module.exports = router;
