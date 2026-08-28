import re
from typing import List
from ..schemas.resume import ResumeExtractRequest, ResumeExtractResponse, ExtractedSkill

class ResumeService:

    KNOWN_SKILLS = {
        "Java": ("Programming", "ADVANCED"),
        "Python": ("Programming", "ADVANCED"),
        "JavaScript": ("Programming", "INTERMEDIATE"),
        "TypeScript": ("Programming", "INTERMEDIATE"),
        "C++": ("Programming", "INTERMEDIATE"),
        "Spring Boot": ("Framework", "ADVANCED"),
        "React": ("Framework", "INTERMEDIATE"),
        "React.js": ("Framework", "INTERMEDIATE"),
        "FastAPI": ("Framework", "INTERMEDIATE"),
        "Django": ("Framework", "INTERMEDIATE"),
        "Docker": ("Cloud/DevOps", "INTERMEDIATE"),
        "Kubernetes": ("Cloud/DevOps", "BEGINNER"),
        "AWS": ("Cloud/DevOps", "INTERMEDIATE"),
        "PostgreSQL": ("Database", "INTERMEDIATE"),
        "MongoDB": ("Database", "INTERMEDIATE"),
        "Machine Learning": ("AI/Data Science", "ADVANCED"),
        "Deep Learning": ("AI/Data Science", "INTERMEDIATE"),
        "PyTorch": ("AI/Data Science", "INTERMEDIATE"),
        "TensorFlow": ("AI/Data Science", "INTERMEDIATE"),
        "LangGraph": ("AI/Data Science", "INTERMEDIATE"),
        "LangChain": ("AI/Data Science", "INTERMEDIATE"),
        "REST API": ("Architecture", "ADVANCED"),
        "TailwindCSS": ("Framework", "INTERMEDIATE"),
        "Git": ("Cloud/DevOps", "ADVANCED")
    }

    def extract_from_text(self, request: ResumeExtractRequest) -> ResumeExtractResponse:
        text = request.resume_text
        lower_text = text.lower()

        # Extract Email
        email_match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', text)
        email = email_match.group(0) if email_match else None

        # Extract Phone
        phone_match = re.search(r'(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}', text)
        phone = phone_match.group(0) if phone_match else None

        # Extract University / Education keywords
        education = "B.S. in Computer Science" if "computer science" in lower_text or "bachelor" in lower_text else "University Degree"
        university = None
        for uni_candidate in ["Stanford University", "University of Washington", "MIT", "UC Berkeley", "Carnegie Mellon"]:
            if uni_candidate.lower() in lower_text:
                university = uni_candidate
                break

        # Extract Skills
        extracted: List[ExtractedSkill] = []
        for skill_name, (cat, default_prof) in self.KNOWN_SKILLS.items():
            pattern = r'\b' + re.escape(skill_name.lower()) + r'\b'
            if re.search(pattern, lower_text):
                extracted.append(ExtractedSkill(
                    name=skill_name,
                    category=cat,
                    suggested_proficiency=default_prof,
                    confidence=0.95
                ))

        return ResumeExtractResponse(
            candidate_name=None,
            email=email,
            phone=phone,
            education=education,
            university=university,
            graduation_year=2025,
            extracted_skills=extracted,
            experience_summary=f"Extracted {len(extracted)} technical skills and background details from resume text."
        )

resume_service = ResumeService()
