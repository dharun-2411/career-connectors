from typing import Dict, Any
from .state import AgentState
from .nodes.profile_analyzer_node import profile_analyzer_node
from .nodes.matching_node import matching_node
from .nodes.skill_gap_node import skill_gap_node
from .nodes.ranking_node import ranking_node
from .nodes.recommender_node import recommender_node
from .nodes.roadmap_generator_node import roadmap_generator_node
from ..schemas.agent import AgentWorkflowRequest, AgentWorkflowResponse

class CareerAgentGraph:
    """
    Orchestrates the multi-agent execution pipeline.
    Executes state transitions across specialized evaluation nodes with conditional branching.
    """

    def run(self, request: AgentWorkflowRequest) -> AgentWorkflowResponse:
        state = AgentState(
            request_type=request.request_type,
            domain=request.domain,
            student_id=request.student_id,
            student_skills=request.student_skills or [],
            student_bio=request.student_bio,
            opportunity_id=request.opportunity_id,
            opportunity_title=request.opportunity_title,
            company_name=request.company_name,
            opportunity_skills=request.opportunity_skills or [],
            candidate_opportunities=request.candidate_opportunities or [],
            applicants=request.applicants or []
        )

        req_type = request.request_type.upper()

        if req_type == "ROADMAP":
            state = roadmap_generator_node(state)
            result = state.roadmap_results
        elif req_type == "RANKING":
            state = ranking_node(state)
            result = {
                "opportunity_id": state.opportunity_id,
                "ranked_applicants": [a.model_dump() for a in state.ranked_applicants]
            }
        elif req_type == "MATCHING":
            state = profile_analyzer_node(state)
            state = matching_node(state)
            result = state.match_results
        elif req_type == "SKILL_GAP":
            state = profile_analyzer_node(state)
            state = matching_node(state)
            state = skill_gap_node(state)
            result = state.skill_gap_results
        elif req_type == "RECOMMENDATION":
            state = profile_analyzer_node(state)
            state = matching_node(state)
            state = recommender_node(state)
            result = {
                "student_id": state.student_id,
                "recommendations": [r.model_dump() for r in state.recommendations]
            }
        else: # FULL_EVALUATION
            state = profile_analyzer_node(state)
            state = matching_node(state)
            state = skill_gap_node(state)
            state = recommender_node(state)
            if state.applicants:
                state = ranking_node(state)
            result = {
                "profile_summary": state.profile_summary,
                "match_results": state.match_results,
                "skill_gap_results": state.skill_gap_results,
                "recommendations": [r.model_dump() for r in state.recommendations],
                "ranked_applicants": [a.model_dump() for a in state.ranked_applicants]
            }

        return AgentWorkflowResponse(
            status="COMPLETED",
            request_type=request.request_type,
            workflow_steps_executed=state.execution_history,
            result=result
        )

career_agent_graph = CareerAgentGraph()
