const Post = require('../models/Post');
const Comment = require('../models/Comment');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all posts
// @route   GET /api/posts
// @access  Public
exports.getPosts = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const query = { status: 'published' };

  if (req.query.category) query.category = req.query.category;
  if (req.query.tag) query.tags = { $in: [req.query.tag] };
  if (req.query.author) query.author = req.query.author;
  if (req.query.search) query.$text = { $search: req.query.search };

  const total = await Post.countDocuments(query);
  const posts = await Post.find(query)
    .populate('author', 'name avatar')
    .populate('category', 'name slug')
    .populate('commentCount')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    success: true,
    count: posts.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: posts,
  });
});

// @desc    Get single post by slug
// @route   GET /api/posts/:slug
// @access  Public
exports.getPost = asyncHandler(async (req, res, next) => {
  const post = await Post.findOne({ slug: req.params.slug })
    .populate('author', 'name avatar bio')
    .populate('category', 'name slug')
    .populate('commentCount');

  if (!post) return next(new ErrorResponse(`Post not found with slug '${req.params.slug}'`, 404));

  // Increment view count
  await Post.findByIdAndUpdate(post._id, { $inc: { views: 1 } });

  res.status(200).json({ success: true, data: post });
});

// @desc    Create post
// @route   POST /api/posts
// @access  Private
exports.createPost = asyncHandler(async (req, res, next) => {
  req.body.author = req.user.id;
  const post = await Post.create(req.body);
  res.status(201).json({ success: true, data: post });
});

// @desc    Update post
// @route   PUT /api/posts/:id
// @access  Private (owner or admin)
exports.updatePost = asyncHandler(async (req, res, next) => {
  let post = await Post.findById(req.params.id);
  if (!post) return next(new ErrorResponse(`Post not found`, 404));

  // Check ownership
  if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to update this post', 403));
  }

  post = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  res.status(200).json({ success: true, data: post });
});

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private (owner or admin)
exports.deletePost = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  if (!post) return next(new ErrorResponse(`Post not found`, 404));

  if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to delete this post', 403));
  }

  await Post.findByIdAndDelete(req.params.id);
  // Delete associated comments
  await Comment.deleteMany({ post: req.params.id });

  res.status(200).json({ success: true, data: {} });
});

// @desc    Toggle like on post
// @route   PUT /api/posts/:id/like
// @access  Private
exports.likePost = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  if (!post) return next(new ErrorResponse(`Post not found`, 404));

  const alreadyLiked = post.likes.some((id) => id.toString() === req.user.id);
  const update = alreadyLiked
    ? { $pull: { likes: req.user.id } }
    : { $addToSet: { likes: req.user.id } };

  const updated = await Post.findByIdAndUpdate(req.params.id, update, { new: true });
  res.status(200).json({ success: true, liked: !alreadyLiked, likeCount: updated.likes.length });
});
