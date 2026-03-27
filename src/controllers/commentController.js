const Comment = require('../models/Comment');
const Post = require('../models/Post');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get comments for a post
// @route   GET /api/posts/:postId/comments
// @access  Public
exports.getComments = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.postId);
  if (!post) return next(new ErrorResponse('Post not found', 404));

  const [topLevelComments, replies] = await Promise.all([
    Comment.find({ post: req.params.postId, parentComment: null })
      .populate('author', 'name avatar')
      .sort({ createdAt: -1 }),
    Comment.find({ post: req.params.postId, parentComment: { $ne: null } })
      .populate('author', 'name avatar')
      .sort({ createdAt: 1 }),
  ]);

  // Group replies by their parentComment id
  const replyMap = {};
  replies.forEach((reply) => {
    const parentId = reply.parentComment.toString();
    if (!replyMap[parentId]) replyMap[parentId] = [];
    replyMap[parentId].push(reply);
  });

  // Attach replies to their parent comments
  const comments = topLevelComments.map((comment) => {
    const commentObj = comment.toObject();
    commentObj.replies = replyMap[comment._id.toString()] || [];
    return commentObj;
  });

  res.status(200).json({ success: true, count: comments.length, data: comments });
});

// @desc    Add comment to a post
// @route   POST /api/posts/:postId/comments
// @access  Private
exports.addComment = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.postId);
  if (!post) return next(new ErrorResponse('Post not found', 404));

  const comment = await Comment.create({
    content: req.body.content,
    author: req.user.id,
    post: req.params.postId,
    parentComment: req.body.parentComment || null,
  });

  await comment.populate('author', 'name avatar');
  res.status(201).json({ success: true, data: comment });
});

// @desc    Delete comment
// @route   DELETE /api/comments/:id
// @access  Private (owner or admin)
exports.deleteComment = asyncHandler(async (req, res, next) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) return next(new ErrorResponse('Comment not found', 404));

  if (comment.author.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to delete this comment', 403));
  }

  // Also delete child replies
  await Comment.deleteMany({ parentComment: comment._id });
  await Comment.findByIdAndDelete(req.params.id);

  res.status(200).json({ success: true, data: {} });
});

// @desc    Update comment
// @route   PUT /api/comments/:id
// @access  Private (owner only)
exports.updateComment = asyncHandler(async (req, res, next) => {
  let comment = await Comment.findById(req.params.id);
  if (!comment) return next(new ErrorResponse('Comment not found', 404));

  if (comment.author.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized to update this comment', 403));
  }

  comment = await Comment.findByIdAndUpdate(
    req.params.id,
    { content: req.body.content },
    { new: true, runValidators: true }
  ).populate('author', 'name avatar');

  res.status(200).json({ success: true, data: comment });
});
