const Comment = require('../models/Comment');
const Post = require('../models/Post');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Lấy danh sách bình luận của một bài viết
// @route   GET /api/posts/:postId/comments
// @access  Công khai
exports.getComments = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.postId);
  if (!post) return next(new ErrorResponse('Không tìm thấy bài viết', 404));

  const [topLevelComments, replies] = await Promise.all([
    Comment.find({ post: req.params.postId, parentComment: null })
      .populate('author', 'name avatar')
      .sort({ createdAt: -1 }),
    Comment.find({ post: req.params.postId, parentComment: { $ne: null } })
      .populate('author', 'name avatar')
      .sort({ createdAt: 1 }),
  ]);

  // Nhóm các reply theo parentComment id
  const replyMap = {};
  replies.forEach((reply) => {
    const parentId = reply.parentComment.toString();
    if (!replyMap[parentId]) replyMap[parentId] = [];
    replyMap[parentId].push(reply);
  });

  // Gắn replies vào comment cha tương ứng
  const comments = topLevelComments.map((comment) => {
    const commentObj = comment.toObject();
    commentObj.replies = replyMap[comment._id.toString()] || [];
    return commentObj;
  });

  res.status(200).json({ success: true, count: comments.length, data: comments });
});

// @desc    Thêm bình luận vào bài viết
// @route   POST /api/posts/:postId/comments
// @access  Riêng tư
exports.addComment = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.postId);
  if (!post) return next(new ErrorResponse('Không tìm thấy bài viết', 404));

  const comment = await Comment.create({
    content: req.body.content,
    author: req.user.id,
    post: req.params.postId,
    parentComment: req.body.parentComment || null,
  });

  await comment.populate('author', 'name avatar');
  res.status(201).json({ success: true, data: comment });
});

// @desc    Xóa bình luận
// @route   DELETE /api/comments/:id
// @access  Riêng tư (chủ sở hữu hoặc admin)
exports.deleteComment = asyncHandler(async (req, res, next) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) return next(new ErrorResponse('Không tìm thấy bình luận', 404));

  if (comment.author.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Bạn không có quyền xóa bình luận này', 403));
  }

  // Xóa cả các reply con
  await Comment.deleteMany({ parentComment: comment._id });
  await Comment.findByIdAndDelete(req.params.id);

  res.status(200).json({ success: true, data: {} });
});

// @desc    Cập nhật bình luận
// @route   PUT /api/comments/:id
// @access  Riêng tư (chỉ chủ sở hữu)
exports.updateComment = asyncHandler(async (req, res, next) => {
  let comment = await Comment.findById(req.params.id);
  if (!comment) return next(new ErrorResponse('Không tìm thấy bình luận', 404));

  if (comment.author.toString() !== req.user.id) {
    return next(new ErrorResponse('Bạn không có quyền cập nhật bình luận này', 403));
  }

  comment = await Comment.findByIdAndUpdate(
    req.params.id,
    { content: req.body.content },
    { new: true, runValidators: true }
  ).populate('author', 'name avatar');

  res.status(200).json({ success: true, data: comment });
});
