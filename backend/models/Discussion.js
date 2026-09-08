const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
  content: { type: String, required: true },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  }
}, { timestamps: true });

const discussionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  tags: [{ type: String }],
  replies: [replySchema],
  likes: { type: Number, default: 0 },
  likedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isPinned: { type: Boolean, default: false }
}, {
  timestamps: true
});

const Discussion = mongoose.model('Discussion', discussionSchema);
module.exports = Discussion;
