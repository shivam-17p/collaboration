const Note = require('../models/Note');
const User = require('../models/User');

// @desc    Fetch all notes
// @route   GET /api/notes
// @access  Public
const getNotes = async (req, res) => {
  try {
    const { subject, semester, search } = req.query;
    let query = {};

    if (subject && subject !== 'All Subjects') {
      query.subject = subject;
    }
    if (semester && semester !== 'All Semesters') {
      query.semester = semester;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const notes = await Note.find(query)
      .populate('uploadedBy', 'name avatar')
      .sort({ createdAt: -1 });

    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Upload a note
// @route   POST /api/notes
// @access  Private
const createNote = async (req, res) => {
  try {
    const { title, description, subject, semester, tags } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }

    const parsedTags = tags ? (Array.isArray(tags) ? tags : JSON.parse(tags)) : [];

    const note = new Note({
      title,
      description,
      subject,
      semester,
      tags: parsedTags,
      fileUrl: `/uploads/${req.file.filename}`,
      uploadedBy: req.user._id
    });

    const createdNote = await note.save();
    
    const populatedNote = await Note.findById(createdNote._id).populate('uploadedBy', 'name avatar');

    res.status(201).json(populatedNote);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Delete a note
// @route   DELETE /api/notes/:id
// @access  Private
const deleteNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (note) {
      if (note.uploadedBy.toString() === req.user._id.toString() || req.user.role === 'admin') {
        await Note.findByIdAndDelete(req.params.id);
        res.json({ message: 'Note removed' });
      } else {
        res.status(401).json({ message: 'User not authorized to delete this note' });
      }
    } else {
      res.status(404).json({ message: 'Note not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Upvote a note (Toggle)
// @route   POST /api/notes/:id/upvote
// @access  Private
const upvoteNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (note) {
      const alreadyUpvoted = note.upvotedBy.some(id => id.toString() === req.user._id.toString());
      
      if (alreadyUpvoted) {
        // Unlike
        note.upvotes = Math.max(0, note.upvotes - 1);
        note.upvotedBy = note.upvotedBy.filter(id => id.toString() !== req.user._id.toString());
      } else {
        // Like
        note.upvotes += 1;
        note.upvotedBy.push(req.user._id);
      }
      
      await note.save();
      res.json({ upvotes: note.upvotes, isUpvoted: !alreadyUpvoted });
    } else {
      res.status(404).json({ message: 'Note not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Track a download
// @route   POST /api/notes/:id/download
// @access  Private
const trackDownload = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    const user = await User.findById(req.user._id);

    if (note && user) {
      if (!note.downloadedBy.includes(req.user._id)) {
        note.downloadedBy.push(req.user._id);
        await note.save();
      }

      const historyIdx = user.downloadHistory.findIndex(h => h.note.toString() === req.params.id);
      if (historyIdx !== -1) {
        user.downloadHistory[historyIdx].downloadedAt = Date.now();
      } else {
        user.downloadHistory.push({ note: req.params.id });
      }
      await user.save();

      res.json({ message: 'Download tracked' });
    } else {
      res.status(404).json({ message: 'Note or User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Save / unsave a note (toggle)
// @route   POST /api/notes/:id/save
// @access  Private
const toggleSaveNote = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const noteId = req.params.id;

    const idx = user.savedNotes.findIndex(id => id.toString() === noteId);
    if (idx === -1) {
      user.savedNotes.push(noteId);
    } else {
      user.savedNotes.splice(idx, 1);
    }
    await user.save();

    res.json({ saved: idx === -1, savedNotes: user.savedNotes });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get notes activity for the logged-in user
const getNotesActivity = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: 'savedNotes',
        populate: { path: 'uploadedBy', select: 'name avatar' }
      })
      .populate({
        path: 'downloadHistory.note',
        populate: { path: 'uploadedBy', select: 'name avatar' }
      });

    const uploaded = await Note.find({ uploadedBy: req.user._id })
      .populate('uploadedBy', 'name avatar')
      .sort({ createdAt: -1 });

    const downloaded = await Note.find({ downloadedBy: req.user._id })
      .populate('uploadedBy', 'name avatar')
      .sort({ createdAt: -1 });

    res.json({
      uploaded,
      downloaded,
      saved: user.savedNotes,
      downloadHistory: user.downloadHistory.map(h => ({
        ...h.note.toObject(),
        downloadedAt: h.downloadedAt
      })).sort((a, b) => b.downloadedAt - a.downloadedAt)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = { 
  getNotes, 
  createNote, 
  deleteNote, 
  upvoteNote, 
  trackDownload, 
  toggleSaveNote, 
  getNotesActivity 
};
