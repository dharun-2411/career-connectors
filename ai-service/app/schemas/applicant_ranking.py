from pydantic import BaseModel, Field
from typing import List, Optional
from .matching import StudentSkillInput, OpportunitySkillInput

class ApplicantProfile(BaseModel):
    application_id: int
    student_id: int
    name: str
    email: str
    university: str
    resume_url: Optional[str] = None
    skills: List[StudentSkillInput]
    cover_letter: Optional[str] = None

class ApplicantRankingRequest(BaseModel):
    opportunity_id: int
    opportunity_title: str
    opportunity_skills: List[OpportunitySkillInput]
    applicants: List[ApplicantProfile]

class RankedApplicantDetail(BaseModel):
    application_id: int
    student_id: int
    student_name: str
    email: str
    university: str
    resume_url: Optional[str] = None
    rank: int
    composite_score: float
    skill_match_score: float
    experience_relevance_score: float
    top_matching_skills: List[str]
    potential_gaps: List[str]
    ai_recommendation_summary: str

class ApplicantRankingResponse(BaseModel):
    opportunity_id: int
    total_applicants: int
    ranked_applicants: List[RankedApplicantDetail]
