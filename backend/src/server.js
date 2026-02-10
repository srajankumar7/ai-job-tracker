require('dotenv').config();
const Fastify = require('fastify');
const connectDB = require('./config/database');

const PORT = process.env.PORT || 5000;

const fastify = Fastify({
  logger: true,
  bodyLimit: 10 * 1024 * 1024, // 10MB
  trustProxy: true, // ✅ REQUIRED for Render / Netlify
});

// ================================
// Connect Database
// ================================
connectDB();

// ================================
// Server Start Function
// ================================
const start = async () => {
  try {
    // ================================
    // ✅ CORS (FIXED FOR NETLIFY + LOCAL)
    // ================================
    await fastify.register(require('@fastify/cors'), {
      origin: (origin, callback) => {
        const allowedOrigins = [
          'http://localhost:3000',
          'https://aijob-tracker.netlify.app',
        ];

        // allow server-side requests & tools like Postman
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'), false);
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    });

    // ================================
    // Multipart (Resume Upload)
    // ================================
    await fastify.register(require('@fastify/multipart'), {
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    });

    // ================================
    // Health Check
    // ================================
    fastify.get('/health', async () => ({
      status: 'ok',
      env: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    }));

    // ================================
    // API Test
    // ================================
    fastify.get('/api/test', async () => ({
      message: 'API is working',
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
    }));

    // ================================
    // Routes
    // ================================
    console.log('📝 Registering routes...');

    await fastify.register(require('./routes/auth'), {
      prefix: '/api/auth',
    });

    await fastify.register(require('./routes/jobs'), {
      prefix: '/api/jobs',
    });

    await fastify.register(require('./routes/applications'), {
      prefix: '/api/applications',
    });

    await fastify.register(require('./routes/ai'), {
      prefix: '/api/ai',
    });

    await fastify.register(require('./routes/resume'), {
      prefix: '/api/resume',
    });

    console.log('✅ All routes registered');

    // ================================
    // Global Error Handler
    // ================================
    fastify.setErrorHandler((error, request, reply) => {
      fastify.log.error(error);

      reply.code(error.statusCode || 500).send({
        success: false,
        error: error.name || 'ServerError',
        message: error.message || 'Something went wrong',
        ...(process.env.NODE_ENV !== 'production' && { stack: error.stack }),
      });
    });

    // ================================
    // 404 Handler
    // ================================
    fastify.setNotFoundHandler((request, reply) => {
      reply.code(404).send({
        success: false,
        error: 'Not Found',
        method: request.method,
        url: request.url,
      });
    });

    // ================================
    // Start Server
    // ================================
    await fastify.listen({
      port: PORT,
      host: '0.0.0.0',
    });

    console.log('🚀 ===============================');
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🚀 ENV: ${process.env.NODE_ENV || 'development'}`);
    console.log('🚀 ===============================');

  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

// ================================
// Graceful Shutdown
// ================================
const shutdown = async (signal) => {
  console.log(`⚠️ Received ${signal}, shutting down...`);
  await fastify.close();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// Start server
start();
