from ...agents.state import AgentState
from ...services.roadmap_service import RoadmapService
from ...schemas.roadmap import RoadmapRequestSchema

roadmap_service = RoadmapService()

def roadmap_generator_node(state: AgentState) -> AgentState:
    """
    LangGraph Agent Node: Synthesizes a structured career preparation roadmap
    for the requested domain.
    """
    domain = state.domain or "Full Stack Web Development"
    skills = [s.name for s in state.student_skills]
    
    request = RoadmapRequestSchema(
        domain=domain,
        student_skills=skills,
        student_bio=state.student_bio or ""
    )
    
    roadmap_result = roadmap_service.generate_roadmap(request)
    state.roadmap_results = roadmap_result.model_dump()
    state.execution_history.append(f"roadmap_generator_node:generated_roadmap_for_{domain}")
    
    return state
