from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from .matching import StudentSkillInput, OpportunitySkillInput
from .recommendation import CandidateOpportunity
from .applicant_ranking import ApplicantProfile

class AgentWorkflowRequest(BaseModel):
    request_type: str = "RECOMMENDATION" # RECOMMENDATION, MATCHING, SKILL_GAP, RANKING, ROADMAP, FULL_EVALUATION
    domain: Optional[str] = None
    student_id: Optional[int] = None
    student_skills: Optional[List[StudentSkillInput]] = Field(default_factory=list)
    student_bio: Optional[str] = None
    opportunity_id: Optional[int] = None
    opportunity_title: Optional[str] = None
    company_name: Optional[str] = None
    opportunity_skills: Optional[List[OpportunitySkillInput]] = Field(default_factory=list)
    candidate_opportunities: Optional[List[CandidateOpportunity]] = Field(default_factory=list)
    applicants: Optional[List[ApplicantProfile]] = Field(default_factory=list)

class AgentWorkflowResponse(BaseModel):
    status: str = "COMPLETED"
    request_type: str
    workflow_steps_executed: List[str]
    result: Dict[str, Any]
