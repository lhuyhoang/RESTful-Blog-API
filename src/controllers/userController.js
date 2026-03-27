const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all users
// @route   GET /api/users
// @access  Private (admin)
exports.getUsers = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const total = await User.countDocuments();
  const users = await User.find().sort({ createdAt: -1 }).skip(skip).limit(limit);

  res.status(200).json({ success: true, count: users.length, total, page, data: users });
});

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private (admin)
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return next(new ErrorResponse('User not found', 404));
  res.status(200).json({ success: true, data: user });
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private (admin)
exports.updateUser = asyncHandler(async (req, res, next) => {
  // Prevent password update through this route
  delete req.body.password;

  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!user) return next(new ErrorResponse('User not found', 404));
  res.status(200).json({ success: true, data: user });
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (admin)
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return next(new ErrorResponse('User not found', 404));

  // Prevent admin from deleting themselves
  if (user._id.toString() === req.user.id) {
    return next(new ErrorResponse('Admin cannot delete their own account through this route', 400));
  }

  await User.findByIdAndDelete(req.params.id);
  res.status(200).json({ success: true, data: {} });
});
