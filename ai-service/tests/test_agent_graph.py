import pytest
from app.schemas.agent import AgentWorkflowRequest
from app.schemas.matching import StudentSkillInput, OpportunitySkillInput
from app.agents.graph import career_agent_graph

def test_agent_graph_matching_workflow():
    req = AgentWorkflowRequest(
        request_type="MATCHING",
        student_id=1,
        student_skills=[StudentSkillInput(name="Python", proficiency="ADVANCED")],
        opportunity_id=5,
        opportunity_skills=[OpportunitySkillInput(name="Python", weightage=2.0, proficiency="ADVANCED")]
    )
    res = career_agent_graph.run(req)
    assert res.status == "COMPLETED"
    assert len(res.workflow_steps_executed) >= 2
    assert "overall_score" in res.result

def test_agent_graph_skill_gap_workflow():
    req = AgentWorkflowRequest(
        request_type="SKILL_GAP",
        student_id=1,
        student_skills=[StudentSkillInput(name="Java", proficiency="ADVANCED")],
        opportunity_id=5,
        opportunity_title="Full Stack Java Developer",
        company_name="Enterprise Corp",
        opportunity_skills=[
            OpportunitySkillInput(name="Java", weightage=2.0, proficiency="ADVANCED"),
            OpportunitySkillInput(name="Kubernetes", weightage=3.0, proficiency="INTERMEDIATE")
        ]
    )
    res = career_agent_graph.run(req)
    assert res.status == "COMPLETED"
    assert "missing_skills" in res.result
