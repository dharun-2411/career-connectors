from typing import List
from ..schemas.applicant_ranking import ApplicantRankingRequest, ApplicantRankingResponse, RankedApplicantDetail
from ..schemas.matching import MatchingRequest
from .matching_service import matching_service

class ApplicantRankingService:

    def rank_applicants(self, request: ApplicantRankingRequest) -> ApplicantRankingResponse:
        ranked_list: List[RankedApplicantDetail] = []

        for app in request.applicants:
            match_req = MatchingRequest(
                student_id=app.student_id,
                student_skills=app.skills,
                opportunity_id=request.opportunity_id,
                opportunity_skills=request.opportunity_skills
            )
            match_res = matching_service.compute_match(match_req)

            # Extra heuristic points for universities / cover letter depth
            exp_bonus = 5.0 if app.cover_letter and len(app.cover_letter.split()) > 25 else 0.0
            exp_score = min(100.0, match_res.overall_score + exp_bonus)

            comp_score = round(0.75 * match_res.overall_score + 0.25 * exp_score, 1)

            if comp_score >= 85.0:
                summary = "Top Tier Candidate: Strong technical mastery across core competencies."
            elif comp_score >= 65.0:
                summary = "Solid Candidate: Meets primary requirements with minor guidance needed."
            else:
                summary = "Development Candidate: Needs training in specific high-weight areas."

            ranked_list.append(RankedApplicantDetail(
                application_id=app.application_id,
                student_id=app.student_id,
                student_name=app.name,
                email=app.email,
                university=app.university,
                resume_url=app.resume_url,
                rank=0,
                composite_score=comp_score,
                skill_match_score=match_res.overall_score,
                experience_relevance_score=round(exp_score, 1),
                top_matching_skills=match_res.matching_skills,
                potential_gaps=match_res.missing_skills,
                ai_recommendation_summary=summary
            ))

        ranked_list.sort(key=lambda x: x.composite_score, reverse=True)
        for i, item in enumerate(ranked_list):
            item.rank = i + 1

        return ApplicantRankingResponse(
            opportunity_id=request.opportunity_id,
            total_applicants=len(ranked_list),
            ranked_applicants=ranked_list
        )

applicant_ranking_service = ApplicantRankingService()
