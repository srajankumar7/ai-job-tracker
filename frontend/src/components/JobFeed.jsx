import React, { useEffect, useState } from 'react';
import { MapPin, ExternalLink, Loader, CheckCircle } from 'lucide-react';
import { jobsAPI, applicationsAPI } from '../utils/api';

const JobFeed = ({ filters, resumeVersion }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load jobs
  useEffect(() => {
    loadJobs();
  }, [resumeVersion]);

  // Apply filters when they change
  useEffect(() => {
    if (jobs.length > 0) {
      console.log('🔍 Applying filters:', filters);
    }
  }, [filters, jobs.length]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await jobsAPI.getJobs();
      setJobs(response.data.jobs || []);
    } catch (err) {
      console.error('Failed to load jobs:', err);
      setError('Failed to load jobs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Filter jobs based on AI filters
  const getFilteredJobs = () => {
    if (!filters || Object.keys(filters).length === 0 || filters.clear || filters.clearAll) {
      return jobs;
    }

    let filtered = [...jobs];

    // Filter by work mode (Remote, Hybrid, On-site)
    if (filters.workMode && filters.workMode.length > 0) {
      filtered = filtered.filter(job => {
        const jobText = `${job.title} ${job.description} ${job.location}`.toLowerCase();
        return filters.workMode.some(mode => {
          if (mode.toLowerCase() === 'remote') {
            return jobText.includes('remote');
          } else if (mode.toLowerCase() === 'hybrid') {
            return jobText.includes('hybrid');
          } else if (mode.toLowerCase() === 'on-site' || mode.toLowerCase() === 'onsite') {
            return jobText.includes('on-site') || jobText.includes('onsite') || jobText.includes('office');
          }
          return false;
        });
      });
    }

    // Filter by job type (Full-time, Part-time, Contract, Internship)
    if (filters.jobType && filters.jobType.length > 0) {
      filtered = filtered.filter(job => {
        const jobText = `${job.title} ${job.description}`.toLowerCase();
        return filters.jobType.some(type => {
          const typeNormalized = type.toLowerCase().replace('-', ' ').replace('_', ' ');
          return jobText.includes(typeNormalized) || 
                 jobText.includes(type.toLowerCase());
        });
      });
    }

    // Filter by match score
    if (filters.matchScore) {
      if (filters.matchScore === 'high') {
        filtered = filtered.filter(job => (job.matchScore || 0) >= 70);
      } else if (filters.matchScore === 'medium') {
        filtered = filtered.filter(job => {
          const score = job.matchScore || 0;
          return score >= 40 && score < 70;
        });
      }
    }

    // Filter by location
    if (filters.location) {
      filtered = filtered.filter(job => {
        const location = (job.location || '').toLowerCase();
        return location.includes(filters.location.toLowerCase());
      });
    }

    // Filter by skills
    if (filters.skills && filters.skills.length > 0) {
      filtered = filtered.filter(job => {
        const jobText = `${job.title} ${job.description}`.toLowerCase();
        return filters.skills.some(skill => 
          jobText.includes(skill.toLowerCase())
        );
      });
    }

    // Filter by role/title
    if (filters.role) {
      filtered = filtered.filter(job => {
        const title = job.title.toLowerCase();
        return title.includes(filters.role.toLowerCase());
      });
    }

    // Filter by date posted
    if (filters.datePosted) {
      filtered = filtered.filter(job => {
        const jobDate = new Date(job.created || job.createdAt || Date.now());
        const now = new Date();
        const hoursDiff = (now - jobDate) / (1000 * 60 * 60);
        
        if (filters.datePosted === 'last_24_hours') return hoursDiff <= 24;
        if (filters.datePosted === 'last_week') return hoursDiff <= 168;
        if (filters.datePosted === 'last_month') return hoursDiff <= 720;
        return true;
      });
    }

    return filtered;
  };

  const filteredJobs = getFilteredJobs();

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-700">{error}</p>
        <button
          onClick={loadJobs}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header with active filters */}
      <div className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h2 className="text-2xl font-bold text-gray-900">
            All Jobs
            <span className="text-gray-500 font-normal ml-2">
              ({filteredJobs.length} {filteredJobs.length === 1 ? 'job' : 'jobs'} found)
            </span>
          </h2>
          
          {Object.keys(filters).length > 0 && !filters.clear && !filters.clearAll && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm text-gray-600 font-medium">Active filters:</span>
              {filters.workMode && filters.workMode.length > 0 && (
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium border border-blue-200">
                  {filters.workMode.join(', ')}
                </span>
              )}
              {filters.jobType && filters.jobType.length > 0 && (
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium border border-green-200">
                  {filters.jobType.join(', ')}
                </span>
              )}
              {filters.matchScore && (
                <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium border border-purple-200">
                  {filters.matchScore} match
                </span>
              )}
              {filters.skills && filters.skills.length > 0 && (
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium border border-yellow-200">
                  {filters.skills.join(', ')}
                </span>
              )}
              {filters.location && (
                <span className="px-3 py-1 bg-pink-100 text-pink-800 rounded-full text-sm font-medium border border-pink-200">
                  📍 {filters.location}
                </span>
              )}
              {filters.role && (
                <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium border border-indigo-200">
                  {filters.role}
                </span>
              )}
              {filters.datePosted && (
                <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium border border-orange-200">
                  {filters.datePosted.replace('_', ' ')}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Jobs Grid */}
      {filteredJobs.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
          <p className="text-gray-600 text-lg font-semibold mb-2">
            No jobs found matching your filters
          </p>
          <p className="text-gray-500">
            Try adjusting your filters or clearing them to see more jobs.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
};

// Job Card Component
const JobCard = ({ job }) => {
  const [isApplied, setIsApplied] = useState(false);
  const [applying, setApplying] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkApplied = async () => {
      try {
        setChecking(true);
        const response = await applicationsAPI.checkApplied(String(job.id));
        setIsApplied(response.data.applied);
      } catch (error) {
        console.error('Error checking application:', error);
      } finally {
        setChecking(false);
      }
    };

    if (job?.id) {
      checkApplied();
    } else {
      setChecking(false);
    }
  }, [job?.id]);

  const handleApply = async () => {
    if (!job?.id || applying) return;

    setApplying(true);

    try {
      // Open job URL
      const applyUrl = job.redirect_url || job.applyUrl || job.apply_url;
      if (applyUrl && applyUrl !== '#') {
        window.open(applyUrl, '_blank');
      }

      // Wait for user to apply
      setTimeout(async () => {
        const confirmed = window.confirm(
          `Did you apply to ${job.title} at ${job.company}?`
        );

        if (confirmed) {
          try {
            await applicationsAPI.create({
              jobId: String(job.id),
              jobTitle: job.title || 'Untitled Position',
              company: job.company || 'Unknown Company',
              location: job.location || '',
              jobUrl: applyUrl,
              matchScore: job.matchScore || 0,
              appliedDate: new Date().toISOString(),
            });

            setIsApplied(true);
            alert('✅ Application tracked successfully!');
          } catch (error) {
            console.error('Error creating application:', error);
            
            if (error.response?.data?.error === 'Application already tracked') {
              setIsApplied(true);
              alert('This application was already tracked');
            } else {
              alert('Error tracking application: ' + (error.response?.data?.error || error.message));
            }
          }
        }

        setApplying(false);
      }, 3000);

    } catch (error) {
      console.error('Apply error:', error);
      setApplying(false);
    }
  };

  const getMatchColor = (score) => {
    if (!score || score === 0) return 'bg-gray-100 text-gray-700 border-gray-200';
    if (score >= 70) return 'bg-green-100 text-green-700 border-green-200';
    if (score >= 40) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    return 'bg-orange-100 text-orange-700 border-orange-200';
  };

  if (!job) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex justify-between items-start mb-3 gap-3">
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 flex-1">
          {job.title || 'Untitled Position'}
        </h3>
        <span className={`px-3 py-1 rounded-full text-sm font-semibold border flex-shrink-0 ${getMatchColor(job.matchScore)}`}>
          {Math.round(job.matchScore || 0)}%
        </span>
      </div>

      {/* Company */}
      <p className="text-gray-700 font-medium mb-3">
        {job.company || 'Unknown Company'}
      </p>

      {/* Location */}
      <div className="flex items-center gap-2 text-gray-600 mb-4">
        <MapPin size={16} className="flex-shrink-0" />
        <span className="text-sm line-clamp-1">{job.location || 'Location not specified'}</span>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 line-clamp-3 mb-4 leading-relaxed">
        {job.description ? job.description.replace(/<[^>]*>/g, '').substring(0, 150) : 'No description available'}
        {job.description && job.description.length > 150 && '...'}
      </p>

      {/* Match Details (if available) */}
      {job.matchDetails?.matchingSkills?.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-gray-500 font-semibold mb-2">Matching Skills:</p>
          <div className="flex flex-wrap gap-1">
            {job.matchDetails.matchingSkills.slice(0, 3).map((skill, idx) => (
              <span
                key={idx}
                className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium"
              >
                {skill}
              </span>
            ))}
            {job.matchDetails.matchingSkills.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                +{job.matchDetails.matchingSkills.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Apply Button */}
      <button
        onClick={handleApply}
        disabled={isApplied || applying || checking}
        className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all ${
          isApplied
            ? 'bg-green-100 text-green-700 border-2 border-green-200 cursor-not-allowed'
            : applying
            ? 'bg-gray-400 text-white cursor-wait'
            : checking
            ? 'bg-gray-200 text-gray-500 cursor-wait'
            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md'
        }`}
      >
        {checking ? (
          <>
            <Loader size={18} className="animate-spin" />
            Checking...
          </>
        ) : applying ? (
          <>
            <Loader size={18} className="animate-spin" />
            Processing...
          </>
        ) : isApplied ? (
          <>
            <CheckCircle size={18} />
            Already Applied
          </>
        ) : (
          <>
            Apply Now
            <ExternalLink size={16} />
          </>
        )}
      </button>
    </div>
  );
};

export default JobFeed;