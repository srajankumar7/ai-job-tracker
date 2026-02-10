const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (request, reply) => {
  try {
    let token;

    if (
      request.headers.authorization &&
      request.headers.authorization.startsWith('Bearer')
    ) {
      // Get token from header
      token = request.headers.authorization.split(' ')[1];

      if (!token) {
        return reply.code(401).send({ error: 'Not authorized, no token' });
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      request.user = await User.findById(decoded.id).select('-password');

      if (!request.user) {
        return reply.code(401).send({ error: 'User not found' });
      }

      // Success - continue to route handler
      return;
    }

    // No authorization header
    return reply.code(401).send({ error: 'Not authorized, no token' });
  } catch (error) {
    console.error('Auth middleware error:', error);
    return reply.code(401).send({ error: 'Not authorized, token failed' });
  }
};

module.exports = { protect };