const Discussion = require('../models/Discussion');

// @desc    Fetch all discussions
// @route   GET /api/discussions
// @access  Public
const getDiscussions = async (req, res) => {
  try {
    const discussions = await Discussion.find({})
      .populate('author', 'name avatar')
      .populate('replies.author', 'name avatar')
      .sort({ isPinned: -1, createdAt: -1 });
    
    res.json(discussions);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Create a discussion
// @route   POST /api/discussions
// @access  Private
const createDiscussion = async (req, res) => {
  try {
    const { title, content, tags } = req.body;

    const discussion = new Discussion({
      title,
      content,
      tags,
      author: req.user._id
    });

    const createdDiscussion = await discussion.save();
    const populatedDiscussion = await Discussion.findById(createdDiscussion._id).populate('author', 'name avatar');
    
    res.status(201).json(populatedDiscussion);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Reply to a discussion
// @route   POST /api/discussions/:id/reply
// @access  Private
const replyToDiscussion = async (req, res) => {
  try {
    const { content } = req.body;
    const discussion = await Discussion.findById(req.params.id);

    if (discussion) {
      const reply = {
        content,
        author: req.user._id
      };

      discussion.replies.push(reply);
      await discussion.save();

      const updatedDiscussion = await Discussion.findById(req.params.id)
        .populate('author', 'name avatar')
        .populate('replies.author', 'name avatar');

      res.status(201).json(updatedDiscussion);
    } else {
      res.status(404).json({ message: 'Discussion not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Like or Unlike a discussion
// @route   POST /api/discussions/:id/like
// @access  Private
const likeDiscussion = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);

    if (discussion) {
      const index = discussion.likedBy.findIndex(id => id.toString() === req.user._id.toString());
      
      if (index !== -1) {
        // User already liked, so unlike
        discussion.likes -= 1;
        discussion.likedBy.splice(index, 1);
      } else {
        // User hasn't liked, so like
        discussion.likes += 1;
        discussion.likedBy.push(req.user._id);
      }
      
      await discussion.save();
      res.json({ likes: discussion.likes, likedBy: discussion.likedBy });
    } else {
      res.status(404).json({ message: 'Discussion not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Delete a reply
// @route   DELETE /api/discussions/:id/reply/:replyId
// @access  Private
const deleteReply = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);

    if (discussion) {
      const reply = discussion.replies.id(req.params.replyId);
      
      if (!reply) {
        return res.status(404).json({ message: 'Reply not found' });
      }

      // Check if user is the author of the reply
      if (reply.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(401).json({ message: 'Not authorized to delete this reply' });
      }

      reply.deleteOne();
      await discussion.save();

      const updatedDiscussion = await Discussion.findById(req.params.id)
        .populate('author', 'name avatar')
        .populate('replies.author', 'name avatar');

      res.json(updatedDiscussion);
    } else {
      res.status(404).json({ message: 'Discussion not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Delete a discussion
// @route   DELETE /api/discussions/:id
// @access  Private
const deleteDiscussion = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);

    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    // Check if user is the author of the discussion
    if (discussion.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized to delete this discussion' });
    }

    await discussion.deleteOne();
    res.json({ message: 'Discussion removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Edit a discussion
// @route   PUT /api/discussions/:id
// @access  Private
const editDiscussion = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);

    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    if (discussion.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized to edit this discussion' });
    }

    const { title, content, tags } = req.body;
    if (title !== undefined) discussion.title = title;
    if (content !== undefined) discussion.content = content;
    if (tags !== undefined) discussion.tags = tags;

    await discussion.save();

    const updated = await Discussion.findById(req.params.id)
      .populate('author', 'name avatar')
      .populate('replies.author', 'name avatar');

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Edit a reply
// @route   PUT /api/discussions/:id/reply/:replyId
// @access  Private
const editReply = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);

    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    const reply = discussion.replies.id(req.params.replyId);

    if (!reply) {
      return res.status(404).json({ message: 'Reply not found' });
    }

    if (reply.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized to edit this reply' });
    }

    reply.content = req.body.content || reply.content;
    await discussion.save();

    const updated = await Discussion.findById(req.params.id)
      .populate('author', 'name avatar')
      .populate('replies.author', 'name avatar');

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = { getDiscussions, createDiscussion, replyToDiscussion, likeDiscussion, deleteReply, deleteDiscussion, editDiscussion, editReply };
