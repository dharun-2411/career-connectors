from ..state import AgentState
from ...schemas.recommendation import RecommendationRequest
from ...services.recommendation_service import recommendation_service

def recommender_node(state: AgentState) -> AgentState:
    """
    Synthesizes matching results, applies diversity & recency re-ranking, and constructs final feed.
    """
    if state.candidate_opportunities:
        req = RecommendationRequest(
            student_id=state.student_id or 1,
            student_skills=state.student_skills,
            opportunities=state.candidate_opportunities,
            top_k=10
        )
        res = recommendation_service.get_recommendations(req)
        state.recommendations = res.recommendations
        state.execution_history.append(f"RecommenderNode: Generated {len(res.recommendations)} ranked recommendation items")
        
    return state
