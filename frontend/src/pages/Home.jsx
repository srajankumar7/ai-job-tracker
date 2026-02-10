import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Briefcase, LogOut, FileText } from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { jobsAPI, applicationsAPI } from "../utils/api";
import ResumeUploader from "../components/ResumeUploader";
import AIAssistant from "../components/AIAssistant";
import JobFeed from "../components/JobFeed";

const Home = () => {
  const { user, logout, hasResume, resumeVersion } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    avgMatch: 0,
    highMatch: 0,
    total: 0,
  });

  const [loadingStats, setLoadingStats] = useState(true);
  const [filters, setFilters] = useState({});

  useEffect(() => {
    const loadStats = async () => {
      if (!hasResume) {
        setLoadingStats(false);
        return;
      }

      try {
        setLoadingStats(true);
        const res = await jobsAPI.getStats();
        setStats(res.data);
      } catch (error) {
        console.error("Failed to load stats:", error);
      } finally {
        setLoadingStats(false);
      }
    };

    loadStats();
  }, [hasResume, resumeVersion]);

  const handleFilterUpdate = (newFilters) => {
    if (newFilters?.clear || newFilters?.clearAll) {
      setFilters({});
    } else {
      setFilters(newFilters);
    }
  };

  const handleApply = async (job) => {
    try {
      await applicationsAPI.create({
        jobId: job.id,
        jobTitle: job.title,
        company: job.company,
        location: job.location,
        jobUrl: job.applyUrl || job.redirect_url,
        matchScore: job.matchScore,
      });

      window.open(job.applyUrl || job.redirect_url, "_blank");
    } catch (err) {
      alert(
        err.response?.data?.error ||
          "Job already applied or server error"
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2.5 rounded-lg">
                <Briefcase className="text-white" size={24} />
              </div>
              <h1 className="text-xl font-bold text-gray-900">
                AI Job Tracker
              </h1>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
              <span className="text-gray-600 text-sm">
                Welcome,{" "}
                <span className="font-medium text-gray-900">
                  {user?.name || user?.email || "test"}
                </span>
              </span>

              {/* ✅ FIXED: REAL RESUME UPLOADER */}
              <ResumeUploader />

              <button
                onClick={() => navigate("/applications")}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium"
              >
                <FileText size={18} />
                My Applications
              </button>

              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Upload Resume Banner */}
        {!hasResume && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold text-yellow-900 mb-1">
              Upload Your Resume to Get Started
            </h3>
            <p className="text-yellow-700">
              Upload your resume to unlock AI-powered job matching and
              personalized recommendations
            </p>
          </div>
        )}

        {/* Stats */}
        {hasResume && (
          <div className="bg-white rounded-2xl shadow-sm mb-8 p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Your Job Matches
            </h2>

            {!loadingStats ? (
              <div className="grid grid-cols-3 gap-16">
                <div>
                  <div className="text-5xl font-bold text-gray-900 mb-2">
                    {stats.avgMatch}%
                  </div>
                  <div className="text-gray-600">Avg Match</div>
                </div>

                <div>
                  <div className="text-5xl font-bold text-gray-900 mb-2">
                    {stats.highMatch}
                  </div>
                  <div className="text-gray-600">High Match</div>
                </div>

                <div>
                  <div className="text-5xl font-bold text-gray-900 mb-2">
                    {stats.total}
                  </div>
                  <div className="text-gray-600">Jobs</div>
                </div>
              </div>
            ) : (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              </div>
            )}
          </div>
        )}

        {/* Job Feed */}
        {hasResume && (
          <JobFeed
            filters={filters}
            resumeVersion={resumeVersion}
            onApply={handleApply}
          />
        )}

        {/* No Resume State */}
        {!hasResume && (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <ResumeUploader />
          </div>
        )}
      </main>

      {/* AI Assistant */}
      <AIAssistant
        onFilterUpdate={handleFilterUpdate}
        currentFilters={filters}
      />
    </div>
  );
};

export default Home;
