from pydantic import BaseModel, Field
from typing import List, Optional
from .matching import StudentSkillInput, OpportunitySkillInput

class SkillGapRequest(BaseModel):
    student_id: int
    student_skills: List[StudentSkillInput]
    opportunity_id: int
    opportunity_title: str
    company_name: str
    opportunity_skills: List[OpportunitySkillInput]

class MissingSkillDetail(BaseModel):
    skill_name: str
    category: str = "General"
    required_proficiency: str
    current_proficiency: str = "None"
    weightage: float = 1.0
    priority: str = "MEDIUM" # HIGH, MEDIUM, LOW

class LearningResource(BaseModel):
    skill: str
    title: str
    type: str
    estimated_time_to_learn: str
    difficulty: str
    resource_url: str

class SkillGapResponse(BaseModel):
    student_id: int
    opportunity_id: int
    opportunity_title: str
    company_name: str
    match_percentage: float
    missing_skills: List[MissingSkillDetail]
    learning_roadmap: List[LearningResource]
    summary: str
