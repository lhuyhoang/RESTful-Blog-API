const Category = require('../models/Category');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Lấy danh sách danh mục
// @route   GET /api/categories
// @access  Công khai
exports.getCategories = asyncHandler(async (req, res, next) => {
  const categories = await Category.find().populate('postCount').sort({ name: 1 });
  res.status(200).json({ success: true, count: categories.length, data: categories });
});

// @desc    Lấy chi tiết danh mục theo slug
// @route   GET /api/categories/:slug
// @access  Công khai
exports.getCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findOne({ slug: req.params.slug }).populate('postCount');
  if (!category) return next(new ErrorResponse('Không tìm thấy danh mục', 404));
  res.status(200).json({ success: true, data: category });
});

// @desc    Tạo danh mục mới
// @route   POST /api/categories
// @access  Riêng tư (chỉ admin)
exports.createCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.create(req.body);
  res.status(201).json({ success: true, data: category });
});

// @desc    Cập nhật danh mục
// @route   PUT /api/categories/:id
// @access  Riêng tư (chỉ admin)
exports.updateCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!category) return next(new ErrorResponse('Không tìm thấy danh mục', 404));
  res.status(200).json({ success: true, data: category });
});

// @desc    Xóa danh mục
// @route   DELETE /api/categories/:id
// @access  Riêng tư (chỉ admin)
exports.deleteCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);
  if (!category) return next(new ErrorResponse('Không tìm thấy danh mục', 404));
  await Category.findByIdAndDelete(req.params.id);
  res.status(200).json({ success: true, data: {} });
});
