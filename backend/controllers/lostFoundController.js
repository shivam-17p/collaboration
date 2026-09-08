const LostFound = require('../models/LostFound');

// @desc    Fetch all lost and found items
// @route   GET /api/lost-found
// @access  Public
const getItems = async (req, res) => {
  try {
    const items = await LostFound.find({})
      .populate('postedBy', 'name avatar')
      .sort({ createdAt: -1 });
    
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Create a lost/found post
// @route   POST /api/lost-found
// @access  Private
const createItem = async (req, res) => {
  try {
    const { itemName, description, category, location, status, contactInfo } = req.body;

    const item = new LostFound({
      itemName,
      description,
      category,
      location,
      status,
      contactInfo,
      postedBy: req.user._id
    });

    const createdItem = await item.save();
    const populatedItem = await LostFound.findById(createdItem._id).populate('postedBy', 'name avatar');

    res.status(201).json(populatedItem);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Mark item as claimed
// @route   PUT /api/lost-found/:id/claim
// @access  Private
const markAsClaimed = async (req, res) => {
  try {
    const item = await LostFound.findById(req.params.id);

    if (item) {
      if (item.postedBy.toString() === req.user._id.toString() || req.user.role === 'admin') {
        item.status = 'claimed';
        const updatedItem = await item.save();
        res.json(updatedItem);
      } else {
        res.status(401).json({ message: 'User not authorized' });
      }
    } else {
      res.status(404).json({ message: 'Item not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Delete a lost/found post
// @route   DELETE /api/lost-found/:id
// @access  Private
const deleteItem = async (req, res) => {
  try {
    const item = await LostFound.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (item.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized to delete this item' });
    }

    await item.deleteOne();
    res.json({ message: 'Item removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update a lost/found post
// @route   PUT /api/lost-found/:id
// @access  Private
const updateItem = async (req, res) => {
  try {
    const item = await LostFound.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (item.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized to update this item' });
    }

    item.itemName = req.body.itemName || item.itemName;
    item.description = req.body.description || item.description;
    item.category = req.body.category || item.category;
    item.location = req.body.location || item.location;
    item.status = req.body.status || item.status;
    item.contactInfo = req.body.contactInfo || item.contactInfo;

    const updatedItem = await item.save();
    const populatedItem = await LostFound.findById(updatedItem._id).populate('postedBy', 'name avatar');
    
    res.json(populatedItem);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = { getItems, createItem, markAsClaimed, deleteItem, updateItem };
