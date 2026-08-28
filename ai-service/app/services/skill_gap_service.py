from typing import List
from ..schemas.skill_gap import SkillGapRequest, SkillGapResponse, MissingSkillDetail, LearningResource
from ..schemas.matching import MatchingRequest
from .matching_service import matching_service

class SkillGapService:

    RESOURCE_TEMPLATES = {
        "Docker": ("Mastering Docker Containers & Microservices", "Course & Lab", "2 Weeks", "Intermediate", "https://docker.com/get-started"),
        "Kubernetes": ("Kubernetes Cloud Native Deployment", "Hands-on Workshop", "3 Weeks", "Advanced", "https://kubernetes.io/docs/tutorials/"),
        "Spring Boot": ("Production Ready Java & Spring Boot", "Interactive Project", "3-4 Weeks", "Advanced", "https://spring.io/guides"),
        "React.js": ("Modern React with Hooks & Redux", "Interactive Course", "2-3 Weeks", "Intermediate", "https://react.dev/learn"),
        "FastAPI": ("High-Performance Python Web APIs with FastAPI", "Course & API Sandbox", "1-2 Weeks", "Intermediate", "https://fastapi.tiangolo.com/tutorial/"),
        "LangGraph / LangChain": ("Agentic Workflows and Multi-Agent Systems", "Research Lab & Project", "2-3 Weeks", "Advanced", "https://langchain-ai.github.io/langgraph/"),
        "PostgreSQL": ("PostgreSQL Performance & Indexing", "Database Masterclass", "2 Weeks", "Intermediate", "https://www.postgresql.org/docs/"),
        "Machine Learning": ("Applied Machine Learning with PyTorch/Scikit-Learn", "Specialization", "4-6 Weeks", "Advanced", "https://scikit-learn.org/stable/tutorial/")
    }

    def analyze_gap(self, request: SkillGapRequest) -> SkillGapResponse:
        student_skill_map = {s.name.lower().strip(): s for s in request.student_skills}
        missing_skills: List[MissingSkillDetail] = []
        roadmap: List[LearningResource] = []

        match_req = MatchingRequest(
            student_id=request.student_id,
            student_skills=request.student_skills,
            opportunity_id=request.opportunity_id,
            opportunity_skills=request.opportunity_skills
        )
        match_res = matching_service.compute_match(match_req)

        for req in request.opportunity_skills:
            norm_name = req.name.lower().strip()

            if norm_name not in student_skill_map:
                prio = "HIGH" if req.weightage >= 2.0 else "MEDIUM"
                missing_skills.append(MissingSkillDetail(
                    skill_name=req.name,
                    category="Technical",
                    required_proficiency=req.proficiency,
                    current_proficiency="None",
                    weightage=req.weightage,
                    priority=prio
                ))

                # Build learning roadmap resource
                if req.name in self.RESOURCE_TEMPLATES:
                    title, rtype, dur, diff, url = self.RESOURCE_TEMPLATES[req.name]
                else:
                    title = f"Complete Roadmap to {req.name} Mastery"
                    rtype = "Guided Project & Tutorial"
                    dur = "2-3 Weeks"
                    diff = req.proficiency
                    url = f"https://www.google.com/search?q={req.name.replace(' ', '+')}+tutorials+projects"

                roadmap.append(LearningResource(
                    skill=req.name,
                    title=title,
                    type=rtype,
                    estimated_time_to_learn=dur,
                    difficulty=diff,
                    resource_url=url
                ))
            else:
                st = student_skill_map[norm_name]
                st_prio = matching_service.PROFICIENCY_WEIGHTS.get(st.proficiency.upper(), 1)
                req_prio = matching_service.PROFICIENCY_WEIGHTS.get(req.proficiency.upper(), 1)

                if st_prio < req_prio:
                    missing_skills.append(MissingSkillDetail(
                        skill_name=req.name,
                        category="Technical",
                        required_proficiency=req.proficiency,
                        current_proficiency=st.proficiency,
                        weightage=req.weightage,
                        priority="MEDIUM"
                    ))

                    roadmap.append(LearningResource(
                        skill=req.name,
                        title=f"Advanced {req.name} for Production Scale",
                        type="Deep Dive Workshop",
                        estimated_time_to_learn="1-2 Weeks",
                        difficulty="Advanced",
                        resource_url=f"https://github.com/topics/{req.name.lower().replace(' ', '-')}"
                    ))

        summary = (
            f"You possess a {match_res.overall_score}% compatibility score with {request.opportunity_title}. "
            f"Addressing the {len(missing_skills)} identified skill gap areas below will optimize your candidacy."
            if missing_skills else
            f"Congratulations! You possess 100% of the requested skill requirements for {request.opportunity_title}."
        )

        return SkillGapResponse(
            student_id=request.student_id,
            opportunity_id=request.opportunity_id,
            opportunity_title=request.opportunity_title,
            company_name=request.company_name,
            match_percentage=match_res.overall_score,
            missing_skills=missing_skills,
            learning_roadmap=roadmap,
            summary=summary
        )

skill_gap_service = SkillGapService()
