import React, { useState, useEffect } from 'react';
import { X, Check, Clock } from 'lucide-react';

const ApplicationPopup = ({ job, onClose, onSubmit }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [customDate, setCustomDate] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    // Auto-dismiss after 30 seconds
    const timer = setTimeout(() => {
      onClose();
    }, 30000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const handleSubmit = () => {
    if (selectedOption === 'yes') {
      onSubmit({
        applied: true,
        date: new Date(),
      });
    } else if (selectedOption === 'earlier' && customDate) {
      onSubmit({
        applied: true,
        date: new Date(customDate),
      });
    } else if (selectedOption === 'no') {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full mx-4 animate-slide-up">
        {/* Header */}
        <div className="bg-primary-600 text-white p-6 rounded-t-lg">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold mb-2">Application Status</h2>
              <p className="text-primary-100 text-sm">
                Did you apply to this position?
              </p>
            </div>
            <button
              onClick={onClose}
              className="hover:bg-primary-700 rounded p-1 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Job Info */}
        <div className="p-6 border-b border-gray-200">
          <h3 className="font-semibold text-lg text-gray-900">{job.title}</h3>
          <p className="text-gray-600">{job.company}</p>
          <p className="text-sm text-gray-500 mt-1">{job.location}</p>
        </div>

        {/* Options */}
        <div className="p-6 space-y-3">
          {/* Yes, Applied */}
          <button
            onClick={() => {
              setSelectedOption('yes');
              setShowDatePicker(false);
            }}
            className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
              selectedOption === 'yes'
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  selectedOption === 'yes'
                    ? 'border-green-500 bg-green-500'
                    : 'border-gray-300'
                }`}
              >
                {selectedOption === 'yes' && <Check size={16} className="text-white" />}
              </div>
              <div>
                <p className="font-medium text-gray-900">Yes, I applied</p>
                <p className="text-sm text-gray-500">Applied today</p>
              </div>
            </div>
          </button>

          {/* No, just browsing */}
          <button
            onClick={() => {
              setSelectedOption('no');
              setShowDatePicker(false);
            }}
            className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
              selectedOption === 'no'
                ? 'border-gray-500 bg-gray-50'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  selectedOption === 'no'
                    ? 'border-gray-500 bg-gray-500'
                    : 'border-gray-300'
                }`}
              >
                {selectedOption === 'no' && <X size={16} className="text-white" />}
              </div>
              <div>
                <p className="font-medium text-gray-900">No, just browsing</p>
                <p className="text-sm text-gray-500">Don't track this</p>
              </div>
            </div>
          </button>

          {/* Applied Earlier */}
          <button
            onClick={() => {
              setSelectedOption('earlier');
              setShowDatePicker(true);
            }}
            className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
              selectedOption === 'earlier'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  selectedOption === 'earlier'
                    ? 'border-blue-500 bg-blue-500'
                    : 'border-gray-300'
                }`}
              >
                {selectedOption === 'earlier' && <Clock size={16} className="text-white" />}
              </div>
              <div>
                <p className="font-medium text-gray-900">Applied earlier</p>
                <p className="text-sm text-gray-500">Select a date</p>
              </div>
            </div>
          </button>

          {/* Date Picker */}
          {showDatePicker && selectedOption === 'earlier' && (
            <div className="pl-9 animate-slide-down">
              <input
                type="date"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-6 bg-gray-50 rounded-b-lg flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={
              !selectedOption ||
              (selectedOption === 'earlier' && !customDate)
            }
            className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {selectedOption === 'no' ? 'Dismiss' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApplicationPopup;