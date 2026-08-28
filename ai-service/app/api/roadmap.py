from fastapi import APIRouter, HTTPException, status
from typing import List, Dict, Any
from ..schemas.roadmap import RoadmapRequestSchema, RoadmapSchema
from ..schemas.agent import AgentWorkflowRequest, AgentWorkflowResponse
from ..agents.graph import CareerAgentGraph
from ..services.roadmap_service import RoadmapService

router = APIRouter(tags=["AI Roadmap"])
roadmap_service = RoadmapService()
agent_graph = CareerAgentGraph()

@router.post("/agent/roadmap", response_model=RoadmapSchema, summary="Generate structured AI Career Roadmap")
async def generate_career_roadmap(request: RoadmapRequestSchema):
    """
    Generate an actionable, phased career preparation roadmap for a target domain.
    Enforces strict Pydantic output validation.
    """
    try:
        roadmap = roadmap_service.generate_roadmap(request)
        return roadmap
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate career roadmap: {str(e)}"
        )

@router.get("/agent/trending-domains-suggestions", summary="AI-assisted trending domains suggestions")
async def get_trending_domains_suggestions() -> List[Dict[str, Any]]:
    """
    Returns AI-curated suggested trending domains for platform indexing.
    """
    return [
        {
            "domain_name": "Cloud Computing",
            "description": "Architect, deploy, and scale resilient infrastructure on AWS, Azure, and Google Cloud.",
            "category": "Cloud",
            "popularity_tag": "High demand"
        },
        {
            "domain_name": "AI & Machine Learning",
            "description": "Develop generative models, deep neural networks, and agentic workflows with PyTorch & LLMs.",
            "category": "AI/Data",
            "popularity_tag": "Fast growing"
        },
        {
            "domain_name": "Cybersecurity",
            "description": "Defend networks, audit application vulnerabilities, and implement zero-trust architectures.",
            "category": "Security",
            "popularity_tag": "Top salary"
        },
        {
            "domain_name": "DevOps & SRE",
            "description": "Automate CI/CD pipelines, container orchestration with Kubernetes, and maintain high availability.",
            "category": "Engineering",
            "popularity_tag": "High demand"
        },
        {
            "domain_name": "Full Stack Web Development",
            "description": "Build modern end-to-end applications using React, Spring Boot, Node.js, and PostgreSQL.",
            "category": "Engineering",
            "popularity_tag": "High demand"
        },
        {
            "domain_name": "Data Engineering",
            "description": "Construct reliable data pipelines, distributed warehouses, and stream processing with Kafka and Spark.",
            "category": "AI/Data",
            "popularity_tag": "High salary"
        },
        {
            "domain_name": "MLOps",
            "description": "Automate machine learning deployments, model monitoring, and feature store pipelines.",
            "category": "AI/Data",
            "popularity_tag": "Emerging tech"
        }
    ]
