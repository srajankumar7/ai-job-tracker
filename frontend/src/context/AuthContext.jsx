import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasResume, setHasResume] = useState(false);
  const [resumeVersion, setResumeVersion] = useState(0); // 🔄 Track resume updates

  // Load user on mount
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        console.log('🔐 Loading user profile...');
        const response = await authAPI.getProfile();
        console.log('✅ User profile loaded:', response.data);
        
        const userData = response.data?.user || response.data;
        setUser(userData);
        
        // Check if user has resume
        const userHasResume = Boolean(
          userData?.resume?.text || 
          userData?.resume?.filename ||
          userData?.hasResume
        );
        setHasResume(userHasResume);
        
        // Initialize resume version from user data or timestamp
        if (userHasResume) {
          const initialVersion = userData?.resume?.uploadedAt 
            ? new Date(userData.resume.uploadedAt).getTime()
            : Date.now();
          setResumeVersion(initialVersion);
        }
        
        console.log('📄 Has resume:', userHasResume);
      } catch (error) {
        console.error('❌ Failed to load user:', error);
        // If token is invalid, clear it
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (credentials) => {
    try {
      console.log('🔐 Logging in...');
      const response = await authAPI.login(credentials);
      console.log('✅ Login successful:', response.data);
      
      const { token, user: userData } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
      
      // Check if user has resume
      const userHasResume = Boolean(
        userData?.resume?.text || 
        userData?.resume?.filename ||
        userData?.hasResume
      );
      setHasResume(userHasResume);
      
      // Initialize resume version
      if (userHasResume) {
        const initialVersion = userData?.resume?.uploadedAt 
          ? new Date(userData.resume.uploadedAt).getTime()
          : Date.now();
        setResumeVersion(initialVersion);
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ Login failed:', error);
      throw error;
    }
  };

  const register = async (credentials) => {
    try {
      console.log('📝 Registering...');
      const response = await authAPI.register(credentials);
      console.log('✅ Registration successful:', response.data);
      
      const { token, user: userData } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
      setHasResume(false);
      setResumeVersion(0);
      
      return response.data;
    } catch (error) {
      console.error('❌ Registration failed:', error);
      throw error;
    }
  };

  const logout = () => {
    console.log('👋 Logging out...');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setHasResume(false);
    setResumeVersion(0);
  };

  const updateUserProfile = async () => {
    try {
      console.log('🔄 Refreshing user profile...');
      const response = await authAPI.getProfile();
      console.log('✅ Profile refreshed:', response.data);
      
      const userData = response.data?.user || response.data;
      setUser(userData);
      
      // Update resume status
      const userHasResume = Boolean(
        userData?.resume?.text || 
        userData?.resume?.filename ||
        userData?.hasResume
      );
      setHasResume(userHasResume);
      
      return userData;
    } catch (error) {
      console.error('❌ Failed to refresh profile:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    hasResume,
    setHasResume,
    resumeVersion,      // 🔄 Expose resume version
    setResumeVersion,   // 🔄 Expose setter for resume version
    login,
    register,
    logout,
    updateUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;