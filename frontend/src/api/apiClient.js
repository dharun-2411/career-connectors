import axios from 'axios';

const getBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    const base = import.meta.env.VITE_API_BASE_URL.replace(/\/+$/, '');
    return `${base}/api/v1`;
  }
  return '/api/v1';
};

const apiClient = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Mock fallback generator for manual auth offline mode
const getMockDataForUrl = (url, method) => {
  const cleanUrl = url.split('?')[0];

  if (cleanUrl.includes('/student/profile')) {
    const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
    return {
      id: savedUser.profileId || 101,
      name: savedUser.name || 'Alex Chen',
      email: savedUser.email || 'alex.chen@university.edu',
      phone: '+1 (555) 234-5678',
      education: savedUser.education || 'B.S. Computer Science',
      university: savedUser.university || 'University of Washington',
      graduationYear: savedUser.graduationYear || 2025,
      bio: 'Passionate full-stack developer with experience building modern web apps and scalable cloud services.',
      skills: [
        { id: 1, skill: { id: 1, name: 'Java', category: 'Programming' }, proficiencyLevel: 'ADVANCED' },
        { id: 2, skill: { id: 2, name: 'Spring Boot', category: 'Framework' }, proficiencyLevel: 'ADVANCED' },
        { id: 3, skill: { id: 3, name: 'React.js', category: 'Framework' }, proficiencyLevel: 'INTERMEDIATE' },
        { id: 4, skill: { id: 4, name: 'PostgreSQL', category: 'Database' }, proficiencyLevel: 'INTERMEDIATE' },
      ],
    };
  }

  if (cleanUrl.includes('/student/skills')) {
    return [
      { id: 1, skill: { id: 1, name: 'Java', category: 'Programming' }, proficiencyLevel: 'ADVANCED' },
      { id: 2, skill: { id: 2, name: 'Spring Boot', category: 'Framework' }, proficiencyLevel: 'ADVANCED' },
      { id: 3, skill: { id: 3, name: 'React.js', category: 'Framework' }, proficiencyLevel: 'INTERMEDIATE' },
      { id: 4, skill: { id: 4, name: 'PostgreSQL', category: 'Database' }, proficiencyLevel: 'INTERMEDIATE' },
    ];
  }

  if (cleanUrl.includes('/company/profile')) {
    const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
    const verifiedCompanies = JSON.parse(localStorage.getItem('verified_companies') || '["1","2","recruiter@nexusai.com","hiring@cloudscale.io","shakthisaran@gmail.com"]');
    
    // Check if this company has been approved by admin
    const isApproved =
      verifiedCompanies.includes(String(savedUser.profileId)) ||
      verifiedCompanies.includes(String(savedUser.userId)) ||
      verifiedCompanies.includes(savedUser.email) ||
      savedUser.verificationStatus === 'VERIFIED';

    return {
      id: savedUser.profileId || 102,
      name: savedUser.name || 'Nexus AI Technologies',
      industry: savedUser.industry || 'Artificial Intelligence & Enterprise Software',
      website: savedUser.website || 'https://nexusai.example.com',
      location: savedUser.location || 'San Francisco, CA',
      description: 'Pioneering enterprise AI workflows and autonomous agents for next-generation intelligence.',
      verificationStatus: isApproved ? 'VERIFIED' : 'PENDING',
    };
  }

  if (cleanUrl.includes('/company/opportunities')) {
    return {
      content: [
        {
          id: 1,
          title: 'Full Stack AI Engineering Intern',
          location: 'San Francisco, CA',
          type: 'INTERNSHIP',
          status: 'OPEN',
          stipend: '$5,500 / month',
          applicationsCount: 4,
          deadline: '2026-10-31',
          createdAt: new Date().toISOString(),
        },
        {
          id: 2,
          title: 'Junior Cloud Backend Engineer',
          location: 'Seattle, WA',
          type: 'FULL_TIME',
          status: 'OPEN',
          stipend: '$95,000 - $115,000 / year',
          applicationsCount: 7,
          deadline: '2026-09-30',
          createdAt: new Date().toISOString(),
        },
      ],
      totalElements: 2,
      totalPages: 1,
    };
  }

  if (cleanUrl.includes('/applications/my')) {
    return {
      content: [
        {
          id: 1,
          opportunity: {
            id: 1,
            title: 'Full Stack AI Engineering Intern',
            company: { name: 'Nexus AI Technologies' },
            location: 'San Francisco, CA',
            type: 'INTERNSHIP',
          },
          status: 'UNDER_REVIEW',
          matchScore: 88.5,
          appliedAt: new Date().toISOString(),
        },
      ],
      totalElements: 1,
      totalPages: 1,
    };
  }

  if (cleanUrl.includes('/applications/company')) {
    return {
      content: [
        {
          id: 1,
          student: {
            name: 'Alex Chen',
            email: 'alex.chen@university.edu',
            university: 'University of Washington',
            education: 'B.S. Computer Science',
          },
          opportunity: { title: 'Full Stack AI Engineering Intern' },
          status: 'UNDER_REVIEW',
          matchScore: 88.5,
          appliedAt: new Date().toISOString(),
        },
      ],
      totalElements: 1,
      totalPages: 1,
    };
  }

  if (cleanUrl.includes('/admin/stats')) {
    return {
      totalStudents: 142,
      totalCompanies: 28,
      totalOpportunities: 56,
      totalApplications: 312,
      verifiedCompaniesCount: 22,
      pendingCompaniesCount: 6,
      activeOpportunitiesCount: 45,
    };
  }

  if (cleanUrl.includes('/admin/students')) {
    return {
      content: [
        { id: 1, name: 'Alex Chen', user: { email: 'alex.chen@university.edu', status: 'ACTIVE' }, university: 'University of Washington', graduationYear: 2025 },
        { id: 2, name: 'Maya Patel', user: { email: 'maya.patel@stanford.edu', status: 'ACTIVE' }, university: 'Stanford University', graduationYear: 2025 },
      ],
      totalElements: 2,
      totalPages: 1,
    };
  }

  if (cleanUrl.includes('/admin/companies') && cleanUrl.includes('/verify')) {
    const parts = cleanUrl.split('/');
    const verifyIdx = parts.indexOf('verify');
    const companyId = parts[verifyIdx - 1];
    const verifiedCompanies = JSON.parse(localStorage.getItem('verified_companies') || '["1","2","recruiter@nexusai.com","hiring@cloudscale.io","shakthisaran@gmail.com"]');
    if (!verifiedCompanies.includes(String(companyId))) {
      verifiedCompanies.push(String(companyId));
      localStorage.setItem('verified_companies', JSON.stringify(verifiedCompanies));
    }
    const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (String(savedUser.profileId) === String(companyId) || String(savedUser.userId) === String(companyId)) {
      savedUser.verificationStatus = 'VERIFIED';
      localStorage.setItem('user', JSON.stringify(savedUser));
    }
    return {
      id: Number(companyId),
      verificationStatus: 'VERIFIED',
      verificationNotes: 'Approved by platform administrator',
    };
  }

  if (cleanUrl.includes('/admin/companies')) {
    const verifiedCompanies = JSON.parse(localStorage.getItem('verified_companies') || '["1","2","recruiter@nexusai.com","hiring@cloudscale.io","shakthisaran@gmail.com"]');
    const baseList = [
      { id: 6, name: 'Databricks', industry: 'cloud', verificationStatus: verifiedCompanies.includes('6') ? 'VERIFIED' : 'PENDING', location: 'chennai', email: 'dharanidharanmp@gmail.com' },
      { id: 5, name: 'Test Company Corp', industry: 'Tech', verificationStatus: verifiedCompanies.includes('5') ? 'VERIFIED' : 'PENDING', location: 'New York', email: 'testnewcompany1@example.com' },
      { id: 4, name: 'oracle', industry: 'web', verificationStatus: 'VERIFIED', location: 'chennai', email: 'shakthisaran@gmail.com' },
      { id: 3, name: 'FinTech Innovations Corp', industry: 'Financial Technology & Web3', verificationStatus: verifiedCompanies.includes('3') ? 'VERIFIED' : 'PENDING', location: 'New York, NY', email: 'talent@fintechinnovations.com', documentsUrl: 'https://example.com/docs' },
      { id: 2, name: 'CloudScale Systems', industry: 'Cloud Infrastructure & DevOps', verificationStatus: 'VERIFIED', location: 'Seattle, WA', email: 'hiring@cloudscale.io' },
      { id: 1, name: 'Nexus AI Technologies', industry: 'Artificial Intelligence & Enterprise Software', verificationStatus: 'VERIFIED', location: 'San Francisco, CA', email: 'recruiter@nexusai.com' },
    ];
    return {
      content: baseList,
      totalElements: baseList.length,
      totalPages: 1,
    };
  }

  if (cleanUrl.includes('/admin/opportunities') || cleanUrl.includes('/opportunities')) {
    return {
      content: [
        { id: 1, title: 'Full Stack AI Engineering Intern', company: { name: 'Nexus AI Technologies' }, location: 'San Francisco, CA', type: 'INTERNSHIP', stipend: '$5,500 / month', status: 'OPEN' },
        { id: 2, title: 'Junior Cloud Backend Engineer', company: { name: 'CloudScale Systems' }, location: 'Seattle, WA', type: 'FULL_TIME', stipend: '$95,000 - $115,000 / year', status: 'OPEN' },
      ],
      totalElements: 2,
      totalPages: 1,
    };
  }

  if (cleanUrl.includes('/ai/recommendations') || cleanUrl.includes('/ai/')) {
    return {
      recommendations: [
        { id: 1, title: 'Full Stack AI Engineering Intern', companyName: 'Nexus AI Technologies', matchScore: 92, reason: 'Strong match for Java, Spring Boot, and React.' },
        { id: 2, title: 'Junior Cloud Backend Engineer', companyName: 'CloudScale Systems', matchScore: 86, reason: 'Strong alignment with your PostgreSQL and Spring Boot skills.' },
      ],
    };
  }

  return { success: true, message: 'Simulated response' };
};

// Request Interceptor to attach JWT token
apiClient.interceptors.request.use(
  (config) => {
    const isAuthRoute = config.url?.startsWith('/auth/login') || config.url?.startsWith('/auth/register');
    if (!isAuthRoute) {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor for handling global authentication & graceful fallback
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const isManualAuth = localStorage.getItem('isManualAuth') === 'true';

    // If in manual auth mode and a backend call fails (network error, 401, 404, or 500)
    if (isManualAuth && error.config?.url && !error.config.url.startsWith('/auth/login') && !error.config.url.startsWith('/auth/register')) {
      const mockData = getMockDataForUrl(error.config.url, error.config.method);
      if (mockData) {
        return Promise.resolve({
          data: {
            success: true,
            message: 'Manual auth mock response',
            data: mockData,
          },
          status: 200,
          statusText: 'OK',
          headers: {},
          config: error.config,
        });
      }
    }

    if (error.response && error.response.status === 401) {
      // Clear token on unauthorized ONLY if not in manual auth mode and not on auth pages
      if (!isManualAuth && !window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login?session_expired=true';
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
