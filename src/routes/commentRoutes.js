const express = require('express');
const { deleteComment, updateComment } = require('../controllers/commentController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/:id').put(protect, updateComment).delete(protect, deleteComment);

module.exports = router;
