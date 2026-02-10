const { protect } = require('../middleware/auth');
const adzunaService = require('../services/adzunaService');
const langchainMatcher = require('../services/langchainMatcher');
const User = require('../models/User');

module.exports = async function (fastify) {

  // ============================================
  // GET /api/jobs - Get all jobs with matching
  // ============================================
  fastify.get('/', { preHandler: protect }, async (req, reply) => {
    try {
      console.log('📥 GET /api/jobs - User:', req.user?._id);
      
      const jobsData = await adzunaService.searchJobs({ resultsPerPage: 20 });
      const user = await User.findById(req.user._id);

      let jobs = jobsData.jobs || [];

      // 🔹 NO RESUME → RETURN JOBS DIRECTLY
      if (!user?.resume?.text) {
        console.log('⚠️ No resume found for user, returning jobs with 0 match score');
        return reply.send({
          success: true,
          jobs: jobs.map(j => ({
            ...j,
            id: j.id || j._id,
            matchScore: 0,
            matchDetails: {
              matchingSkills: [],
              relevantExperience: [],
              keywordsAlignment: [],
              explanation: 'Upload resume to see match score',
            },
          })),
          count: jobs.length,
        });
      }

      // 🔹 TRY AI MATCHING (SAFE)
      let matchedJobs = [];
      try {
        console.log('🤖 Running AI matching for', jobs.length, 'jobs');
        matchedJobs = await langchainMatcher.batchMatchJobs(
          user.resume.text,
          jobs
        );
        console.log('✅ AI matching completed:', matchedJobs.length, 'jobs matched');
      } catch (err) {
        console.error('❌ AI matching failed:', err.message);
        matchedJobs = [];
      }

      // 🔹 FALLBACK IF AI FAILS
      if (!Array.isArray(matchedJobs) || matchedJobs.length === 0) {
        console.log('⚠️ Using fallback matching');
        matchedJobs = jobs.map(j => ({
          ...j,
          id: j.id || j._id,
          matchScore: 50,
          matchDetails: {
            matchingSkills: [],
            relevantExperience: [],
            keywordsAlignment: [],
            explanation: 'Basic matching applied',
          },
        }));
      }

      // Ensure all jobs have required fields
      const normalizedJobs = matchedJobs.map(job => ({
        ...job,
        id: job.id || job._id,
        matchScore: job.matchScore || 0,
        matchDetails: job.matchDetails || {
          matchingSkills: [],
          relevantExperience: [],
          keywordsAlignment: [],
          explanation: 'No matching details available',
        },
      }));

      reply.send({ 
        success: true,
        jobs: normalizedJobs,
        count: normalizedJobs.length,
      });

    } catch (err) {
      console.error('❌ Jobs API error:', err);
      reply.code(500).send({ 
        success: false,
        error: 'Failed to load jobs',
        message: err.message,
      });
    }
  });

  // ============================================
  // GET /api/jobs/best-matches - Get top matches
  // ============================================
  fastify.get('/best-matches', { preHandler: protect }, async (req, reply) => {
    try {
      console.log('📥 GET /api/jobs/best-matches - User:', req.user?._id);
      
      const jobsData = await adzunaService.searchJobs({ resultsPerPage: 20 });
      const user = await User.findById(req.user._id);

      let jobs = jobsData.jobs || [];

      // 🔹 NO RESUME → RETURN EMPTY BEST MATCHES
      if (!user?.resume?.text) {
        console.log('⚠️ No resume found, returning empty best matches');
        return reply.send({
          success: true,
          jobs: [],
          count: 0,
        });
      }

      // 🔹 TRY AI MATCHING
      let matchedJobs = [];
      try {
        console.log('🤖 Running AI matching for best matches');
        matchedJobs = await langchainMatcher.batchMatchJobs(
          user.resume.text,
          jobs
        );
      } catch (err) {
        console.error('❌ AI matching failed:', err.message);
        matchedJobs = [];
      }

      // 🔹 FALLBACK IF AI FAILS
      if (!Array.isArray(matchedJobs) || matchedJobs.length === 0) {
        console.log('⚠️ Using fallback matching for best matches');
        matchedJobs = jobs.map(j => ({
          ...j,
          id: j.id || j._id,
          matchScore: 50,
          matchDetails: {
            matchingSkills: [],
            relevantExperience: [],
            keywordsAlignment: [],
            explanation: 'Basic matching applied',
          },
        }));
      }

      // Filter for high match scores (>= 70%)
      const bestMatches = matchedJobs
        .filter(job => (job.matchScore || 0) >= 70)
        .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
        .map(job => ({
          ...job,
          id: job.id || job._id,
          matchScore: job.matchScore || 0,
          matchDetails: job.matchDetails || {
            matchingSkills: [],
            relevantExperience: [],
            keywordsAlignment: [],
            explanation: 'No matching details available',
          },
        }));

      console.log(`✅ Found ${bestMatches.length} best matches (score >= 70)`);

      reply.send({ 
        success: true,
        jobs: bestMatches,
        count: bestMatches.length,
      });

    } catch (err) {
      console.error('❌ Best matches API error:', err);
      reply.code(500).send({ 
        success: false,
        error: 'Failed to load best matches',
        message: err.message,
      });
    }
  });

  // ============================================
  // GET /api/jobs/stats - Get job statistics
  // ============================================
  fastify.get('/stats', { preHandler: protect }, async (req, reply) => {
    try {
      console.log('📥 GET /api/jobs/stats - User:', req.user?._id);
      
      const user = await User.findById(req.user._id);

      if (!user?.resume?.text) {
        console.log('⚠️ No resume found, returning zero stats');
        return reply.send({ 
          success: true,
          avgMatch: 0, 
          highMatch: 0, 
          total: 0,
        });
      }

      const resume = user.resume.text.toLowerCase();
      const jobsData = await adzunaService.searchJobs({ resultsPerPage: 20 });
      const jobs = jobsData.jobs || [];

      // Calculate scores (simple keyword matching as fallback)
      const scores = jobs.map(j => {
        const t = `${j.title} ${j.description}`.toLowerCase();
        let s = 0;
        if (resume.includes('react') && t.includes('react')) s += 40;
        if (resume.includes('node') && t.includes('node')) s += 40;
        if (resume.includes('python') && t.includes('python')) s += 40;
        if (resume.includes('java') && t.includes('java')) s += 40;
        if (resume.includes('typescript') && t.includes('typescript')) s += 20;
        if (resume.includes('aws') && t.includes('aws')) s += 20;
        return Math.min(s, 100);
      });

      const avgMatch = scores.length > 0 
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 0;
      const highMatch = scores.filter(s => s >= 70).length;
      const total = scores.length;

      console.log(`✅ Stats: avg=${avgMatch}%, high=${highMatch}, total=${total}`);

      reply.send({
        success: true,
        avgMatch,
        highMatch,
        total,
      });

    } catch (err) {
      console.error('❌ Stats API error:', err);
      reply.code(500).send({
        success: false,
        error: 'Failed to load stats',
        message: err.message,
      });
    }
  });

  // ============================================
  // GET /api/jobs/:id - Get single job (optional)
  // ============================================
  fastify.get('/:id', { preHandler: protect }, async (req, reply) => {
    try {
      const { id } = req.params;
      console.log(`📥 GET /api/jobs/${id} - User:`, req.user?._id);
      
      // TODO: Implement single job fetch if needed
      reply.code(501).send({
        success: false,
        message: 'Single job fetch not yet implemented',
      });

    } catch (err) {
      console.error(`❌ Error fetching job ${req.params.id}:`, err);
      reply.code(500).send({
        success: false,
        error: 'Failed to fetch job',
        message: err.message,
      });
    }
  });
};