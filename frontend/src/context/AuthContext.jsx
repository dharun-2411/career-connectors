import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';

const AuthContext = createContext(null);

const DEFAULT_PROFILES = {
  ROLE_STUDENT: {
    userId: 101,
    profileId: 101,
    email: 'alex.chen@university.edu',
    name: 'Alex Chen',
    role: 'ROLE_STUDENT',
    university: 'University of Washington',
    education: 'B.S. Computer Science',
    graduationYear: 2025,
  },
  ROLE_COMPANY: {
    userId: 102,
    profileId: 102,
    email: 'recruiter@nexusai.com',
    name: 'Nexus AI Technologies',
    role: 'ROLE_COMPANY',
    industry: 'Artificial Intelligence & Cloud',
    location: 'San Francisco, CA',
  },
  ROLE_ADMIN: {
    userId: 103,
    profileId: 103,
    email: 'admin@careerconnectors.io',
    name: 'Platform Administrator',
    role: 'ROLE_ADMIN',
    department: 'Platform Operations & Quality Assurance',
  },
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
      const storedToken = localStorage.getItem('token');
      const isManual = localStorage.getItem('isManualAuth') === 'true';

      if (storedToken) {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          try {
            setUser(JSON.parse(savedUser));
          } catch (e) {
            console.error('Error parsing stored user:', e);
          }
        }

        if (!isManual) {
          try {
            const res = await authApi.getMe();
            if (res && res.success) {
              setUser(res.data);
              localStorage.setItem('user', JSON.stringify(res.data));
            }
          } catch (err) {
            console.error('Session validation failed, using cached session:', err);
          }
        }
      }
      setLoading(false);
    };

    verifyUser();
  }, []);

  const login = async (credentials) => {
    localStorage.removeItem('isManualAuth');
    const res = await authApi.login(credentials);
    if (res && res.success) {
      const authData = res.data;
      setToken(authData.token);
      setUser(authData);
      localStorage.setItem('token', authData.token);
      localStorage.setItem('user', JSON.stringify(authData));
      return authData;
    }
    throw new Error(res?.message || 'Login failed');
  };

  const loginManually = (role = 'ROLE_STUDENT', customData = {}) => {
    const base = DEFAULT_PROFILES[role] || DEFAULT_PROFILES.ROLE_STUDENT;
    const authData = {
      token: `manual_token_${role.toLowerCase()}_${Date.now()}`,
      tokenType: 'Bearer',
      userId: customData.userId || base.userId,
      profileId: customData.profileId || base.profileId,
      email: customData.email || base.email,
      name: customData.name || base.name,
      role: role,
      isManualAuth: true,
      ...base,
      ...customData,
    };

    setToken(authData.token);
    setUser(authData);
    localStorage.setItem('token', authData.token);
    localStorage.setItem('user', JSON.stringify(authData));
    localStorage.setItem('isManualAuth', 'true');
    return authData;
  };

  const registerStudent = async (data) => {
    localStorage.removeItem('isManualAuth');
    const res = await authApi.registerStudent(data);
    if (res && res.success) {
      const authData = res.data;
      setToken(authData.token);
      setUser(authData);
      localStorage.setItem('token', authData.token);
      localStorage.setItem('user', JSON.stringify(authData));
      return authData;
    }
    throw new Error(res?.message || 'Registration failed');
  };

  const registerCompany = async (data) => {
    localStorage.removeItem('isManualAuth');
    const res = await authApi.registerCompany(data);
    if (res && res.success) {
      const authData = res.data;
      setToken(authData.token);
      setUser(authData);
      localStorage.setItem('token', authData.token);
      localStorage.setItem('user', JSON.stringify(authData));
      return authData;
    }
    throw new Error(res?.message || 'Registration failed');
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('isManualAuth');
    setToken(null);
    setUser(null);
  };

  const isStudent = user?.role === 'ROLE_STUDENT';
  const isCompany = user?.role === 'ROLE_COMPANY';
  const isAdmin = user?.role === 'ROLE_ADMIN';
  const isManualAuth = user?.isManualAuth || localStorage.getItem('isManualAuth') === 'true';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        loginManually,
        registerStudent,
        registerCompany,
        logout,
        isAuthenticated: !!token && !!user,
        isStudent,
        isCompany,
        isAdmin,
        isManualAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
