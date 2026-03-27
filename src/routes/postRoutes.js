const express = require('express');
const {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  likePost,
} = require('../controllers/postController');
const { getComments, addComment } = require('../controllers/commentController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/').get(getPosts).post(protect, createPost);
router.route('/:id').put(protect, updatePost).delete(protect, deletePost);
router.get('/:slug', getPost);
router.put('/:id/like', protect, likePost);

// Comment sub-routes
router.route('/:postId/comments').get(getComments).post(protect, addComment);

module.exports = router;
