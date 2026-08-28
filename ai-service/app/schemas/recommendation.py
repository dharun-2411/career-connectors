from pydantic import BaseModel, Field
from typing import List, Optional
from .matching import StudentSkillInput, OpportunitySkillInput

class CandidateOpportunity(BaseModel):
    id: int
    title: str
    company_name: str
    required_skills: List[OpportunitySkillInput]
    type: Optional[str] = "INTERNSHIP"
    is_remote: Optional[bool] = False

class RecommendationRequest(BaseModel):
    student_id: int
    student_skills: List[StudentSkillInput]
    opportunities: List[CandidateOpportunity]
    top_k: int = 10

class RecommendedItem(BaseModel):
    opportunity_id: int
    title: str
    company_name: str
    match_score: float
    match_reason: str
    key_strengths: List[str]
    career_trajectory_fit: str

class RecommendationResponse(BaseModel):
    student_id: int
    recommendations: List[RecommendedItem]
