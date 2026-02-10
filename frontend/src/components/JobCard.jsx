import React from "react";
import { MapPin, ExternalLink } from "lucide-react";

const JobCard = ({ job, onApply, isApplied = false }) => {
  if (!job || !job.id) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-200 flex flex-col">
      {/* Header with Title and Match Badge */}
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-xl font-bold text-gray-900 flex-1 pr-4">
          {job.title}
        </h3>

        {job.matchScore !== undefined && job.matchScore > 0 && (
          <span className="px-3 py-1.5 rounded-full text-sm font-semibold bg-green-100 text-green-700 border border-green-200 whitespace-nowrap">
            {job.matchScore}% Match
          </span>
        )}
      </div>

      {/* Company Name */}
      <p className="text-base text-gray-900 font-semibold mb-3">{job.company}</p>

      {/* Location */}
      <div className="flex items-center gap-2 text-gray-600 mb-4">
        <MapPin size={16} className="flex-shrink-0" />
        <span className="text-sm">{job.location}</span>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-700 mb-5 line-clamp-4 flex-grow leading-relaxed">
        {job.description}
      </p>

      {/* Apply Button */}
      <button
        disabled={isApplied}
        onClick={() => onApply(job)}
        className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${
          isApplied
            ? "bg-gray-300 cursor-not-allowed text-gray-600"
            : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md"
        }`}
      >
        {isApplied ? (
          "Applied"
        ) : (
          <>
            Apply Now
            <ExternalLink size={18} />
          </>
        )}
      </button>
    </div>
  );
};

export default JobCard;