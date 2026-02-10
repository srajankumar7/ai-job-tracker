import React, { useState } from 'react';
import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react';
import { authAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const ResumeUploader = () => {
  const auth = useAuth();

  const hasResume = auth?.hasResume;
  const setHasResume = auth?.setHasResume;
  const setResumeVersion = auth?.setResumeVersion;

  const [isOpen, setIsOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const validTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!validTypes.includes(selectedFile.type)) {
      setUploadStatus('error');
      setErrorMessage('Please upload a PDF or Word document');
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setUploadStatus('error');
      setErrorMessage('File size must be less than 5MB');
      return;
    }

    setFile(selectedFile);
    setUploadStatus(null);
    setErrorMessage('');
  };

  const handleUpload = async () => {
    if (!file || uploading) return;

    setUploading(true);
    setUploadStatus(null);
    setErrorMessage('');

    try {
      const formData = new FormData();
      formData.append('resume', file);

      await authAPI.uploadResume(formData);

      // ✅ SAFE STATE UPDATES
      if (typeof setHasResume === 'function') {
        setHasResume(true);
      }

      if (typeof setResumeVersion === 'function') {
        setResumeVersion((v) => (typeof v === 'number' ? v + 1 : 1));
      }

      setUploadStatus('success');
      setFile(null);

      setTimeout(() => {
        setIsOpen(false);
        setUploadStatus(null);
      }, 1800);
    } catch (error) {
      console.error('Resume upload failed:', error);
      setUploadStatus('error');
      setErrorMessage(
        error.response?.data?.error ||
          error.response?.data?.message ||
          'Failed to upload resume'
      );
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    if (uploading) return;
    setIsOpen(false);
    setFile(null);
    setUploadStatus(null);
    setErrorMessage('');
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
          hasResume
            ? 'bg-green-600 hover:bg-green-700 text-white'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        <Upload size={18} />
        {hasResume ? 'Update Resume' : 'Upload Resume'}
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative">
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={22} />
            </button>

            <h2 className="text-2xl font-bold mb-2">
              {hasResume ? 'Update Your Resume' : 'Upload Your Resume'}
            </h2>

            <p className="text-sm text-gray-600 mb-6">
              Upload a resume to refresh AI job matching
            </p>

            <label className="block cursor-pointer mb-4">
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center ${
                  file ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                }`}
              >
                <Upload size={40} className="mx-auto mb-2 text-gray-500" />
                {file ? file.name : 'Click to select resume'}
              </div>
              <input
                type="file"
                hidden
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
              />
            </label>

            {uploadStatus === 'success' && (
              <div className="mb-4 flex gap-2 text-green-700">
                <CheckCircle /> Resume uploaded successfully
              </div>
            )}

            {uploadStatus === 'error' && (
              <div className="mb-4 flex gap-2 text-red-700">
                <AlertCircle /> {errorMessage}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleClose}
                className="flex-1 bg-gray-200 py-2 rounded"
              >
                Cancel
              </button>

              <button
                onClick={handleUpload}
                disabled={!file || uploading}
                className="flex-1 bg-blue-600 text-white py-2 rounded disabled:bg-gray-400"
              >
                {uploading ? 'Uploading…' : 'Upload Resume'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ResumeUploader;
