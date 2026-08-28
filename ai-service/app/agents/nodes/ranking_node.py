from ..state import AgentState
from ...schemas.applicant_ranking import ApplicantRankingRequest
from ...services.applicant_ranking_service import applicant_ranking_service

def ranking_node(state: AgentState) -> AgentState:
    """
    Ranks applicants for recruiters with multi-attribute scoring and explainability.
    """
    if state.applicants and state.opportunity_skills:
        req = ApplicantRankingRequest(
            opportunity_id=state.opportunity_id or 1,
            opportunity_title=state.opportunity_title or "Opportunity",
            opportunity_skills=state.opportunity_skills,
            applicants=state.applicants
        )
        res = applicant_ranking_service.rank_applicants(req)
        state.ranked_applicants = res.ranked_applicants
        state.execution_history.append(f"RankingNode: Ranked {len(res.ranked_applicants)} applicants for opportunity #{state.opportunity_id}")
        
    return state
