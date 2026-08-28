from pydantic import BaseModel, Field
from typing import List, Optional

class ResumeExtractRequest(BaseModel):
    resume_text: str

class ExtractedSkill(BaseModel):
    name: str
    category: str
    suggested_proficiency: str
    confidence: float

class ResumeExtractResponse(BaseModel):
    candidate_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    education: Optional[str] = None
    university: Optional[str] = None
    graduation_year: Optional[int] = None
    extracted_skills: List[ExtractedSkill]
    experience_summary: Optional[str] = None
