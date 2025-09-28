// const jwt = require('jsonwebtoken');
// const User = require('../models/User.js');
// const Teacher = require('../models/Teacher.js');
// const Student = require('../models/Student.js');
// const Parent = require('../models/Parent.js');



// const protect = async (req, res, next) => {
//   let token;
//   if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
//     try {
//       token = req.headers.authorization.split(' ')[1];
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);

//       req.user = await User.findById(decoded.id).select('-password');

//       // Add these lines 👇
//       if (decoded.role) {
//         req.user.role = decoded.role; 
//       }
//       if (decoded.profileId) {
//         req.user.profileId = decoded.profileId;
//       }

//       next();
//     } catch (error) {
//       console.error('JWT verification failed:', error.message);
//       return res.status(401).json({ message: 'Not authorized, token failed' });
//     }
//   }

//   if (!token) {
//     return res.status(401).json({ message: 'Not authorized, no token' });
//   }
// };


// const authorize = (...roles) => {
//   return (req, res, next) => {
//     if (!req.user || !req.user.role || !roles.includes(req.user.role)) {
//       return res.status(403).json({ message: `User role ${req.user.role} is not authorized to access this route` });
//     }
//     next();
//   };
// };

// module.exports = { protect, authorize };



// In server/middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User.js');
const Teacher = require('../models/Teacher.js');
const Student = require('../models/Student.js');
const Parent = require('../models/Parent.js');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      req.user.profileId = decoded.profileId; // This is the crucial line
      next();
    } catch (error) {
      console.error('JWT verification failed:', error.message);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }
  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: `User role ${req.user.role} is not authorized to access this route` });
    }
    next();
  };
};

module.exports = { protect, authorize };