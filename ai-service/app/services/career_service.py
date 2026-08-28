from typing import List
from ..schemas.career import CareerSuggestionRequest, CareerSuggestionResponse, CareerPath, ProjectIdea

class CareerService:

    def generate_suggestions(self, request: CareerSuggestionRequest) -> CareerSuggestionResponse:
        skills = {s.name.lower(): s for s in request.student_skills}

        paths: List[CareerPath] = []
        projects: List[ProjectIdea] = []

        has_java = "java" in skills or "spring boot" in skills
        has_python = "python" in skills or "fastapi" in skills
        has_ai = "machine learning" in skills or "deep learning" in skills or "langgraph" in skills
        has_react = "react" in skills or "react.js" in skills or "javascript" in skills or "typescript" in skills

        if has_ai or has_python:
            paths.append(CareerPath(
                role_title="AI/ML Systems Engineer",
                industry="AI Research & Production Labs",
                readiness_level="High (88%)",
                avg_market_demand="Extremely High",
                transferrable_skills=["Python", "FastAPI", "Machine Learning"],
                recommended_next_skills=["LangGraph", "Vector Databases", "MLOps / Kubeflow"]
            ))
            projects.append(ProjectIdea(
                title="Context-Aware Multi-Agent Knowledge Engine",
                description="Develop a graph-based multi-agent retrieval pipeline integrating pgvector and LangGraph for high-accuracy document intelligence.",
                difficulty="Advanced",
                technologies_used=["Python", "FastAPI", "LangGraph", "pgvector"],
                portfolioImpact="Exceptional - Highlights proficiency in modern agentic AI patterns"
            ))

        if has_java or has_react:
            paths.append(CareerPath(
                role_title="Enterprise Full-Stack Cloud Architect",
                industry="Fintech & SaaS",
                readiness_level="High (85%)",
                avg_market_demand="Very High",
                transferrable_skills=["Java", "Spring Boot", "React.js", "PostgreSQL"],
                recommended_next_skills=["Docker", "Kubernetes", "AWS Cloud Architecture"]
            ))
            projects.append(ProjectIdea(
                title="Distributed Event-Driven E-Commerce Platform",
                description="Architect a microservice-based store with Kafka, Spring Boot, and React frontend supporting real-time inventory tracking.",
                difficulty="Intermediate",
                technologies_used=["Java", "Spring Boot", "React.js", "Docker", "PostgreSQL"],
                portfolioImpact="High - Demonstrates scalable enterprise architecture"
            ))

        trending = ["LangGraph", "pgvector", "FastAPI", "Spring Boot 3", "React 19", "Kubernetes", "TailwindCSS"]

        return CareerSuggestionResponse(
            student_id=request.student_id,
            suggested_paths=paths,
            recommended_projects=projects,
            trending_skills_in_market=trending
        )

career_service = CareerService()
