const { protect } = require("../middleware/auth");

module.exports = async function (fastify, opts) {

  // AI CHAT - Returns filter updates
  fastify.post("/chat", { preHandler: protect }, async (request, reply) => {
    try {
      const { message, currentFilters } = request.body;

      if (!message || typeof message !== "string" || !message.trim()) {
        return reply.code(400).send({ error: "Message is required" });
      }

      // Simple intent detection and filter generation
      const lowerMsg = message.toLowerCase();
      let filterUpdate = null;
      let response = "";

      // CLEAR FILTERS
      if (lowerMsg.includes('clear') && (lowerMsg.includes('filter') || lowerMsg.includes('all'))) {
        filterUpdate = { clear: true };
        response = "✅ All filters cleared! Showing all jobs.";
      }
      
      // REMOTE JOBS
      else if (lowerMsg.includes('remote')) {
        filterUpdate = { workMode: ['Remote'] };
        response = "✅ Filtered to remote jobs only.";
      }
      
      // HIGH MATCH SCORES
      else if (lowerMsg.includes('high match') || (lowerMsg.includes('high') && lowerMsg.includes('score'))) {
        filterUpdate = { matchScore: 'high' };
        response = "✅ Showing only high match jobs (>70%).";
      }
      
      // MEDIUM MATCH SCORES
      else if (lowerMsg.includes('medium match') || (lowerMsg.includes('medium') && lowerMsg.includes('score'))) {
        filterUpdate = { matchScore: 'medium' };
        response = "✅ Showing medium match jobs (40-70%).";
      }
      
      // FULL-TIME
      else if (lowerMsg.includes('full-time') || lowerMsg.includes('full time') || lowerMsg.includes('fulltime')) {
        filterUpdate = { jobType: ['Full-time'] };
        response = "✅ Filtered to full-time positions.";
      }
      
      // PART-TIME
      else if (lowerMsg.includes('part-time') || lowerMsg.includes('part time') || lowerMsg.includes('parttime')) {
        filterUpdate = { jobType: ['Part-time'] };
        response = "✅ Filtered to part-time positions.";
      }
      
      // CONTRACT
      else if (lowerMsg.includes('contract')) {
        filterUpdate = { jobType: ['Contract'] };
        response = "✅ Filtered to contract positions.";
      }
      
      // INTERNSHIP
      else if (lowerMsg.includes('internship') || lowerMsg.includes('intern')) {
        filterUpdate = { jobType: ['Internship'] };
        response = "✅ Filtered to internships.";
      }
      
      // HYBRID
      else if (lowerMsg.includes('hybrid')) {
        filterUpdate = { workMode: ['Hybrid'] };
        response = "✅ Filtered to hybrid jobs.";
      }
      
      // ON-SITE
      else if (lowerMsg.includes('on-site') || lowerMsg.includes('onsite') || lowerMsg.includes('office')) {
        filterUpdate = { workMode: ['On-site'] };
        response = "✅ Filtered to on-site jobs.";
      }
      
      // LAST 24 HOURS
      else if (lowerMsg.includes('today') || lowerMsg.includes('24 hour') || lowerMsg.includes('last day')) {
        filterUpdate = { datePosted: 'last_24_hours' };
        response = "✅ Showing jobs posted in the last 24 hours.";
      }
      
      // LAST WEEK
      else if (lowerMsg.includes('last week') || lowerMsg.includes('this week') || lowerMsg.includes('week')) {
        filterUpdate = { datePosted: 'last_week' };
        response = "✅ Showing jobs posted in the last week.";
      }
      
      // LAST MONTH
      else if (lowerMsg.includes('last month') || lowerMsg.includes('this month') || lowerMsg.includes('month')) {
        filterUpdate = { datePosted: 'last_month' };
        response = "✅ Showing jobs posted in the last month.";
      }
      
      // LOCATION FILTERS
      else if (lowerMsg.includes('in bangalore') || lowerMsg.includes('bangalore')) {
        filterUpdate = { location: 'Bangalore' };
        response = "✅ Filtered to jobs in Bangalore.";
      }
      else if (lowerMsg.includes('in mumbai') || lowerMsg.includes('mumbai')) {
        filterUpdate = { location: 'Mumbai' };
        response = "✅ Filtered to jobs in Mumbai.";
      }
      else if (lowerMsg.includes('in delhi') || lowerMsg.includes('delhi')) {
        filterUpdate = { location: 'Delhi' };
        response = "✅ Filtered to jobs in Delhi.";
      }
      else if (lowerMsg.includes('in hyderabad') || lowerMsg.includes('hyderabad')) {
        filterUpdate = { location: 'Hyderabad' };
        response = "✅ Filtered to jobs in Hyderabad.";
      }
      
      // SKILLS SEARCH
      else if (lowerMsg.includes('react') || lowerMsg.includes('node') || lowerMsg.includes('python') || lowerMsg.includes('java')) {
        const skills = [];
        if (lowerMsg.includes('react')) skills.push('React');
        if (lowerMsg.includes('node')) skills.push('Node.js');
        if (lowerMsg.includes('python')) skills.push('Python');
        if (lowerMsg.includes('javascript')) skills.push('JavaScript');
        if (lowerMsg.includes('java') && !lowerMsg.includes('javascript')) skills.push('Java');
        
        filterUpdate = { skills };
        response = `✅ Filtered to jobs requiring: ${skills.join(', ')}`;
      }
      
      // ROLE SEARCH
      else if (lowerMsg.includes('developer') || lowerMsg.includes('engineer') || lowerMsg.includes('designer')) {
        let role = '';
        if (lowerMsg.includes('frontend')) role = 'Frontend Developer';
        else if (lowerMsg.includes('backend')) role = 'Backend Developer';
        else if (lowerMsg.includes('full stack') || lowerMsg.includes('fullstack')) role = 'Full Stack Developer';
        else if (lowerMsg.includes('react')) role = 'React Developer';
        else if (lowerMsg.includes('node')) role = 'Node.js Developer';
        else if (lowerMsg.includes('developer')) role = 'Developer';
        else if (lowerMsg.includes('engineer')) role = 'Engineer';
        
        filterUpdate = { role };
        response = `✅ Searching for ${role} positions.`;
      }
      
      // HELP QUERIES
      else if (lowerMsg.includes('help') || lowerMsg.includes('how') || lowerMsg.includes('?')) {
        if (lowerMsg.includes('resume') || lowerMsg.includes('upload')) {
          response = "To upload your resume, click the 'Upload Resume' button in the top navigation. We support PDF and Word documents.";
        } else if (lowerMsg.includes('application') || lowerMsg.includes('track')) {
          response = "To view your applications, click 'My Applications' in the top navigation. You can track all jobs you've applied to and update their status.";
        } else if (lowerMsg.includes('match') || lowerMsg.includes('score')) {
          response = "Match scores show how well your resume aligns with each job. We analyze your skills, experience, and keywords to calculate a 0-100% match score.";
        } else {
          response = "I can help you filter jobs! Try:\n• 'Show remote jobs'\n• 'Full-time only'\n• 'High match scores'\n• 'Jobs in Bangalore'\n• 'Last week jobs'\n• 'React and Node.js positions'";
        }
      }
      
      // DEFAULT RESPONSE
      else {
        response = "I can help you filter jobs! Try:\n• 'Show me remote jobs'\n• 'Filter to full-time positions'\n• 'High match scores only'\n• 'Jobs posted last week'\n• 'Clear all filters'";
      }

      return reply.send({
        results: [{
          action: filterUpdate ? 'update_ui_filters' : 'display_message',
          parameters: filterUpdate,
          message: response
        }],
        message: response
      });
    } catch (error) {
      console.error("AI chat error:", error);
      return reply.code(500).send({
        error: "Error processing message",
        message: "I'm having trouble right now. Please try again.",
      });
    }
  });

  // SUGGESTIONS
  fastify.get("/suggestions", { preHandler: protect }, async () => {
    return {
      suggestions: [
        { id: 1, text: "Show me remote jobs", type: "filter" },
        { id: 2, text: "Filter to full-time roles", type: "filter" },
        { id: 3, text: "High match scores only", type: "filter" },
        { id: 4, text: "Jobs posted last week", type: "filter" },
        { id: 5, text: "Clear all filters", type: "filter" },
      ],
    };
  });
};