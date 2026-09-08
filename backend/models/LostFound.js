const mongoose = require('mongoose');

const lostFoundSchema = new mongoose.Schema({
  itemName: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  image: { type: String },
  location: { type: String, required: true },
  status: { type: String, enum: ['lost', 'found', 'claimed'], default: 'lost' },
  contactInfo: { type: String, required: true },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  }
}, {
  timestamps: true
});

const LostFound = mongoose.model('LostFound', lostFoundSchema);
module.exports = LostFound;
