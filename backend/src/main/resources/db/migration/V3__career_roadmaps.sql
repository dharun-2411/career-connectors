-- =========================================================
-- V3: AI Career Roadmaps & Trending Domains Schema
-- =========================================================

-- Trending Domains Table (Curated and AI-assisted domains)
CREATE TABLE IF NOT EXISTS trending_domains (
    id BIGSERIAL PRIMARY KEY,
    domain_name VARCHAR(150) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL, -- Cloud, AI/Data, Engineering, Security, Design, Management
    popularity_tag VARCHAR(100) NOT NULL, -- High demand, Fast growing, Top salary, Emerging tech
    icon_name VARCHAR(50) DEFAULT 'Compass',
    is_active BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Career Roadmaps Cache Table (Aggressive caching to avoid redundant AI calls)
CREATE TABLE IF NOT EXISTS career_roadmaps (
    id BIGSERIAL PRIMARY KEY,
    domain_name VARCHAR(150) NOT NULL,
    overview TEXT NOT NULL,
    total_duration VARCHAR(100) NOT NULL,
    roadmap_json TEXT NOT NULL, -- Complete structured JSON (phases, resources, projects, certifications, tools)
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    generated_by VARCHAR(50) DEFAULT 'AI',
    version VARCHAR(20) DEFAULT '1.0'
);

CREATE INDEX IF NOT EXISTS idx_career_roadmaps_domain ON career_roadmaps(LOWER(domain_name));

-- Student Saved Roadmaps & Progress Tracking
CREATE TABLE IF NOT EXISTS student_saved_roadmaps (
    id BIGSERIAL PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    roadmap_id BIGINT NOT NULL REFERENCES career_roadmaps(id) ON DELETE CASCADE,
    saved_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    progress_json TEXT DEFAULT '{}', -- JSON tracking completed step IDs/keys
    last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_student_roadmap UNIQUE (student_id, roadmap_id)
);

CREATE INDEX IF NOT EXISTS idx_student_saved_roadmaps_student ON student_saved_roadmaps(student_id);

-- Seed Initial High-Growth Trending Domains
INSERT INTO trending_domains (domain_name, description, category, popularity_tag, icon_name, display_order) VALUES
('Cloud Computing', 'Architect, deploy, and scale resilient infrastructure on AWS, Azure, and Google Cloud.', 'Cloud', 'High demand', 'Cloud', 1),
('AI & Machine Learning', 'Develop generative models, deep neural networks, and agentic workflows with PyTorch & LLMs.', 'AI/Data', 'Fast growing', 'Sparkles', 2),
('Data Science', 'Extract predictive insights, analyze large-scale datasets, and build machine learning pipelines.', 'AI/Data', 'High demand', 'BarChart3', 3),
('Cybersecurity', 'Defend corporate networks, audit application vulnerabilities, and implement zero-trust architectures.', 'Security', 'Top salary', 'ShieldCheck', 4),
('DevOps & SRE', 'Automate CI/CD pipelines, container orchestration with Kubernetes, and maintain high availability.', 'Engineering', 'High demand', 'Layers', 5),
('Full Stack Web Development', 'Build modern end-to-end applications using React, Spring Boot, Node.js, and PostgreSQL.', 'Engineering', 'High demand', 'Code2', 6),
('Data Engineering', 'Construct reliable data pipelines, distributed warehouses, and stream processing with Kafka and Spark.', 'AI/Data', 'High salary', 'Database', 7),
('MLOps', 'Bridge machine learning and operations by automating model deployment, monitoring, and feature stores.', 'AI/Data', 'Emerging tech', 'Cpu', 8),
('Cloud Security', 'Secure multi-cloud environments, IAM policies, and automated compliance frameworks.', 'Security', 'High demand', 'Lock', 9),
('Blockchain & Web3', 'Engineer decentralized smart contracts, consensus mechanisms, and Web3 dApps.', 'Engineering', 'Emerging tech', 'Link2', 10),
('UI/UX Design', 'Design intuitive, accessibility-first digital user experiences, wireframes, and design systems in Figma.', 'Design', 'Creative', 'Palette', 11),
('Product Management', 'Lead cross-functional engineering teams, define product roadmaps, and drive market product-market fit.', 'Management', 'High impact', 'Target', 12)
ON CONFLICT (domain_name) DO NOTHING;
