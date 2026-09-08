const Note = require('../models/Note');
const Discussion = require('../models/Discussion');
const Event = require('../models/Event');
const User = require('../models/User');

// @desc    Get dashboard stats
// @route   GET /api/dashboard/stats
// @access  Private
const getDashboardStats = async (req, res) => {
  try {
    const notesCount = await Note.countDocuments();
    const discussionsCount = await Discussion.countDocuments();
    const eventsCount = await Event.countDocuments({ date: { $gte: new Date() } });
    
    // Calculate total downloads across all notes
    const result = await Note.aggregate([
      { $group: { _id: null, totalDownloads: { $sum: "$downloads" } } }
    ]);
    const totalDownloads = result.length > 0 ? result[0].totalDownloads : 0;

    res.json({
      totalNotes: notesCount,
      totalDownloads,
      activeDiscussions: discussionsCount,
      upcomingEvents: eventsCount
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = { getDashboardStats };
