import React from 'react';
import { X, Filter } from 'lucide-react';

const Filters = ({ filters, onFilterChange, onClearAll }) => {
  const handleChange = (key, value) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const handleMultiSelect = (key, value) => {
    const current = filters[key] || [];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    handleChange(key, updated.length > 0 ? updated : null);
  };

  const activeFiltersCount = Object.values(filters).filter(
    (v) => v !== null && v !== '' && (Array.isArray(v) ? v.length > 0 : true)
  ).length;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Filter size={20} />
          <h2 className="text-lg font-semibold">Filters</h2>
          {activeFiltersCount > 0 && (
            <span className="bg-primary-100 text-primary-700 px-2 py-1 rounded-full text-xs font-medium">
              {activeFiltersCount}
            </span>
          )}
        </div>
        {activeFiltersCount > 0 && (
          <button
            onClick={onClearAll}
            className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
          >
            <X size={16} />
            Clear All
          </button>
        )}
      </div>

      {/* Role/Title Search */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Role / Title
        </label>
        <input
          type="text"
          value={filters.role || ''}
          onChange={(e) => handleChange('role', e.target.value || null)}
          placeholder="e.g., React Developer"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {/* Skills Multi-select */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Skills
        </label>
        <div className="grid grid-cols-2 gap-2">
          {['React', 'Node.js', 'Python', 'Java', 'TypeScript', 'MongoDB', 'AWS', 'Docker'].map(
            (skill) => (
              <label key={skill} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.skills?.includes(skill) || false}
                  onChange={() => handleMultiSelect('skills', skill)}
                  className="rounded text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm">{skill}</span>
              </label>
            )
          )}
        </div>
      </div>

      {/* Date Posted */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Date Posted
        </label>
        <select
          value={filters.datePosted || ''}
          onChange={(e) => handleChange('datePosted', e.target.value || null)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">Any time</option>
          <option value="last_24_hours">Last 24 hours</option>
          <option value="last_week">Last week</option>
          <option value="last_month">Last month</option>
        </select>
      </div>

      {/* Job Type */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Job Type
        </label>
        <div className="space-y-2">
          {['Full-time', 'Part-time', 'Contract', 'Internship'].map((type) => (
            <label key={type} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.jobType?.includes(type) || false}
                onChange={() => handleMultiSelect('jobType', type)}
                className="rounded text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm">{type}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Work Mode */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Work Mode
        </label>
        <div className="space-y-2">
          {['Remote', 'Hybrid', 'On-site'].map((mode) => (
            <label key={mode} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.workMode?.includes(mode) || false}
                onChange={() => handleMultiSelect('workMode', mode)}
                className="rounded text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm">{mode}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Location */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Location
        </label>
        <input
          type="text"
          value={filters.location || ''}
          onChange={(e) => handleChange('location', e.target.value || null)}
          placeholder="e.g., San Francisco"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {/* Match Score */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Match Score
        </label>
        <select
          value={filters.matchScore || ''}
          onChange={(e) => handleChange('matchScore', e.target.value || null)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">All</option>
          <option value="high">High (&gt;70%)</option>
          <option value="medium">Medium (40-70%)</option>
        </select>
      </div>
    </div>
  );
};

export default Filters;