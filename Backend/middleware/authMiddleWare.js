
const jwt = require('jsonwebtoken');
const User = require('../models/User');



const protect = async (req, res, next) => {
  try {
      console.log('PROTECT MIDDLEWARE EXECUTED');
    console.log('Authorization:', req.headers.authorization);
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      res.status(401);
      throw new Error('Not authorized. No JWT token provided.');
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user in database
    const currentUser = await User.findById(decoded.id);

    if (!currentUser) {
      res.status(401);
      throw new Error('User belonging to this token no longer exists.');
    }

    // Check account status
    if (!currentUser.isActive) {
      res.status(403);
      throw new Error('Your account has been deactivated.');
    }

    // Attach user information to request
    req.user = currentUser;

    next();

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      res.status(401);
      return next(new Error('Your session has expired. Please log in again.'));
    }

    if (error.name === 'JsonWebTokenError') {
      res.status(401);
      return next(new Error('Invalid JWT token.'));
    }

    next(error);
  }
};


// 2. AUTHORIZE MIDDLEWARE
// Check user role permissions

const authorize = (...allowedRoles) => {
  return (req, res, next) => {

    if (!req.user || !allowedRoles.includes(req.user.role)) {
      res.status(403);

      return next(
        new Error(
          `Access Denied: Role '${req.user ? req.user.role : 'Unknown'}' is not authorized.`
        )
      );
    }

    next();
  };
};


// Export middleware functions
module.exports = { protect, authorize };
