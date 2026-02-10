const axios = require('axios');

class AdzunaService {
  constructor() {
    this.appId = process.env.ADZUNA_APP_ID;
    this.appKey = process.env.ADZUNA_APP_KEY;
    this.baseUrl = 'https://api.adzuna.com/v1/api/jobs';
    this.country = 'in'; // India
  }

  async searchJobs(options = {}) {
    const {
      what = 'software developer',
      where = '',
      page = 1,
      resultsPerPage = 20,
    } = options;

    // If no API credentials, use mock data
    if (!this.appId || !this.appKey) {
      console.log('⚠️ No Adzuna API credentials found, using mock data');
      return this.getMockJobs(page, resultsPerPage);
    }

    try {
      const url = `${this.baseUrl}/${this.country}/search/${page}`;

      console.log(`🔍 Fetching jobs from Adzuna: ${what} in ${where || 'any location'}`);

      const response = await axios.get(url, {
        params: {
          app_id: this.appId,
          app_key: this.appKey,
          results_per_page: resultsPerPage,
          what,
          where,
        },
        timeout: 10000,
      });

      console.log(`✅ Adzuna returned ${response.data.results?.length || 0} jobs`);

      const jobs = response.data.results.map((job) => ({
        id: job.id,
        title: job.title,
        company: job.company?.display_name || 'Unknown Company',
        location: job.location?.display_name || 'Remote',
        description: job.description || '',
        category: job.category?.label || 'Other',
        created: job.created,
        salary_min: job.salary_min,
        salary_max: job.salary_max,
        applyUrl: job.redirect_url,
        redirect_url: job.redirect_url,
      }));

      return {
        jobs,
        total: response.data.count,
        page,
      };
    } catch (error) {
      console.error('❌ Adzuna API Error:', error.message);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      console.log('⚠️ Falling back to mock data');
      return this.getMockJobs(page, resultsPerPage);
    }
  }

  getMockJobs(page = 1, resultsPerPage = 20) {
    console.log(`📦 Generating ${resultsPerPage} mock jobs`);
    
    const mockJobs = [
      {
        id: '1',
        title: 'Senior React Developer',
        company: 'Tech Innovations Inc',
        location: 'Bangalore, India',
        description: 'Looking for an experienced React developer with strong skills in TypeScript, Node.js, and modern web technologies. You will work on cutting-edge projects using React, Redux, and REST APIs.',
        created: new Date().toISOString(),
        applyUrl: 'https://example.com/job/1',
        redirect_url: 'https://example.com/job/1',
      },
      {
        id: '2',
        title: 'Full Stack JavaScript Developer',
        company: 'StartupXYZ',
        location: 'Remote',
        description: 'Full stack developer role using React, Node.js, MongoDB, Express. Build scalable web applications and work with modern cloud deployment.',
        created: new Date(Date.now() - 86400000).toISOString(),
        applyUrl: 'https://example.com/job/2',
        redirect_url: 'https://example.com/job/2',
      },
      {
        id: '3',
        title: 'Backend Node.js Engineer',
        company: 'DataFlow Inc',
        location: 'Hyderabad, India',
        description: 'Backend engineer with expertise in Node.js, Express, PostgreSQL, and REST APIs. Experience with microservices architecture is a plus.',
        created: new Date(Date.now() - 172800000).toISOString(),
        applyUrl: 'https://example.com/job/3',
        redirect_url: 'https://example.com/job/3',
      },
      {
        id: '4',
        title: 'Python Developer',
        company: 'AI Solutions Ltd',
        location: 'Mumbai, India',
        description: 'Python developer for data engineering and machine learning projects. Experience with Django, Flask, and data processing pipelines required.',
        created: new Date(Date.now() - 259200000).toISOString(),
        applyUrl: 'https://example.com/job/4',
        redirect_url: 'https://example.com/job/4',
      },
      {
        id: '5',
        title: 'Frontend React Developer',
        company: 'Digital Dreams',
        location: 'Pune, India',
        description: 'Frontend specialist with React, TypeScript, and modern CSS frameworks. Build beautiful, responsive user interfaces.',
        created: new Date(Date.now() - 345600000).toISOString(),
        applyUrl: 'https://example.com/job/5',
        redirect_url: 'https://example.com/job/5',
      },
      {
        id: '6',
        title: 'DevOps Engineer',
        company: 'CloudTech Corp',
        location: 'Remote',
        description: 'DevOps engineer with AWS, Docker, Kubernetes experience. Automate deployments and manage cloud infrastructure.',
        created: new Date(Date.now() - 432000000).toISOString(),
        applyUrl: 'https://example.com/job/6',
        redirect_url: 'https://example.com/job/6',
      },
      {
        id: '7',
        title: 'Java Backend Developer',
        company: 'Enterprise Systems',
        location: 'Delhi, India',
        description: 'Java developer for enterprise applications. Spring Boot, Hibernate, and microservices architecture experience required.',
        created: new Date(Date.now() - 518400000).toISOString(),
        applyUrl: 'https://example.com/job/7',
        redirect_url: 'https://example.com/job/7',
      },
      {
        id: '8',
        title: 'Mobile App Developer (React Native)',
        company: 'AppDev Solutions',
        location: 'Bangalore, India',
        description: 'React Native developer to build cross-platform mobile applications. iOS and Android deployment experience preferred.',
        created: new Date(Date.now() - 604800000).toISOString(),
        applyUrl: 'https://example.com/job/8',
        redirect_url: 'https://example.com/job/8',
      },
      {
        id: '9',
        title: 'Data Engineer',
        company: 'BigData Analytics',
        location: 'Hyderabad, India',
        description: 'Data engineer with Python, Spark, and SQL. Build data pipelines and warehouses for analytics.',
        created: new Date(Date.now() - 691200000).toISOString(),
        applyUrl: 'https://example.com/job/9',
        redirect_url: 'https://example.com/job/9',
      },
      {
        id: '10',
        title: 'UI/UX Designer',
        company: 'Creative Studio',
        location: 'Mumbai, India',
        description: 'UI/UX designer with Figma and design systems experience. Create beautiful, user-friendly interfaces.',
        created: new Date(Date.now() - 777600000).toISOString(),
        applyUrl: 'https://example.com/job/10',
        redirect_url: 'https://example.com/job/10',
      },
    ];

    // Repeat to reach desired results per page
    while (mockJobs.length < resultsPerPage) {
      mockJobs.push(...mockJobs.slice(0, Math.min(10, resultsPerPage - mockJobs.length)));
    }

    const start = (page - 1) * resultsPerPage;
    const end = start + resultsPerPage;

    return {
      jobs: mockJobs.slice(0, resultsPerPage),
      total: 100, // Simulated total
      page,
    };
  }
}

module.exports = new AdzunaService();