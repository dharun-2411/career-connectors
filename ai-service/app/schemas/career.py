from pydantic import BaseModel
from typing import List
from .matching import StudentSkillInput

class CareerSuggestionRequest(BaseModel):
    student_id: int
    student_skills: List[StudentSkillInput]

class CareerPath(BaseModel):
    role_title: str
    industry: str
    readiness_level: str
    avg_market_demand: str
    transferrable_skills: List[str]
    recommended_next_skills: List[str]

class ProjectIdea(BaseModel):
    title: str
    description: str
    difficulty: str
    technologies_used: List[str]
    portfolio_impact: str

class CareerSuggestionResponse(BaseModel):
    student_id: int
    suggested_paths: List[CareerPath]
    recommended_projects: List[ProjectIdea]
    trending_skills_in_market: List[str]
