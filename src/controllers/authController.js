const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');

// Hàm hỗ trợ gửi phản hồi kèm token
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();
  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    },
  });
};

// @desc    Đăng ký người dùng mới
// @route   POST /api/auth/register
// @access  Công khai
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  // Ngăn chặn đăng ký với role admin qua route công khai
  const safeRole = role === 'admin' ? 'user' : role || 'user';

  const user = await User.create({ name, email, password, role: safeRole });
  sendTokenResponse(user, 201, res);
});

// @desc    Đăng nhập
// @route   POST /api/auth/login
// @access  Công khai
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorResponse('Vui lòng cung cấp email và mật khẩu', 400));
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return next(new ErrorResponse('Thông tin đăng nhập không hợp lệ', 401));
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return next(new ErrorResponse('Thông tin đăng nhập không hợp lệ', 401));
  }

  sendTokenResponse(user, 200, res);
});

// @desc    Lấy thông tin người dùng hiện tại
// @route   GET /api/auth/me
// @access  Riêng tư
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({ success: true, data: user });
});

// @desc    Cập nhật thông tin cá nhân
// @route   PUT /api/auth/me
// @access  Riêng tư
exports.updateMe = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = { name: req.body.name, bio: req.body.bio, avatar: req.body.avatar };
  // Xóa các trường không có giá trị
  Object.keys(fieldsToUpdate).forEach((k) => fieldsToUpdate[k] === undefined && delete fieldsToUpdate[k]);

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({ success: true, data: user });
});

// @desc    Đăng xuất (client tự hủy token)
// @route   POST /api/auth/logout
// @access  Riêng tư
exports.logout = asyncHandler(async (req, res, next) => {
  res.status(200).json({ success: true, message: 'Đăng xuất thành công. Vui lòng xóa token phía client.' });
});
