const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String, default: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix' },
  year: { type: String, required: true },
  department: { type: String, required: true },
  college: { type: String, default: 'Campus Collaboration University' },
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  bio: { type: String, default: 'Student' },
  semester: { type: String, default: '1st' },
  cgpa: { type: Number, default: 0.0 },
  skills: [{ type: String }],
  clubsJoined: [{ type: String }],
  certifications: [{ type: String }],
  areasOfInterest: [{ type: String }],
  preferredStudyTopics: [{ type: String }],
  savedNotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Note' }],
  downloadHistory: [{
    note: { type: mongoose.Schema.Types.ObjectId, ref: 'Note' },
    downloadedAt: { type: Date, default: Date.now }
  }],
  eventRegistrations: [{
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
    registrationId: { type: String, required: true },
    status: { type: String, enum: ['registered', 'attended', 'cancelled'], default: 'registered' },
    registeredAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

// Match password middleware
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Encrypt password before saving
userSchema.pre('save', async function() {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);
module.exports = User;
