from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.config import settings
from .api import (
    matching,
    recommendation,
    skill_gap,
    applicant_ranking,
    resume_extraction,
    career_suggestions,
    roadmap,
    agent
)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Production-grade FastAPI + LangGraph AI Microservice for Career Connectors"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(matching.router, prefix=settings.API_V1_STR, tags=["Matching"])
app.include_router(recommendation.router, prefix=settings.API_V1_STR, tags=["Recommendations"])
app.include_router(skill_gap.router, prefix=settings.API_V1_STR, tags=["Skill Gap"])
app.include_router(applicant_ranking.router, prefix=settings.API_V1_STR, tags=["Applicant Ranking"])
app.include_router(resume_extraction.router, prefix=settings.API_V1_STR, tags=["Resume Extraction"])
app.include_router(career_suggestions.router, prefix=settings.API_V1_STR, tags=["Career Suggestions"])
app.include_router(roadmap.router, tags=["AI Roadmap"])
app.include_router(agent.router, tags=["LangGraph Multi-Agent Workflow"])

@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "HEALTHY",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
