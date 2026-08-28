import pytest
from app.schemas.roadmap import RoadmapRequestSchema
from app.services.roadmap_service import RoadmapService
from app.schemas.agent import AgentWorkflowRequest
from app.agents.graph import CareerAgentGraph

def test_cloud_computing_roadmap_generation():
    service = RoadmapService()
    req = RoadmapRequestSchema(domain="Cloud Computing", student_skills=["Linux", "Docker"])
    roadmap = service.generate_roadmap(req)
    
    assert roadmap.domain_name == "Cloud Computing"
    assert len(roadmap.phases) >= 3
    assert len(roadmap.core_technologies) > 0
    assert len(roadmap.recommended_certifications) > 0
    assert len(roadmap.capstone_projects) > 0
    assert len(roadmap.adjacent_domains) > 0

    # Verify phase structure
    first_phase = roadmap.phases[0]
    assert first_phase.phase_id == "phase_1"
    assert first_phase.order_index == 1
    assert len(first_phase.topics) > 0
    assert len(first_phase.resources) > 0
    assert len(first_phase.suggested_projects) > 0

def test_dynamic_custom_domain_roadmap():
    service = RoadmapService()
    req = RoadmapRequestSchema(domain="Quantum Cryptography", student_skills=["Python", "Math"])
    roadmap = service.generate_roadmap(req)
    
    assert "Quantum Cryptography" in roadmap.domain_name
    assert len(roadmap.phases) == 3
    assert roadmap.phases[0].phase_id == "phase_1"
    assert len(roadmap.phases[0].topics) > 0
    assert len(roadmap.phases[0].resources) > 0

def test_agent_graph_roadmap_workflow():
    graph = CareerAgentGraph()
    req = AgentWorkflowRequest(
        request_type="ROADMAP",
        domain="AI & Machine Learning",
        student_skills=[{"name": "Python", "proficiency": "INTERMEDIATE"}]
    )
    res = graph.run(req)
    
    assert res.status == "COMPLETED"
    assert res.request_type == "ROADMAP"
    assert "roadmap_generator_node" in res.workflow_steps_executed[0]
    assert "phases" in res.result
    assert res.result["domain_name"] == "AI & Machine Learning"
