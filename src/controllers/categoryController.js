const Category = require('../models/Category');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
exports.getCategories = asyncHandler(async (req, res, next) => {
  const categories = await Category.find().populate('postCount').sort({ name: 1 });
  res.status(200).json({ success: true, count: categories.length, data: categories });
});

// @desc    Get single category by slug
// @route   GET /api/categories/:slug
// @access  Public
exports.getCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findOne({ slug: req.params.slug }).populate('postCount');
  if (!category) return next(new ErrorResponse('Category not found', 404));
  res.status(200).json({ success: true, data: category });
});

// @desc    Create category
// @route   POST /api/categories
// @access  Private (admin only)
exports.createCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.create(req.body);
  res.status(201).json({ success: true, data: category });
});

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private (admin only)
exports.updateCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!category) return next(new ErrorResponse('Category not found', 404));
  res.status(200).json({ success: true, data: category });
});

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private (admin only)
exports.deleteCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);
  if (!category) return next(new ErrorResponse('Category not found', 404));
  await Category.findByIdAndDelete(req.params.id);
  res.status(200).json({ success: true, data: {} });
});
