const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const authUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        year: user.year,
        department: user.department,
        college: user.college,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password, year, department, bio, college, role, adminCode } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    let finalRole = 'student';
    if (role === 'admin') {
      if (adminCode === 'shivamashu') {
        finalRole = 'admin';
      } else {
        return res.status(401).json({ message: 'Invalid Admin Secret Code' });
      }
    }

    const user = await User.create({
      name,
      email,
      password,
      year: year || 'N/A',
      department: department || 'N/A',
      bio,
      college: college || 'Campus Collaboration University',
      role: finalRole
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        year: user.year,
        department: user.department,
        college: user.college,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        year: user.year,
        department: user.department,
        college: user.college,
        role: user.role,
        bio: user.bio,
        semester: user.semester,
        cgpa: user.cgpa,
        skills: user.skills,
        clubsJoined: user.clubsJoined,
        certifications: user.certifications,
        areasOfInterest: user.areasOfInterest,
        preferredStudyTopics: user.preferredStudyTopics
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.avatar = req.body.avatar || user.avatar;
      user.bio = req.body.bio || user.bio;
      user.year = req.body.year || user.year;
      user.department = req.body.department || user.department;
      user.college = req.body.college || user.college;
      
      if (req.body.semester) user.semester = req.body.semester;
      if (req.body.cgpa !== undefined) user.cgpa = req.body.cgpa;
      if (req.body.skills !== undefined) user.skills = req.body.skills;
      if (req.body.clubsJoined !== undefined) user.clubsJoined = req.body.clubsJoined;
      if (req.body.certifications !== undefined) user.certifications = req.body.certifications;
      if (req.body.areasOfInterest !== undefined) user.areasOfInterest = req.body.areasOfInterest;
      if (req.body.preferredStudyTopics !== undefined) user.preferredStudyTopics = req.body.preferredStudyTopics;

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
        year: updatedUser.year,
        department: updatedUser.department,
        college: updatedUser.college,
        role: updatedUser.role,
        bio: updatedUser.bio,
        semester: updatedUser.semester,
        cgpa: updatedUser.cgpa,
        skills: updatedUser.skills,
        clubsJoined: updatedUser.clubsJoined,
        certifications: updatedUser.certifications,
        areasOfInterest: updatedUser.areasOfInterest,
        preferredStudyTopics: updatedUser.preferredStudyTopics,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { authUser, registerUser, getUserProfile, updateUserProfile };
