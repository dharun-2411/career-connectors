from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from ..schemas.matching import StudentSkillInput, OpportunitySkillInput
from ..schemas.recommendation import CandidateOpportunity, RecommendedItem
from ..schemas.skill_gap import MissingSkillDetail, LearningResource
from ..schemas.applicant_ranking import ApplicantProfile, RankedApplicantDetail

class AgentState(BaseModel):
    """
    Shared multi-agent execution state passed between LangGraph nodes.
    """
    request_type: str = "RECOMMENDATION" # RECOMMENDATION, MATCHING, SKILL_GAP, RANKING, ROADMAP, FULL_EVALUATION
    student_id: Optional[int] = None
    student_skills: List[StudentSkillInput] = Field(default_factory=list)
    student_bio: Optional[str] = None
    
    # Target domain for roadmap generation
    domain: Optional[str] = None
    
    opportunity_id: Optional[int] = None
    opportunity_title: Optional[str] = None
    company_name: Optional[str] = None
    opportunity_skills: List[OpportunitySkillInput] = Field(default_factory=list)
    
    candidate_opportunities: List[CandidateOpportunity] = Field(default_factory=list)
    applicants: List[ApplicantProfile] = Field(default_factory=list)
    
    # Node outputs
    profile_summary: Optional[str] = None
    match_results: Dict[str, Any] = Field(default_factory=dict)
    skill_gap_results: Dict[str, Any] = Field(default_factory=dict)
    ranked_applicants: List[RankedApplicantDetail] = Field(default_factory=list)
    recommendations: List[RecommendedItem] = Field(default_factory=list)
    roadmap_results: Dict[str, Any] = Field(default_factory=dict)
    
    execution_history: List[str] = Field(default_factory=list)
