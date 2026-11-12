
const User = require('../models/User');

// GET all users
const getUsers = async (req, res, next) => {
  try {
    const { role, isActive } = req.query;

    const filter = {};

    if (role) filter.role = role;

    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// GET single user
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// CREATE user
const createUser = async (req, res, next) => {
  try {
    const {
      fullName,
      email,
      password,
      role,
      designation
    } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Full name, email and password are required'
      });
    }

    const existingUser = await User.findOne({
      email: email.toLowerCase().trim()
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    const user = await User.create({
      fullName,
      email,
      password,
      role,
      designation
    });

    const safeUser = await User.findById(user._id)
      .select('-password');

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: safeUser
    });
  } catch (error) {
    next(error);
  }
};

// UPDATE user
const updateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const allowedFields = [
      'fullName',
      'email',
      'role',
      'designation',
      'password'
    ];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    }

    await user.save();

    const safeUser = await User.findById(user._id)
      .select('-password');

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: safeUser
    });
  } catch (error) {
    next(error);
  }
};

// ACTIVATE / DEACTIVATE user
const updateUserStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid account status'
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isActive = isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (error) {
    next(error);
  }
};

// DELETE user
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Protect all Admin accounts
    if (user.role === 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin accounts cannot be deleted'
      });
    }

    await User.findByIdAndDelete(user._id);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  updateUserStatus,
  deleteUser
};
