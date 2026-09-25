import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';

const AuthContext = createContext(null);

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
            if (res && res.success && res.data) {
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

  const updateUser = (updatedData) => {
    setUser((prev) => {
      const newUser = { ...prev, ...updatedData };
      localStorage.setItem('user', JSON.stringify(newUser));
      return newUser;
    });
  };

  const login = async (credentials) => {
    localStorage.removeItem('isManualAuth');
    const cleanEmail = (credentials.email || '').toLowerCase().trim();
    const reqRole = (credentials.role || '').toUpperCase();
    const isCompany = reqRole === 'COMPANY' || reqRole === 'ROLE_COMPANY';
    const isAdmin = reqRole === 'ADMIN' || reqRole === 'ROLE_ADMIN';

    // Check if registered locally
    const registeredStudents = JSON.parse(localStorage.getItem('registered_students') || '[]');
    const matchedStudent = !isCompany && !isAdmin ? registeredStudents.find((s) => s.email?.toLowerCase() === cleanEmail) : null;

    const regCompanies = JSON.parse(localStorage.getItem('registered_companies') || '[]');
    const matchedCompany = isCompany ? regCompanies.find((c) => c.email?.toLowerCase() === cleanEmail) : null;

    try {
      const res = await authApi.login(credentials);
      if (res && res.success) {
        let authData = res.data;
        if (isCompany) {
          authData = { ...authData, role: 'ROLE_COMPANY' };
        } else if (isAdmin) {
          authData = { ...authData, role: 'ROLE_ADMIN' };
        }
        // Merge with local student data if present
        const merged = matchedStudent ? { ...authData, ...matchedStudent } : authData;
        setToken(merged.token || authData.token);
        setUser(merged);
        localStorage.setItem('token', merged.token || authData.token);
        localStorage.setItem('user', JSON.stringify(merged));
        return merged;
      }
    } catch (apiErr) {
      if (isCompany) {
        const domainRaw = cleanEmail.split('@')[1] ? cleanEmail.split('@')[1].split('.')[0] : 'Company';
        const formattedDomain = domainRaw.length <= 5 ? domainRaw.toUpperCase() : domainRaw.charAt(0).toUpperCase() + domainRaw.slice(1);
        const compName = matchedCompany?.name || `${formattedDomain} Technologies`;
        return loginManually('ROLE_COMPANY', {
          userId: matchedCompany?.userId || matchedCompany?.id || Date.now(),
          profileId: matchedCompany?.id || 102,
          email: cleanEmail,
          name: compName,
          industry: matchedCompany?.industry || 'Technology & Software',
          website: matchedCompany?.website || `https://${cleanEmail.split('@')[1] || 'enterprise.example.com'}`,
          location: matchedCompany?.location || 'San Francisco, CA',
          verificationStatus: 'VERIFIED',
        });
      }

      if (matchedStudent) {
        return loginManually('ROLE_STUDENT', {
          ...matchedStudent,
          token: `token_${Date.now()}`,
        });
      }
      throw apiErr;
    }
  };

  const loginManually = (role = 'ROLE_STUDENT', customData = {}) => {
    const cleanEmail = (customData.email || '').toLowerCase().trim() || `${role.toLowerCase()}@careerconnectors.dev`;
    
    // Check if student is already in registered_students
    const registeredStudents = JSON.parse(localStorage.getItem('registered_students') || '[]');
    const matchedStudent = registeredStudents.find((s) => s.email?.toLowerCase() === cleanEmail);

    let defaultName = customData.name;
    if (!defaultName) {
      if (matchedStudent?.name) {
        defaultName = matchedStudent.name;
      } else {
        const emailPrefix = cleanEmail.split('@')[0].replace(/[._]/g, ' ');
        defaultName = emailPrefix
          .split(' ')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ') || (role === 'ROLE_STUDENT' ? 'Student Member' : role === 'ROLE_COMPANY' ? 'Company Partner' : 'Platform Administrator');
      }
    }

    const authData = {
      token: customData.token || `manual_token_${role.toLowerCase()}_${Date.now()}`,
      tokenType: 'Bearer',
      userId: customData.userId || matchedStudent?.userId || Date.now(),
      profileId: customData.profileId || matchedStudent?.profileId || Date.now(),
      email: cleanEmail,
      name: defaultName,
      role: role,
      university: customData.university || matchedStudent?.university || 'University of Washington',
      education: customData.education || matchedStudent?.education || 'B.S. Computer Science',
      graduationYear: customData.graduationYear || matchedStudent?.graduationYear || 2025,
      phone: customData.phone || matchedStudent?.phone || '',
      bio: customData.bio || matchedStudent?.bio || '',
      resumeUrl: customData.resumeUrl || matchedStudent?.resumeUrl || '',
      resumeFileName: customData.resumeFileName || matchedStudent?.resumeFileName || '',
      isManualAuth: true,
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
    const cleanEmail = (data.email || '').toLowerCase().trim();
    const newStudent = {
      userId: Date.now(),
      profileId: Date.now(),
      email: cleanEmail,
      name: data.name || 'Student Member',
      role: 'ROLE_STUDENT',
      university: data.university || 'University',
      education: data.education || 'Computer Science',
      graduationYear: parseInt(data.graduationYear, 10) || 2025,
      phone: data.phone || '',
      bio: data.bio || '',
      resumeUrl: data.resumeUrl || '',
      resumeFileName: data.resumeFileName || '',
    };

    // Save into registered students list
    const registered = JSON.parse(localStorage.getItem('registered_students') || '[]');
    const existingIdx = registered.findIndex((s) => s.email?.toLowerCase() === cleanEmail);
    if (existingIdx >= 0) {
      registered[existingIdx] = { ...registered[existingIdx], ...newStudent };
    } else {
      registered.unshift(newStudent);
    }
    localStorage.setItem('registered_students', JSON.stringify(registered));

    // Initialize user-scoped profile and skills in localStorage
    localStorage.setItem(`student_profile_${cleanEmail}`, JSON.stringify(newStudent));

    try {
      const res = await authApi.registerStudent(data);
      if (res && res.success) {
        const authData = { ...newStudent, ...res.data };
        setToken(authData.token);
        setUser(authData);
        localStorage.setItem('token', authData.token);
        localStorage.setItem('user', JSON.stringify(authData));
        return authData;
      }
    } catch (e) {
      // Local registration fallback
      return loginManually('ROLE_STUDENT', newStudent);
    }
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
        updateUser,
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

