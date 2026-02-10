const { protect } = require('../middleware/auth');
const Application = require('../models/Application');

async function applicationsRoutes(fastify, options) {
  // Create new application
  fastify.post('/', { preHandler: protect }, async (request, reply) => {
    try {
      const {
        jobId,
        jobTitle,
        company,
        location,
        jobUrl,
        appliedDate,
        matchScore,
      } = request.body;

      if (!jobId || !jobTitle || !company) {
        return reply.code(400).send({ error: 'Missing required fields' });
      }

      // Check if application already exists
      const existingApp = await Application.findOne({
        userId: request.user._id,
        jobId,
      });

      if (existingApp) {
        return reply.code(400).send({ error: 'Application already tracked' });
      }

      // Create application
      const application = await Application.create({
        userId: request.user._id,
        jobId,
        jobTitle,
        company,
        location,
        jobUrl,
        appliedDate: appliedDate || new Date(),
        matchScore,
        status: 'Applied',
        timeline: [{
          status: 'Applied',
          date: appliedDate || new Date(),
          notes: 'Application submitted',
        }],
      });

      return reply.code(201).send(application);
    } catch (error) {
      console.error('Create application error:', error);
      return reply.code(500).send({ error: 'Error creating application' });
    }
  });

  // Get all applications for user
  fastify.get('/', { preHandler: protect }, async (request, reply) => {
    try {
      const { status, sortBy = 'createdAt', order = 'desc' } = request.query;

      const query = { userId: request.user._id };
      
      if (status) {
        query.status = status;
      }

      const sortOrder = order === 'asc' ? 1 : -1;
      const sortOptions = { [sortBy]: sortOrder };

      const applications = await Application.find(query)
        .sort(sortOptions)
        .lean();

      return reply.send({
        applications,
        total: applications.length,
      });
    } catch (error) {
      console.error('Get applications error:', error);
      return reply.code(500).send({ error: 'Error fetching applications' });
    }
  });

  // Get single application
  fastify.get('/:id', { preHandler: protect }, async (request, reply) => {
    try {
      const application = await Application.findOne({
        _id: request.params.id,
        userId: request.user._id,
      });

      if (!application) {
        return reply.code(404).send({ error: 'Application not found' });
      }

      return reply.send(application);
    } catch (error) {
      console.error('Get application error:', error);
      return reply.code(500).send({ error: 'Error fetching application' });
    }
  });

  // Update application status
  fastify.patch('/:id', { preHandler: protect }, async (request, reply) => {
    try {
      const { status, notes } = request.body;

      if (!status) {
        return reply.code(400).send({ error: 'Status is required' });
      }

      const validStatuses = ['Applied', 'Interview', 'Offer', 'Rejected'];
      if (!validStatuses.includes(status)) {
        return reply.code(400).send({ error: 'Invalid status' });
      }

      const application = await Application.findOne({
        _id: request.params.id,
        userId: request.user._id,
      });

      if (!application) {
        return reply.code(404).send({ error: 'Application not found' });
      }

      // Update status and add to timeline
      application.status = status;
      application.timeline.push({
        status,
        date: new Date(),
        notes: notes || `Status changed to ${status}`,
      });

      await application.save();

      return reply.send(application);
    } catch (error) {
      console.error('Update application error:', error);
      return reply.code(500).send({ error: 'Error updating application' });
    }
  });

  // Delete application
  fastify.delete('/:id', { preHandler: protect }, async (request, reply) => {
    try {
      const application = await Application.findOneAndDelete({
        _id: request.params.id,
        userId: request.user._id,
      });

      if (!application) {
        return reply.code(404).send({ error: 'Application not found' });
      }

      return reply.send({ message: 'Application deleted successfully' });
    } catch (error) {
      console.error('Delete application error:', error);
      return reply.code(500).send({ error: 'Error deleting application' });
    }
  });

  // Get application statistics
  fastify.get('/stats/summary', { preHandler: protect }, async (request, reply) => {
    try {
      const applications = await Application.find({ userId: request.user._id });

      const stats = {
        total: applications.length,
        byStatus: {
          Applied: 0,
          Interview: 0,
          Offer: 0,
          Rejected: 0,
        },
        averageMatchScore: 0,
        recentApplications: [],
      };

      let totalScore = 0;
      let scoreCount = 0;

      applications.forEach(app => {
        stats.byStatus[app.status]++;
        if (app.matchScore) {
          totalScore += app.matchScore;
          scoreCount++;
        }
      });

      if (scoreCount > 0) {
        stats.averageMatchScore = Math.round(totalScore / scoreCount);
      }

      stats.recentApplications = applications
        .sort((a, b) => new Date(b.appliedDate) - new Date(a.appliedDate))
        .slice(0, 5)
        .map(app => ({
          jobTitle: app.jobTitle,
          company: app.company,
          status: app.status,
          appliedDate: app.appliedDate,
        }));

      return reply.send(stats);
    } catch (error) {
      console.error('Get stats error:', error);
      return reply.code(500).send({ error: 'Error fetching statistics' });
    }
  });

  // Check if job is already applied
  fastify.get('/check/:jobId', { preHandler: protect }, async (request, reply) => {
    try {
      const application = await Application.findOne({
        userId: request.user._id,
        jobId: request.params.jobId,
      });

      return reply.send({
        applied: !!application,
        application: application || null,
      });
    } catch (error) {
      console.error('Check application error:', error);
      return reply.code(500).send({ error: 'Error checking application' });
    }
  });
}

module.exports = applicationsRoutes;