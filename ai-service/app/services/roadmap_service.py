import os
import re
import json
import httpx
from typing import Dict, List, Optional
from ..schemas.roadmap import (
    RoadmapSchema,
    RoadmapPhaseSchema,
    RoadmapResourceSchema,
    RoadmapProjectSchema,
    RoadmapRequestSchema
)

class RoadmapService:
    """
    AI-assisted career roadmap generator.
    Produces structured, stepwise learning phases, curated non-fabricated resources,
    practical project milestones, certifications, and industry demand context.
    """

    def __init__(self):
        # Curated domain knowledge base templates for top high-demand tech trajectories
        self.knowledge_base = self._initialize_knowledge_base()

    def generate_roadmap(self, request: RoadmapRequestSchema) -> RoadmapSchema:
        domain = request.domain.strip()
        normalized_key = self._normalize_domain(domain)
        student_skills = set(s.lower() for s in (request.student_skills or []))

        # 1. Attempt generation via Gemini API if key is available
        gemini_roadmap = self._try_gemini_generation(domain, student_skills)
        if gemini_roadmap:
            return gemini_roadmap

        # 2. Check if matched in comprehensive knowledge base
        template = self._find_matching_template(normalized_key)
        if template:
            roadmap = self._build_from_template(template, domain, student_skills)
        else:
            roadmap = self._generate_dynamic_domain_roadmap(domain, student_skills)

        return roadmap

    def _try_gemini_generation(self, domain: str, student_skills: set) -> Optional[RoadmapSchema]:
        api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
        if not api_key:
            return None
        
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
            prompt = (
                f"You are an expert AI Career Coach. Generate a comprehensive, in-depth career preparation roadmap for the domain '{domain}'. "
                f"The student currently has skills: {list(student_skills)}. "
                "Return a single JSON object matching this schema exactly: "
                "{"
                "  \"domain_name\": string, "
                "  \"overview\": string (detailed 2-3 paragraph explanation of what this career involves, core principles, industry trends), "
                "  \"total_duration\": string (e.g. '3-6 Months'), "
                "  \"industry_demand_summary\": string (current hiring trends, top industries looking for these skills), "
                "  \"core_technologies\": list of strings, "
                "  \"recommended_certifications\": list of strings, "
                "  \"adjacent_domains\": list of strings, "
                "  \"phases\": [ "
                "    { "
                "      \"phase_id\": string (e.g. 'phase_1'), "
                "      \"order_index\": integer, "
                "      \"title\": string, "
                "      \"duration\": string, "
                "      \"description\": string (in-depth explanation of phase objectives and why they matter), "
                "      \"topics\": list of strings (detailed topics to master), "
                "      \"resources\": [{\"name\": string, \"type\": string, \"url\": string, \"description\": string}], "
                "      \"suggested_projects\": [{\"title\": string, \"description\": string, \"difficulty\": string, \"technologies\": list of strings, \"portfolioImpact\": string}], "
                "      \"milestones\": list of strings "
                "    } "
                "  ], "
                "  \"capstone_projects\": [ "
                "    {\"title\": string, \"description\": string, \"difficulty\": string, \"technologies\": list of strings, \"portfolioImpact\": string} "
                "  ] "
                "} "
                "Output ONLY the valid raw JSON object, without markdown quotes or formatting."
            )
            payload = {
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {"temperature": 0.3, "responseMimeType": "application/json"}
            }
            with httpx.Client(timeout=10.0) as client:
                res = client.post(url, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    raw_text = data["candidates"][0]["content"]["parts"][0]["text"]
                    cleaned = raw_text.strip()
                    if cleaned.startswith("```json"):
                        cleaned = cleaned[7:]
                    if cleaned.startswith("```"):
                        cleaned = cleaned[3:]
                    if cleaned.endswith("```"):
                        cleaned = cleaned[:-3]
                    parsed = json.loads(cleaned.strip())
                    return RoadmapSchema(**parsed)
        except Exception as e:
            # Fall back smoothly to structured generator
            pass
        return None

    def _normalize_domain(self, domain: str) -> str:
        cleaned = re.sub(r'[^a-zA-Z0-9\s]', '', domain.lower())
        return ' '.join(cleaned.split())

    def _find_matching_template(self, normalized: str) -> Optional[Dict]:
        for key, template in self.knowledge_base.items():
            if key in normalized or normalized in key:
                return template
            for alias in template.get("aliases", []):
                if alias in normalized or normalized in alias:
                    return template
        return None

    def _build_from_template(self, template: Dict, domain: str, student_skills: set) -> RoadmapSchema:
        phases = []
        for idx, p in enumerate(template["phases"], 1):
            resources = [RoadmapResourceSchema(**r) for r in p.get("resources", [])]
            projects = [RoadmapProjectSchema(**prj) for prj in p.get("suggested_projects", [])]
            phases.append(RoadmapPhaseSchema(
                phase_id=f"phase_{idx}",
                order_index=idx,
                title=p["title"],
                duration=p["duration"],
                description=p["description"],
                topics=p["topics"],
                resources=resources,
                suggested_projects=projects,
                milestones=p.get("milestones", [])
            ))

        capstone_projects = [
            RoadmapProjectSchema(**prj) for prj in template.get("capstone_projects", [])
        ]

        return RoadmapSchema(
            domain_name=template.get("canonical_name", domain.title()),
            overview=template["overview"],
            total_duration=template["total_duration"],
            industry_demand_summary=template["industry_demand_summary"],
            phases=phases,
            core_technologies=template["core_technologies"],
            recommended_certifications=template["recommended_certifications"],
            capstone_projects=capstone_projects,
            adjacent_domains=template["adjacent_domains"]
        )

    def _generate_dynamic_domain_roadmap(self, domain: str, student_skills: set) -> RoadmapSchema:
        """Dynamic structured fallback for custom or niche domains."""
        title = domain.title()
        phases = [
            RoadmapPhaseSchema(
                phase_id="phase_1",
                order_index=1,
                title=f"{title} Core Fundamentals & Architecture",
                duration="4-6 Weeks",
                description=f"Master fundamental theories, foundational design principles, and basic syntax for {title}.",
                topics=[
                    f"Core principles and mental models of {title}",
                    "Foundational tooling, standard CLI, and development environments",
                    "Basic architectural patterns and standard project lifecycles",
                    "Version control and collaborative engineering standards"
                ],
                resources=[
                    RoadmapResourceSchema(
                        name=f"Official {title} Documentation & Standards",
                        type="Documentation",
                        url="https://docs.github.com",
                        description="Primary language/tooling documentation and specification guides."
                    ),
                    RoadmapResourceSchema(
                        name=f"{title} Comprehensive Beginner Course",
                        type="Course",
                        url="",
                        description="Structured video modules and guided fundamentals."
                    )
                ],
                suggested_projects=[
                    RoadmapProjectSchema(
                        title=f"{title} Starter Application",
                        description=f"Build a clean end-to-end sandbox applying core conventions of {title}.",
                        difficulty="Beginner",
                        technologies=[domain, "Git", "Standard CLI"],
                        portfolioImpact="Demonstrates foundational comprehension and idiomatic code structure."
                    )
                ],
                milestones=[
                    f"Configure full local developer environment for {title}",
                    "Build and push first standalone module to GitHub"
                ]
            ),
            RoadmapPhaseSchema(
                phase_id="phase_2",
                order_index=2,
                title="Intermediate Toolchains & Hands-on Implementation",
                duration="6-8 Weeks",
                description="Deep dive into production frameworks, data persistence, and robust error handling.",
                topics=[
                    "Advanced abstractions and modular package structures",
                    "Data ingestion, storage optimization, and API communication",
                    "Unit testing, integration testing, and debugging workflows",
                    "Performance profiling and security best practices"
                ],
                resources=[
                    RoadmapResourceSchema(
                        name="Production Best Practices Guide",
                        type="Book",
                        url="",
                        description="Architectural patterns and clean code design."
                    ),
                    RoadmapResourceSchema(
                        name="Interactive Coding & Practice Challenges",
                        type="Practice Platform",
                        url="",
                        description="Hands-on algorithms and practical implementation tasks."
                    )
                ],
                suggested_projects=[
                    RoadmapProjectSchema(
                        title=f"{title} Production-Ready Service",
                        description="Develop a multi-featured modular service with caching and test coverage.",
                        difficulty="Intermediate",
                        technologies=[domain, "REST/gRPC", "Docker", "PostgreSQL"],
                        portfolioImpact="Highlights capability to write maintainable, tested backend or service components."
                    )
                ],
                milestones=[
                    "Implement comprehensive unit and integration test suite (>80% coverage)",
                    "Containerize application with Docker"
                ]
            ),
            RoadmapPhaseSchema(
                phase_id="phase_3",
                order_index=3,
                title="Production Deployment, Scaling & Capstone Showcase",
                duration="6-8 Weeks",
                description="Deploy to cloud infrastructure, automate CI/CD, and showcase high-impact portfolio systems.",
                topics=[
                    "Cloud deployment and infrastructure provisioning",
                    "Automated CI/CD pipelines and monitoring telemetry",
                    "System resilience, caching, and rate limiting",
                    "Technical interview preparation and system design"
                ],
                resources=[
                    RoadmapResourceSchema(
                        name="Cloud & DevOps Production Tutorials",
                        type="Video Series",
                        url="",
                        description="Step-by-step guides on containerization and cloud hosting."
                    )
                ],
                suggested_projects=[
                    RoadmapProjectSchema(
                        title=f"Enterprise-Scale {title} Platform",
                        description=f"A distributed, high-performance solution solving realistic industry challenges in {title}.",
                        difficulty="Advanced",
                        technologies=[domain, "Cloud (AWS/Azure/GCP)", "CI/CD", "Monitoring"],
                        portfolioImpact="Flagship resume project demonstrating end-to-end engineering excellence."
                    )
                ],
                milestones=[
                    "Deploy live system with continuous integration and monitoring",
                    "Publish open-source repository with comprehensive README and architecture diagram"
                ]
            )
        ]

        return RoadmapSchema(
            domain_name=title,
            overview=f"{title} is a rapidly evolving engineering and technology discipline focusing on scalable systems, reliable automation, and modern digital experiences.",
            total_duration="4-6 Months (10-15 hrs/week)",
            industry_demand_summary=f"Strong market demand for engineers proficient in {title}, with companies prioritizing candidates with verifiable hands-on project portfolios.",
            phases=phases,
            core_technologies=[domain, "Git", "Docker", "Cloud Platforms", "CI/CD"],
            recommended_certifications=[f"Industry Professional Certification in {title}"],
            capstone_projects=[
                RoadmapProjectSchema(
                    title=f"Full-Scale {title} Solution",
                    description=f"End-to-end distributed system showcasing end-to-end mastery of {title}.",
                    difficulty="Advanced",
                    technologies=[domain, "PostgreSQL", "Docker", "Kubernetes"],
                    portfolioImpact="Strongest signal for technical interviews and engineering recruiters."
                )
            ],
            adjacent_domains=["Full Stack Web Development", "Cloud Computing", "DevOps & SRE", "System Architecture"]
        )

    def _initialize_knowledge_base(self) -> Dict:
        return {
            "cloud computing": {
                "canonical_name": "Cloud Computing",
                "aliases": ["cloud", "aws", "azure", "gcp", "cloud architecture", "cloud engineer"],
                "overview": "Cloud Computing powers modern software infrastructure by delivering scalable computing power, storage, networking, and serverless architectures on demand over the internet.",
                "total_duration": "4-6 Months (12 hrs/week)",
                "industry_demand_summary": "Virtually all enterprise software systems rely on public or hybrid cloud providers, driving consistent high demand for engineers who can architect secure, cost-effective infrastructure.",
                "core_technologies": ["AWS", "Microsoft Azure", "Google Cloud Platform", "Terraform", "Docker", "Linux", "Kubernetes", "IAM", "VPC"],
                "recommended_certifications": [
                    "AWS Certified Solutions Architect – Associate",
                    "AWS Certified Cloud Practitioner",
                    "Microsoft Certified: Azure Fundamentals (AZ-900)",
                    "Google Cloud Associate Cloud Engineer"
                ],
                "phases": [
                    {
                        "title": "Phase 1: Linux, Networking & Core Cloud Fundamentals",
                        "duration": "4 Weeks",
                        "description": "Establish a rock-solid foundation in Linux command line, TCP/IP networking, DNS, and fundamental cloud paradigms (IaaS, PaaS, SaaS).",
                        "topics": [
                            "Linux system administration and shell scripting (Bash)",
                            "TCP/IP, OSI model, subnetting, CIDR, and DNS resolution",
                            "Core Cloud Providers overview (AWS, Azure, GCP)",
                            "Identity and Access Management (IAM) and security policies"
                        ],
                        "resources": [
                            {"name": "AWS Skill Builder: Cloud Essentials", "type": "Course", "url": "https://explore.skillbuilder.aws", "description": "Interactive learning path covering compute, storage, and IAM."},
                            {"name": "Linux Journey (Interactive Tutorial)", "type": "Practice Platform", "url": "https://linuxjourney.com", "description": "Free guide to command-line administration."}
                        ],
                        "suggested_projects": [
                            {
                                "title": "Automated Multi-Tier VPC Network Architecture",
                                "description": "Design and provision a secure VPC with public and private subnets, NAT Gateways, and Route Tables.",
                                "difficulty": "Beginner",
                                "technologies": ["AWS VPC", "Linux", "Bash"],
                                "portfolioImpact": "Proves foundational understanding of production network isolation and routing."
                            }
                        ],
                        "milestones": [
                            "Write Bash automation scripts for server provisioning",
                            "Configure secure SSH and IAM key rotation"
                        ]
                    },
                    {
                        "title": "Phase 2: Compute, Storage & Containerized Microservices",
                        "duration": "6 Weeks",
                        "description": "Deep dive into virtual compute (EC2/VMs), managed databases (RDS), object storage (S3/Blob), and containerization.",
                        "topics": [
                            "Virtual machines, auto-scaling groups, and Elastic Load Balancers",
                            "Object storage lifecycle policies, encryption, and CDN caching (CloudFront)",
                            "Managed relational and NoSQL databases (RDS PostgreSQL, DynamoDB)",
                            "Containerization with Docker and container hosting with ECS / EKS"
                        ],
                        "resources": [
                            {"name": "Official AWS Documentation & Architecture Center", "type": "Documentation", "url": "https://aws.amazon.com/architecture", "description": "Well-Architected Framework whitepapers."},
                            {"name": "Docker & Container Fundamentals", "type": "Course", "url": "", "description": "Creating multi-stage container builds and compose stacks."}
                        ],
                        "suggested_projects": [
                            {
                                "title": "Highly Available Auto-Scaling Web Application",
                                "description": "Deploy a stateless web app behind an Application Load Balancer with multi-AZ auto-scaling and managed PostgreSQL.",
                                "difficulty": "Intermediate",
                                "technologies": ["AWS EC2", "ALB", "RDS PostgreSQL", "Docker"],
                                "portfolioImpact": "Demonstrates resilience and high-availability architecture patterns."
                            }
                        ],
                        "milestones": [
                            "Configure automated health checks and failover policies",
                            "Store dynamic assets in S3 with secure pre-signed URLs"
                        ]
                    },
                    {
                        "title": "Phase 3: Infrastructure as Code (IaC) & Serverless Workflows",
                        "duration": "6 Weeks",
                        "description": "Automate cloud provisioning using Terraform, implement event-driven serverless architectures, and enforce security compliance.",
                        "topics": [
                            "Infrastructure as Code with Terraform (state management, modules)",
                            "Serverless computing with AWS Lambda / Azure Functions",
                            "Event-driven architecture with SQS, SNS, and EventBridge",
                            "Cloud cost optimization and FinOps best practices"
                        ],
                        "resources": [
                            {"name": "HashiCorp Terraform Associate Tutorials", "type": "Documentation", "url": "https://developer.hashicorp.com/terraform", "description": "Declarative cloud provisioning guides."},
                            {"name": "Serverless Architectural Patterns", "type": "Book", "url": "", "description": "Event-driven asynchronous processing patterns."}
                        ],
                        "suggested_projects": [
                            {
                                "title": "Terraform-Automated Serverless Media Transcoder",
                                "description": "Build an event-driven video/image processing pipeline triggered by S3 uploads, utilizing Lambda, SQS, and DynamoDB, entirely provisioned via Terraform.",
                                "difficulty": "Advanced",
                                "technologies": ["Terraform", "AWS Lambda", "S3", "SQS", "DynamoDB"],
                                "portfolioImpact": "Demonstrates enterprise-grade declarative cloud automation."
                            }
                        ],
                        "milestones": [
                            "Provision 100% of infrastructure reproducibly using Terraform",
                            "Achieve AWS Solutions Architect – Associate certification readiness"
                        ]
                    }
                ],
                "capstone_projects": [
                    {
                        "title": "Enterprise Multi-Region Cloud Infrastructure Platform",
                        "description": "Production-ready resilient infrastructure featuring zero-downtime blue/green deployments, automated secret management, and distributed CloudWatch observability.",
                        "difficulty": "Advanced",
                        "technologies": ["Terraform", "AWS ECS", "PostgreSQL", "CloudFront", "GitHub Actions"],
                        "portfolioImpact": "Primary showcase project demonstrating end-to-end cloud architect capabilities."
                    }
                ],
                "adjacent_domains": ["DevOps & SRE", "Cloud Security", "Data Engineering", "Platform Engineering"]
            },
            "ai machine learning": {
                "canonical_name": "AI & Machine Learning",
                "aliases": ["ai", "machine learning", "ml", "deep learning", "nlp", "llm", "generative ai", "artificial intelligence"],
                "overview": "AI & Machine Learning focuses on building intelligent mathematical models that learn from data to make predictions, generate synthetic content, and execute autonomous agentic decisions.",
                "total_duration": "5-7 Months (14 hrs/week)",
                "industry_demand_summary": "Massive global demand driven by large language models, retrieval-augmented generation (RAG), and autonomous agent frameworks across all software sectors.",
                "core_technologies": ["Python", "PyTorch", "NumPy", "Scikit-Learn", "Hugging Face", "LangChain / LangGraph", "Vector Databases (pgvector, Chroma)", "FastAPI", "Transformers"],
                "recommended_certifications": [
                    "TensorFlow Developer Certificate",
                    "AWS Certified Machine Learning – Specialty",
                    "DeepLearning.AI Machine Learning Specialization",
                    "DeepLearning.AI Deep Learning Specialization"
                ],
                "phases": [
                    {
                        "title": "Phase 1: Mathematical Foundations & Classical Machine Learning",
                        "duration": "6 Weeks",
                        "description": "Master linear algebra, calculus, probability theory, Python scientific computing, and classical supervised/unsupervised ML algorithms.",
                        "topics": [
                            "Linear algebra: vectors, matrices, eigenvalues, dot products",
                            "Multivariate calculus & gradient descent optimization",
                            "Supervised learning: linear/logistic regression, decision trees, random forests, SVMs",
                            "Unsupervised learning: K-Means clustering, PCA dimensionality reduction",
                            "Model evaluation: Precision, Recall, F1, ROC-AUC, cross-validation"
                        ],
                        "resources": [
                            {"name": "DeepLearning.AI: Machine Learning Specialization", "type": "Course", "url": "https://www.deeplearning.ai", "description": "Foundational curriculum by Andrew Ng."},
                            {"name": "Scikit-Learn User Guide & API Reference", "type": "Documentation", "url": "https://scikit-learn.org", "description": "Hands-on classical machine learning algorithms."}
                        ],
                        "suggested_projects": [
                            {
                                "title": "Customer Churn Prediction & Feature Importance Engine",
                                "description": "Train and evaluate ensemble models with hyperparameter tuning to predict customer retention with explainable SHAP values.",
                                "difficulty": "Beginner",
                                "technologies": ["Python", "Pandas", "Scikit-Learn", "SHAP"],
                                "portfolioImpact": "Demonstrates disciplined data preprocessing and rigorous validation."
                            }
                        ],
                        "milestones": [
                            "Build regression and classification models from scratch without high-level wrappers",
                            "Implement cross-validation and feature scaling pipelines"
                        ]
                    },
                    {
                        "title": "Phase 2: Deep Learning & Neural Architectures (PyTorch)",
                        "duration": "8 Weeks",
                        "description": "Construct and train deep neural networks with PyTorch, Convolutional Neural Networks (CNNs) for vision, and Recurrent / Transformer architectures.",
                        "topics": [
                            "PyTorch tensors, autograd, custom Dataset and DataLoader classes",
                            "Feedforward neural networks, backpropagation, and activation functions (ReLU, GELU)",
                            "Regularization techniques: Dropout, Batch Normalization, Weight Decay",
                            "Convolutional Neural Networks (CNNs) and Computer Vision transfer learning",
                            "Self-attention mechanisms and Transformer architecture deep-dive"
                        ],
                        "resources": [
                            {"name": "PyTorch Official Deep Learning Tutorials", "type": "Documentation", "url": "https://pytorch.org/tutorials", "description": "Step-by-step model building with PyTorch."},
                            {"name": "Stanford CS231n / CS224n Lectures", "type": "Video Series", "url": "", "description": "Deep learning for visual recognition and natural language processing."}
                        ],
                        "suggested_projects": [
                            {
                                "title": "Multi-Class Medical Image Classifier with Transfer Learning",
                                "description": "Fine-tune a ResNet/Vision Transformer model on biomedical imagery with data augmentation and Grad-CAM interpretability heatmaps.",
                                "difficulty": "Intermediate",
                                "technologies": ["PyTorch", "Torchvision", "Matplotlib", "FastAPI"],
                                "portfolioImpact": "Shows mastery of deep learning training loops and computer vision."
                            }
                        ],
                        "milestones": [
                            "Write custom PyTorch training loops with learning rate schedulers",
                            "Achieve >92% test accuracy on complex visual/tabular datasets"
                        ]
                    },
                    {
                        "title": "Phase 3: Generative AI, RAG & Agentic Systems",
                        "duration": "6 Weeks",
                        "description": "Build modern production LLM systems with LangChain/LangGraph, retrieval-augmented generation (RAG), vector databases, and multi-agent coordination.",
                        "topics": [
                            "Transformer self-attention, tokenization, embeddings, and prompt engineering",
                            "Dense vector indexing & hybrid search with pgvector / Chroma",
                            "Retrieval-Augmented Generation (RAG) with semantic chunking and re-ranking",
                            "Autonomous multi-agent graphs with LangGraph and tool calling",
                            "LLM evaluation, guardrails, latency optimization, and quantization"
                        ],
                        "resources": [
                            {"name": "Hugging Face NLP Course", "type": "Course", "url": "https://huggingface.co/learn/nlp-course", "description": "Transformers, fine-tuning, and model deployment."},
                            {"name": "LangChain & LangGraph Documentation", "type": "Documentation", "url": "https://python.langchain.com", "description": "Stateful agentic orchestration frameworks."}
                        ],
                        "suggested_projects": [
                            {
                                "title": "Autonomous Research Assistant Multi-Agent Graph",
                                "description": "Build an interactive research agent that searches documents, queries vector embeddings, evaluates factual consistency, and summarizes key insights.",
                                "difficulty": "Advanced",
                                "technologies": ["LangGraph", "FastAPI", "pgvector", "PyTorch", "OpenAI / HuggingFace"],
                                "portfolioImpact": "Strongest signal for cutting-edge Generative AI and Applied ML roles."
                            }
                        ],
                        "milestones": [
                            "Deploy a low-latency RAG system with citation verification",
                            "Build a stateful multi-step agent with conditional routing"
                        ]
                    }
                ],
                "capstone_projects": [
                    {
                        "title": "Production Enterprise Knowledge Engine & Multi-Agent Copilot",
                        "description": "Full-stack AI service integrating vector embeddings, semantic ranking, automated skill diffing, and explainable AI feedback loops.",
                        "difficulty": "Advanced",
                        "technologies": ["PyTorch", "FastAPI", "LangGraph", "PostgreSQL pgvector", "React"],
                        "portfolioImpact": "Directly applicable to Top-Tier Applied AI and Machine Learning Engineering roles."
                    }
                ],
                "adjacent_domains": ["MLOps", "Data Science", "Data Engineering", "Computer Vision"]
            },
            "cybersecurity": {
                "canonical_name": "Cybersecurity",
                "aliases": ["security", "infosec", "cyber security", "penetration testing", "ethical hacking", "soc"],
                "overview": "Cybersecurity focuses on protecting critical digital infrastructure, networks, applications, and sensitive user data from unauthorized access, cyberattacks, and vulnerabilities.",
                "total_duration": "4-6 Months (12 hrs/week)",
                "industry_demand_summary": "Extremely high global demand with persistent talent shortages across threat intelligence, application security, cloud security, and compliance.",
                "core_technologies": ["Wireshark", "Burp Suite", "Nmap", "Metasploit", "Snort", "Linux", "Python", "SIEM (Splunk/Elastic)", "Cryptography"],
                "recommended_certifications": [
                    "CompTIA Security+",
                    "Certified Ethical Hacker (CEH)",
                    "Certified Information Systems Security Professional (CISSP)",
                    "Offensive Security Certified Professional (OSCP)"
                ],
                "phases": [
                    {
                        "title": "Phase 1: Networking Protocols, Operating Systems & Cryptography",
                        "duration": "5 Weeks",
                        "description": "Master network packet analysis, Linux/Windows security internals, and symmetric/asymmetric cryptographic algorithms.",
                        "topics": [
                            "Deep-dive TCP/IP, ARP, DNS, HTTP/HTTPS, SSL/TLS handshake",
                            "Packet sniffing and traffic analysis with Wireshark and tcpdump",
                            "Symmetric (AES) and asymmetric (RSA/ECC) encryption, hashing, digital signatures",
                            "Linux file permissions, user auditing, and firewall management (iptables/UFW)"
                        ],
                        "resources": [
                            {"name": "Professor Messer Security+ Training Course", "type": "Video Series", "url": "", "description": "Industry-standard certification preparation videos."},
                            {"name": "TryHackMe: Pre-Security & Complete Beginner Paths", "type": "Practice Platform", "url": "https://tryhackme.com", "description": "Hands-on vulnerable machines and networking labs."}
                        ],
                        "suggested_projects": [
                            {
                                "title": "Network Traffic Sniffer & Protocol Analyzer",
                                "description": "Build a custom Python packet analyzer that inspects raw sockets and identifies unencrypted credentials or malicious ARP spoofing.",
                                "difficulty": "Beginner",
                                "technologies": ["Python", "Scapy", "Wireshark", "Linux"],
                                "portfolioImpact": "Demonstrates deep comprehension of lower-level networking security."
                            }
                        ],
                        "milestones": [
                            "Complete 25+ hands-on labs on TryHackMe or HackTheBox",
                            "Implement cryptographic message encryption and verification in code"
                        ]
                    },
                    {
                        "title": "Phase 2: Application Security & Ethical Hacking",
                        "duration": "6 Weeks",
                        "description": "Learn OWASP Top 10 web vulnerabilities, penetration testing methodologies, and defensive remediation.",
                        "topics": [
                            "OWASP Top 10: SQL Injection, XSS, CSRF, SSRF, IDOR, Broken Authentication",
                            "Web vulnerability scanning and interception with Burp Suite",
                            "Reconnaissance, network mapping (Nmap), and vulnerability scanning",
                            "Secure code review and automated static/dynamic code analysis (SAST/DAST)"
                        ],
                        "resources": [
                            {"name": "PortSwigger Web Security Academy", "type": "Practice Platform", "url": "https://portswigger.net/web-security", "description": "The gold-standard interactive web exploitation labs."},
                            {"name": "OWASP Top 10 Security Guide", "type": "Documentation", "url": "https://owasp.org", "description": "Detailed vulnerability breakdown and remediation patterns."}
                        ],
                        "suggested_projects": [
                            {
                                "title": "Comprehensive Web Application Penetration Test Report",
                                "description": "Perform a structured penetration test against a deliberate vulnerable target (e.g. DVWA/JuiceShop) and write a professional remediation report.",
                                "difficulty": "Intermediate",
                                "technologies": ["Burp Suite", "Nmap", "SQLMap", "OWASP ZAP"],
                                "portfolioImpact": "Emulates real-world security consultant and pentesting deliverables."
                            }
                        ],
                        "milestones": [
                            "Earn PortSwigger Web Security Practitioner recognition",
                            "Remediate 5 critical vulnerability classes in an open-source application"
                        ]
                    },
                    {
                        "title": "Phase 3: Defensive Security (Blue Team), SIEM & Cloud Security",
                        "duration": "6 Weeks",
                        "description": "Configure intrusion detection systems (IDS), analyze security logs in SIEM platforms, and implement cloud security controls.",
                        "topics": [
                            "SIEM log ingestion, dashboarding, and incident detection with Splunk / Elastic",
                            "Intrusion Detection Systems (IDS/IPS) with Snort or Suricata",
                            "Incident response lifecycle: triage, containment, eradication, and post-mortem",
                            "Cloud security posture management (CSPM) and IAM least privilege"
                        ],
                        "resources": [
                            {"name": "Splunk Fundamentals & Threat Hunting Guides", "type": "Course", "url": "", "description": "Log correlation and anomaly detection tutorials."}
                        ],
                        "suggested_projects": [
                            {
                                "title": "Automated Security Operations Center (SOC) Lab",
                                "description": "Set up a virtual honeypot network that streams attack telemetry into a central Elastic SIEM instance with real-time alerting rules.",
                                "difficulty": "Advanced",
                                "technologies": ["Elastic SIEM", "Suricata", "Wazuh", "Linux", "Docker"],
                                "portfolioImpact": "Demonstrates end-to-end defensive threat detection and analysis."
                            }
                        ],
                        "milestones": [
                            "Configure automated anomaly alert triggers for brute-force attacks",
                            "Achieve CompTIA Security+ or CEH certification readiness"
                        ]
                    }
                ],
                "capstone_projects": [
                    {
                        "title": "Enterprise Threat Hunting & Zero-Trust Infrastructure",
                        "description": "Defensive security architecture combining automated vulnerability scanning, SIEM monitoring, and strict zero-trust IAM policies.",
                        "difficulty": "Advanced",
                        "technologies": ["Python", "SIEM", "Suricata", "Terraform", "Docker"],
                        "portfolioImpact": "High-value portfolio piece for SOC Analyst and Security Engineer positions."
                    }
                ],
                "adjacent_domains": ["Cloud Security", "DevOps & SRE", "Network Engineering", "System Administration"]
            },
            "devops sre": {
                "canonical_name": "DevOps & SRE",
                "aliases": ["devops", "sre", "site reliability engineering", "ci cd", "kubernetes", "platform engineering"],
                "overview": "DevOps & Site Reliability Engineering (SRE) bridges software development and system operations to deliver automated CI/CD pipelines, high system uptime, and elastic infrastructure scaling.",
                "total_duration": "4-6 Months (12 hrs/week)",
                "industry_demand_summary": "Core foundational discipline for every tech enterprise, commanding top-tier compensation for engineers skilled in Kubernetes, Terraform, and observability.",
                "core_technologies": ["Docker", "Kubernetes", "Terraform", "GitHub Actions / GitLab CI", "Prometheus", "Grafana", "Linux", "Ansible", "Helm"],
                "recommended_certifications": [
                    "Certified Kubernetes Administrator (CKA)",
                    "Certified Kubernetes Application Developer (CKAD)",
                    "HashiCorp Certified: Terraform Associate",
                    "AWS Certified DevOps Engineer – Professional"
                ],
                "phases": [
                    {
                        "title": "Phase 1: Containerization & CI/CD Automation",
                        "duration": "5 Weeks",
                        "description": "Master advanced Docker packaging, multi-stage builds, container registries, and automated CI/CD pipelines.",
                        "topics": [
                            "Linux kernel namespaces, cgroups, and container architecture",
                            "Writing optimized multi-stage Dockerfiles for minimal image size and security",
                            "Continuous Integration workflows with GitHub Actions (linting, testing, security scanning)",
                            "Automated release tagging and artifact publishing to Docker Hub / GitHub Container Registry"
                        ],
                        "resources": [
                            {"name": "GitHub Actions Documentation", "type": "Documentation", "url": "https://docs.github.com/actions", "description": "Automated workflow configuration and action runners."}
                        ],
                        "suggested_projects": [
                            {
                                "title": "Production-Grade Polyglot CI/CD Pipeline",
                                "description": "Build an automated GitHub Actions pipeline that lints, runs unit/integration tests, runs Trivy vulnerability scanning, and builds minimal distroless Docker containers.",
                                "difficulty": "Beginner",
                                "technologies": ["Docker", "GitHub Actions", "Trivy", "Bash"],
                                "portfolioImpact": "Proves understanding of secure and modern build automation."
                            }
                        ],
                        "milestones": [
                            "Reduce container image size by >60% using multi-stage builds",
                            "Implement automated branch protection and status check gates"
                        ]
                    },
                    {
                        "title": "Phase 2: Kubernetes Orchestration & Helm Packaging",
                        "duration": "6 Weeks",
                        "description": "Deploy, scale, and manage stateful and stateless containerized workloads on Kubernetes clusters.",
                        "topics": [
                            "Kubernetes architecture: API Server, etcd, Controller Manager, Kubelet, Kube-Proxy",
                            "Core resources: Pods, Deployments, Services, Ingress Controllers, ConfigMaps, Secrets",
                            "Storage orchestration: PersistentVolumes, PersistentVolumeClaims, and StorageClasses",
                            "Package management with Helm charts and Kustomize overlays"
                        ],
                        "resources": [
                            {"name": "Kubernetes Official Interactive Tutorial", "type": "Documentation", "url": "https://kubernetes.io/docs/tutorials", "description": "Cluster management and workload orchestration."}
                        ],
                        "suggested_projects": [
                            {
                                "title": "Microservices Cluster Deployment with Helm & Ingress",
                                "description": "Deploy a multi-service web architecture onto a local Minikube/K3s cluster managed via custom parameterized Helm charts with Nginx Ingress and TLS.",
                                "difficulty": "Intermediate",
                                "technologies": ["Kubernetes", "Helm", "Nginx Ingress", "Docker"],
                                "portfolioImpact": "Demonstrates production workload orchestration skills."
                            }
                        ],
                        "milestones": [
                            "Configure zero-downtime rolling updates and rollback strategies",
                            "Package complex application stack into a reusable Helm chart"
                        ]
                    },
                    {
                        "title": "Phase 3: GitOps, Observability & Site Reliability Engineering",
                        "duration": "6 Weeks",
                        "description": "Implement continuous delivery with ArgoCD GitOps, comprehensive metrics telemetry with Prometheus & Grafana, and distributed tracing.",
                        "topics": [
                            "GitOps continuous delivery with ArgoCD / Flux",
                            "Metrics scraping, PromQL, and alerting with Prometheus and Alertmanager",
                            "Production dashboard creation with Grafana",
                            "Distributed tracing with OpenTelemetry and Jaeger",
                            "SRE principles: Service Level Objectives (SLOs), Error Budgets, and Blameless Post-Mortems"
                        ],
                        "resources": [
                            {"name": "Google SRE Books (Site Reliability Engineering)", "type": "Book", "url": "https://sre.google/books", "description": "The foundational philosophy of reliability and monitoring."}
                        ],
                        "suggested_projects": [
                            {
                                "title": "End-to-End GitOps Cluster with Full Observability Stack",
                                "description": "Provision a Kubernetes cluster that automatically synchronizes with Git via ArgoCD and features automated Prometheus alerts for high latency and error rates.",
                                "difficulty": "Advanced",
                                "technologies": ["ArgoCD", "Prometheus", "Grafana", "Kubernetes", "Terraform"],
                                "portfolioImpact": "High-value portfolio piece for Senior DevOps and SRE candidates."
                            }
                        ],
                        "milestones": [
                            "Achieve CKA or CKAD certification readiness",
                            "Deploy an automated GitOps sync pipeline with zero manual cluster interventions"
                        ]
                    }
                ],
                "capstone_projects": [
                    {
                        "title": "Complete Cloud-Native Production Platform",
                        "description": "Automated Terraform cloud provisioning, Kubernetes cluster orchestration, ArgoCD GitOps pipeline, and full Prometheus/Grafana telemetry monitoring.",
                        "difficulty": "Advanced",
                        "technologies": ["Terraform", "Kubernetes", "ArgoCD", "Prometheus", "Grafana", "AWS"],
                        "portfolioImpact": "Definitive evidence of readiness for Platform Engineer and SRE roles."
                    }
                ],
                "adjacent_domains": ["Cloud Computing", "Cloud Security", "Data Engineering", "Backend Engineering"]
            }
        }
