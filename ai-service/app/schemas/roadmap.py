from pydantic import BaseModel, Field
from typing import List, Optional

class RoadmapResourceSchema(BaseModel):
    name: str = Field(..., description="Name of the course, book, documentation or tool")
    type: str = Field(..., description="Course, Documentation, Book, Practice Platform, Video Series")
    url: Optional[str] = Field(default="", description="Official reference or documentation link")
    description: Optional[str] = Field(default="", description="Why this resource is recommended")

class RoadmapProjectSchema(BaseModel):
    title: str = Field(..., description="Project title")
    description: str = Field(..., description="Detailed project objectives and specifications")
    difficulty: str = Field(..., description="Beginner, Intermediate, Advanced")
    technologies: List[str] = Field(default_factory=list, description="Key tech stack components")
    portfolio_impact: Optional[str] = Field(default="", description="How this demonstrates mastery to recruiters")

class RoadmapPhaseSchema(BaseModel):
    phase_id: str = Field(..., description="Unique ID for step/phase tracking e.g. phase_1")
    order_index: int = Field(..., description="Sequential order starting from 1")
    title: str = Field(..., description="Phase title e.g. Foundations & Core Concepts")
    duration: str = Field(..., description="Estimated duration e.g. 4 Weeks")
    description: str = Field(..., description="Phase focus and primary learning goals")
    topics: List[str] = Field(default_factory=list, description="List of granular competencies/topics")
    resources: List[RoadmapResourceSchema] = Field(default_factory=list, description="Curated learning materials")
    suggested_projects: List[RoadmapProjectSchema] = Field(default_factory=list, description="Hands-on projects to build")
    milestones: List[str] = Field(default_factory=list, description="Checklist criteria for completion")

class RoadmapSchema(BaseModel):
    domain_name: str = Field(..., description="Target domain name")
    overview: str = Field(..., description="High-level 2-3 line overview of the field and why it matters")
    total_duration: str = Field(..., description="Total estimated time commitment e.g. 4-6 Months")
    industry_demand_summary: str = Field(..., description="Industry relevance and hiring demand trends without fabricated stats")
    phases: List[RoadmapPhaseSchema] = Field(default_factory=list, description="Ordered progressive learning phases")
    core_technologies: List[str] = Field(default_factory=list, description="Core tools and frameworks to master")
    recommended_certifications: List[str] = Field(default_factory=list, description="Recognized industry certifications")
    capstone_projects: List[RoadmapProjectSchema] = Field(default_factory=list, description="Comprehensive portfolio capstone projects")
    adjacent_domains: List[str] = Field(default_factory=list, description="Related domains to explore next")

class RoadmapRequestSchema(BaseModel):
    domain: str = Field(..., min_length=2, max_length=150, description="Target domain name")
    student_skills: Optional[List[str]] = Field(default_factory=list, description="Existing student skills for personalization")
    student_bio: Optional[str] = Field(default="", description="Student background notes")
