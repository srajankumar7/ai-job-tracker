const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { protect } = require('../middleware/auth');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

module.exports = async function (fastify, opts) {
  // Login
  fastify.post('/login', async (request, reply) => {
    try {
      console.log('Login attempt:', request.body);
      
      const { email, password } = request.body;

      if (!email || !password) {
        return reply.code(400).send({ 
          success: false,
          error: 'Please provide email and password' 
        });
      }

      const user = await User.findOne({ email }).select('+password');
      console.log('User found:', !!user);

      if (!user) {
        return reply.code(401).send({ 
          success: false,
          error: 'Invalid email or password' 
        });
      }

      const isMatch = await user.comparePassword(password);
      console.log('Password match:', isMatch);

      if (!isMatch) {
        return reply.code(401).send({ 
          success: false,
          error: 'Invalid email or password' 
        });
      }

      const token = generateToken(user._id);

      return reply.send({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          hasResume: !!user.resume,
          resume: user.resume
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      return reply.code(500).send({ 
        success: false,
        error: 'Server error during login',
        message: error.message 
      });
    }
  });

  // Register
  fastify.post('/register', async (request, reply) => {
    try {
      console.log('Register attempt:', request.body);
      
      const { name, email, password } = request.body;

      if (!name || !email || !password) {
        return reply.code(400).send({ 
          success: false,
          error: 'Please provide name, email and password' 
        });
      }

      const userExists = await User.findOne({ email });
      if (userExists) {
        return reply.code(400).send({ 
          success: false,
          error: 'User already exists' 
        });
      }

      const user = await User.create({ name, email, password });
      const token = generateToken(user._id);

      return reply.code(201).send({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          hasResume: false
        }
      });
    } catch (error) {
      console.error('Register error:', error);
      return reply.code(500).send({ 
        success: false,
        error: 'Server error during registration',
        message: error.message 
      });
    }
  });

  // Get profile
  fastify.get('/me', { preHandler: protect }, async (request, reply) => {
    try {
      const user = await User.findById(request.user._id).select('-password');
      return reply.send({
        success: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          hasResume: !!user.resume,
          resume: user.resume
        }
      });
    } catch (error) {
      console.error('Profile error:', error);
      return reply.code(500).send({ 
        success: false,
        error: 'Error fetching profile' 
      });
    }
  });
};