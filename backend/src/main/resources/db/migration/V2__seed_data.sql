-- Standard Skill Dictionary
INSERT INTO skills (name, category) VALUES
-- Programming Languages
('Java', 'Programming'),
('Python', 'Programming'),
('JavaScript', 'Programming'),
('TypeScript', 'Programming'),
('C++', 'Programming'),
('Go', 'Programming'),
('SQL', 'Programming'),

-- Frameworks & Libraries
('Spring Boot', 'Framework'),
('React.js', 'Framework'),
('Node.js', 'Framework'),
('FastAPI', 'Framework'),
('Django', 'Framework'),
('Next.js', 'Framework'),
('Vue.js', 'Framework'),
('TailwindCSS', 'Framework'),

-- Cloud & DevOps
('Docker', 'Cloud/DevOps'),
('Kubernetes', 'Cloud/DevOps'),
('AWS', 'Cloud/DevOps'),
('CI/CD', 'Cloud/DevOps'),
('Git', 'Cloud/DevOps'),
('Linux', 'Cloud/DevOps'),

-- Databases & Storage
('PostgreSQL', 'Database'),
('MongoDB', 'Database'),
('Redis', 'Database'),
('MySQL', 'Database'),

-- AI & Data Science
('Machine Learning', 'AI/Data Science'),
('Deep Learning', 'AI/Data Science'),
('LangGraph / LangChain', 'AI/Data Science'),
('Natural Language Processing', 'AI/Data Science'),
('PyTorch / TensorFlow', 'AI/Data Science'),
('Data Analysis / Pandas', 'AI/Data Science'),

-- Core & Soft Skills
('RESTful APIs', 'Architecture'),
('Microservices', 'Architecture'),
('System Design', 'Architecture'),
('Agile / Scrum', 'Soft Skill'),
('Problem Solving', 'Soft Skill'),
('Team Collaboration', 'Soft Skill')
ON CONFLICT (name) DO NOTHING;
