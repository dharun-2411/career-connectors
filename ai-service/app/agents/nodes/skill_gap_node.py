from ..state import AgentState
from ...schemas.skill_gap import SkillGapRequest
from ...services.skill_gap_service import skill_gap_service

def skill_gap_node(state: AgentState) -> AgentState:
    """
    Computes skill deficiencies and generates structured learning roadmaps for target roles.
    """
    if state.opportunity_skills:
        req = SkillGapRequest(
            student_id=state.student_id or 1,
            student_skills=state.student_skills,
            opportunity_id=state.opportunity_id or 1,
            opportunity_title=state.opportunity_title or "Target Opportunity",
            company_name=state.company_name or "Target Company",
            opportunity_skills=state.opportunity_skills
        )
        res = skill_gap_service.analyze_gap(req)
        state.skill_gap_results = res.model_dump()
        state.execution_history.append(f"SkillGapNode: Identified {len(res.missing_skills)} gap areas & generated roadmap")
        
    return state
