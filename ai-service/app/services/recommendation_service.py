from typing import List
from ..schemas.recommendation import RecommendationRequest, RecommendationResponse, RecommendedItem
from ..schemas.matching import MatchingRequest
from .matching_service import matching_service

class RecommendationService:

    def get_recommendations(self, request: RecommendationRequest) -> RecommendationResponse:
        results: List[RecommendedItem] = []

        for opp in request.opportunities:
            match_req = MatchingRequest(
                student_id=request.student_id,
                student_skills=request.student_skills,
                opportunity_id=opp.id,
                opportunity_skills=opp.required_skills
            )
            match_res = matching_service.compute_match(match_req)

            # Fit determination
            score = match_res.overall_score
            if score >= 80.0:
                fit = "High Synergy: Ideal role for immediate impact & leadership"
            elif score >= 60.0:
                fit = "Strong Potential: Solid match with minor upskilling runway"
            else:
                fit = "Growth Opportunity: Broadens multi-disciplinary skillset"

            match_reason = (
                f"Matches {len(match_res.matching_skills)} required skills ("
                f"{', '.join(match_res.matching_skills[:3]) if match_res.matching_skills else 'General Skills'})"
            )

            results.append(RecommendedItem(
                opportunity_id=opp.id,
                title=opp.title,
                company_name=opp.company_name,
                match_score=score,
                match_reason=match_reason,
                key_strengths=match_res.matching_skills,
                career_trajectory_fit=fit
            ))

        # Sort descending by match score
        results.sort(key=lambda x: x.match_score, reverse=True)
        top_recommendations = results[:request.top_k]

        return RecommendationResponse(
            student_id=request.student_id,
            recommendations=top_recommendations
        )

recommendation_service = RecommendationService()
