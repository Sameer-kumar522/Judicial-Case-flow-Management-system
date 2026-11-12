
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const ALLOWED_ROLES = [
  'Admin',
  'Registrar',
  'Judge',
  'Clerk',
  'Lawyer'
];

// Generate JWT Token
const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};


// 1. LOGIN USER
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      throw new Error('Please provide email and password.');
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim()
    }).select('+password');

    if (!user) {
      res.status(401);
      throw new Error('Invalid email or password.');
    }

    if (!user.isActive) {
      res.status(403);
      throw new Error('Your account is deactivated.');
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      res.status(401);
      throw new Error('Invalid email or password.');
    }

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token: generateToken(user._id, user.role),
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        designation: user.designation
      }
    });

  } catch (error) {
    next(error);
  }
};


// 2. REGISTER USER (ADMIN ONLY)
// Route already protects this controller with Admin authorization.
const registerUser = async (req, res, next) => {
  try {
    const { fullName, email, password, role, designation } = req.body;

    if (!fullName || !email || !password) {
      res.status(400);
      throw new Error('Please provide fullName, email and password.');
    }

    if (!role || !ALLOWED_ROLES.includes(role)) {
      res.status(400);
      throw new Error('Please provide a valid user role.');
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({
      email: normalizedEmail
    });

    if (existingUser) {
      res.status(409);
      throw new Error('This email is already registered.');
    }

    const newUser = await User.create({
      fullName: fullName.trim(),
      email: normalizedEmail,
      password,
      role,
      designation: designation || 'Judicial Staff'
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      user: {
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        role: newUser.role,
        designation: newUser.designation,
        isActive: newUser.isActive
      }
    });

  } catch (error) {
    next(error);
  }
};


// 3. GET LOGGED-IN USER PROFILE
const getMe = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      user: req.user
    });

  } catch (error) {
    next(error);
  }
};


// 4. GET ALL USERS (ADMIN ONLY)
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users
    });

  } catch (error) {
    next(error);
  }
};


// 5. UPDATE USER ROLE OR STATUS (ADMIN ONLY)
const updateUserStatusOrRole = async (req, res, next) => {
  try {
    const { role, isActive, designation } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(404);
      throw new Error('User not found.');
    }

    if (role !== undefined) {
      if (!ALLOWED_ROLES.includes(role)) {
        res.status(400);
        throw new Error('Invalid role selected.');
      }

      user.role = role;
    }

    if (typeof isActive === 'boolean') {
      user.isActive = isActive;
    }

    if (designation !== undefined) {
      user.designation = designation;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'User permissions updated successfully.',
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        designation: user.designation,
        isActive: user.isActive
      }
    });

  } catch (error) {
    next(error);
  }
};


module.exports = {
  loginUser,
  registerUser,
  getMe,
  getAllUsers,
  updateUserStatusOrRole
};
