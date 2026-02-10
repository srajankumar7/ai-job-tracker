import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { applicationsAPI } from "../utils/api";
import { 
  ArrowLeft, 
  Briefcase, 
  MapPin, 
  Calendar, 
  ExternalLink,
  Clock,
  CheckCircle,
  XCircle,
  Award,
  Users,
  Loader
} from "lucide-react";

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadApplications = async () => {
      try {
        setLoading(true);
        const res = await applicationsAPI.getAll();
        setApplications(res.data.applications || []);
      } catch (err) {
        console.error("Failed to load applications", err);
      } finally {
        setLoading(false);
      }
    };

    loadApplications();
  }, []);

  const getStatusColor = (status) => {
    const colors = {
      'Applied': 'bg-blue-100 text-blue-700 border-blue-200',
      'Interview': 'bg-purple-100 text-purple-700 border-purple-200',
      'Offer': 'bg-green-100 text-green-700 border-green-200',
      'Rejected': 'bg-red-100 text-red-700 border-red-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'Applied': <Clock size={16} />,
      'Interview': <Users size={16} />,
      'Offer': <Award size={16} />,
      'Rejected': <XCircle size={16} />,
    };
    return icons[status] || <Clock size={16} />;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin text-blue-600 mx-auto mb-4" size={40} />
          <p className="text-gray-600">Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="font-medium">Back to Dashboard</span>
            </button>
            
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Briefcase className="text-blue-600" size={28} />
              My Applications
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Applications List */}
        {applications.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center shadow-sm">
            <Briefcase className="mx-auto text-gray-400 mb-4" size={64} />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No applications yet
            </h3>
            <p className="text-gray-600 mb-6">
              Start applying to jobs to track your applications here
            </p>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Browse Jobs
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="mb-4">
              <p className="text-gray-600">
                {applications.length} {applications.length === 1 ? 'application' : 'applications'} tracked
              </p>
            </div>

            {applications.map((app) => (
              <div
                key={app._id}
                className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-2">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <Briefcase className="text-blue-600" size={20} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                          {app.jobTitle}
                        </h3>
                        <p className="text-gray-700 font-semibold">
                          {app.company}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {app.matchScore > 0 && (
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold border border-green-200">
                        {app.matchScore}% Match
                      </span>
                    )}
                    <span className={`px-4 py-2 rounded-lg text-sm font-semibold border flex items-center gap-2 ${getStatusColor(app.status)}`}>
                      {getStatusIcon(app.status)}
                      {app.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  {app.location && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin size={16} className="flex-shrink-0" />
                      <span className="text-sm">{app.location}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar size={16} className="flex-shrink-0" />
                    <span className="text-sm">
                      Applied {formatDate(app.appliedDate || app.createdAt)}
                    </span>
                  </div>

                  {app.jobUrl && (
                    <a
                      href={app.jobUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      <ExternalLink size={16} />
                      <span className="text-sm font-medium">View Job Posting</span>
                    </a>
                  )}
                </div>

                {app.timeline && app.timeline.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm font-semibold text-gray-700 mb-3">Application Timeline</p>
                    <div className="space-y-2">
                      {app.timeline.map((event, idx) => (
                        <div key={idx} className="flex items-center gap-3 text-sm">
                          <CheckCircle size={14} className="text-green-600 flex-shrink-0" />
                          <span className="text-gray-700">{event.notes || event.status}</span>
                          <span className="text-gray-500 ml-auto">
                            {formatDate(event.date)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Applications;