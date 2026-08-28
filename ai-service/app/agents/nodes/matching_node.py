from ..state import AgentState
from ...schemas.matching import MatchingRequest
from ...services.matching_service import matching_service

def matching_node(state: AgentState) -> AgentState:
    """
    Evaluates semantic vector similarity + weighted rules for single or multiple candidate opportunities.
    """
    if state.opportunity_skills:
        req = MatchingRequest(
            student_id=state.student_id,
            student_skills=state.student_skills,
            opportunity_id=state.opportunity_id,
            opportunity_skills=state.opportunity_skills
        )
        res = matching_service.compute_match(req)
        state.match_results = res.model_dump()
        state.execution_history.append(f"MatchingNode: Computed match score of {res.overall_score}%")
    elif state.candidate_opportunities:
        batch_scores = {}
        for opp in state.candidate_opportunities:
            req = MatchingRequest(
                student_id=state.student_id,
                student_skills=state.student_skills,
                opportunity_id=opp.id,
                opportunity_skills=opp.required_skills
            )
            res = matching_service.compute_match(req)
            batch_scores[opp.id] = res.model_dump()
        state.match_results = {"batch_scores": batch_scores}
        state.execution_history.append(f"MatchingNode: Evaluated batch matching across {len(state.candidate_opportunities)} opportunities")
        
    return state
