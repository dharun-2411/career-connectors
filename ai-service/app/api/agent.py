from fastapi import APIRouter
from ..schemas.agent import AgentWorkflowRequest, AgentWorkflowResponse
from ..agents.graph import career_agent_graph

router = APIRouter()

@router.post("/agent/run", response_model=AgentWorkflowResponse)
def run_agent_workflow(request: AgentWorkflowRequest):
    return career_agent_graph.run(request)
