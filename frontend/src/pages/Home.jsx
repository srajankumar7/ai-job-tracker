import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Briefcase, LogOut, FileText, TrendingUp } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { jobsAPI } from "../utils/api";
import ResumeUploader from "../components/ResumeUploader";
import AIAssistant from "../components/AIAssistant";
import JobFeed from "../components/JobFeed";

const Home = () => {
  const { user, logout, hasResume, resumeVersion } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ avgMatch: 0, highMatch: 0, total: 0 });
  const [loadingStats, setLoadingStats] = useState(true);
  const [filters, setFilters] = useState({});

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleFilterUpdate = (newFilters) => {
    console.log('🔧 Received filters:', newFilters);
    
    if (newFilters.clear || newFilters.clearAll) {
      setFilters({});
    } else {
      setFilters({ ...filters, ...newFilters });
    }
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoadingStats(true);
        const res = await jobsAPI.getStats();
        setStats(res.data);
      } catch (err) {
        console.error('Stats error:', err);
      } finally {
        setLoadingStats(false);
      }
    };

    if (hasResume) {
      fetchStats();
    } else {
      setLoadingStats(false);
    }
  }, [hasResume, resumeVersion]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Briefcase className="text-white" size={24} />
            </div>
            <h1 className="text-2xl font-bold">AI Job Tracker</h1>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-gray-600">Welcome, {user?.name || user?.email}</span>
            <ResumeUploader />
            <button onClick={() => navigate("/applications")} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
              <FileText size={18} />
              My Applications
            </button>
            <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg">
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {!hasResume && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold text-yellow-900 mb-1">Upload Your Resume</h3>
            <p className="text-yellow-700">Upload your resume to unlock AI-powered job matching!</p>
          </div>
        )}

        <div className="bg-white rounded-xl border p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="text-blue-600" size={32} />
            <h2 className="text-3xl font-bold">Your Job Matches</h2>
          </div>

          {hasResume && !loadingStats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="text-3xl font-bold text-green-600">{stats.avgMatch}%</div>
                <div className="text-gray-700 mt-1">Average Match</div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="text-3xl font-bold text-blue-600">{stats.highMatch}</div>
                <div className="text-gray-700 mt-1">High Match Jobs</div>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                <div className="text-3xl font-bold text-purple-600">{stats.total}</div>
                <div className="text-gray-700 mt-1">Total Jobs</div>
              </div>
            </div>
          )}
        </div>

        {hasResume && <JobFeed filters={filters} resumeVersion={resumeVersion} />}
      </main>

      <AIAssistant onFilterUpdate={handleFilterUpdate} currentFilters={filters} />
    </div>
  );
};

export default Home;