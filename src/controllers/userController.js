const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Lấy danh sách tất cả người dùng
// @route   GET /api/users
// @access  Riêng tư (chỉ admin)
exports.getUsers = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const total = await User.countDocuments();
  const users = await User.find().sort({ createdAt: -1 }).skip(skip).limit(limit);

  res.status(200).json({ success: true, count: users.length, total, page, data: users });
});

// @desc    Lấy thông tin một người dùng
// @route   GET /api/users/:id
// @access  Riêng tư (chỉ admin)
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return next(new ErrorResponse('Không tìm thấy người dùng', 404));
  res.status(200).json({ success: true, data: user });
});

// @desc    Cập nhật thông tin người dùng
// @route   PUT /api/users/:id
// @access  Riêng tư (chỉ admin)
exports.updateUser = asyncHandler(async (req, res, next) => {
  // Không cho phép cập nhật mật khẩu qua route này
  delete req.body.password;

  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!user) return next(new ErrorResponse('Không tìm thấy người dùng', 404));
  res.status(200).json({ success: true, data: user });
});

// @desc    Xóa người dùng
// @route   DELETE /api/users/:id
// @access  Riêng tư (chỉ admin)
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return next(new ErrorResponse('Không tìm thấy người dùng', 404));

  // Admin không thể tự xóa tài khoản của mình
  if (user._id.toString() === req.user.id) {
    return next(new ErrorResponse('Admin không thể tự xóa tài khoản của mình qua route này', 400));
  }

  await User.findByIdAndDelete(req.params.id);
  res.status(200).json({ success: true, data: {} });
});
