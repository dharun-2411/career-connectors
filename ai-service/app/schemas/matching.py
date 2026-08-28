from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class StudentSkillInput(BaseModel):
    name: str
    proficiency: str = "INTERMEDIATE"

class OpportunitySkillInput(BaseModel):
    name: str
    weightage: float = 1.0
    proficiency: str = "INTERMEDIATE"

class MatchingRequest(BaseModel):
    student_id: Optional[int] = None
    student_skills: List[StudentSkillInput]
    opportunity_id: Optional[int] = None
    opportunity_skills: List[OpportunitySkillInput]

class MatchingResponse(BaseModel):
    student_id: Optional[int] = None
    opportunity_id: Optional[int] = None
    overall_score: float
    semantic_score: float
    skill_score: float
    matching_skills: List[str]
    missing_skills: List[str]
    explanation: str
    breakdown: Dict[str, Any] = Field(default_factory=dict)
