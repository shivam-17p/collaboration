const express = require('express');
const router = express.Router();
const { getItems, createItem, markAsClaimed, deleteItem, updateItem } = require('../controllers/lostFoundController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(getItems)
  .post(protect, createItem);

router.route('/:id/claim')
  .put(protect, markAsClaimed);

router.route('/:id')
  .put(protect, updateItem)
  .delete(protect, deleteItem);

module.exports = router;
