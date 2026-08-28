from typing import List, Dict, Any, Tuple
from ..schemas.matching import MatchingRequest, MatchingResponse, StudentSkillInput, OpportunitySkillInput
from ..models.embedding_model import embedding_model

class MatchingService:

    PROFICIENCY_WEIGHTS = {
        "BEGINNER": 1,
        "INTERMEDIATE": 2,
        "ADVANCED": 3,
        "EXPERT": 4
    }

    def compute_match(self, request: MatchingRequest) -> MatchingResponse:
        student_skills = {s.name.lower().strip(): s for s in request.student_skills}
        required_skills = request.opportunity_skills

        if not required_skills:
            return MatchingResponse(
                student_id=request.student_id,
                opportunity_id=request.opportunity_id,
                overall_score=100.0,
                semantic_score=100.0,
                skill_score=100.0,
                matching_skills=[s.name for s in request.student_skills],
                missing_skills=[],
                explanation="Opportunity has no specific hard requirements."
            )

        # 1. Semantic Embedding Similarity
        student_corpus = " ".join([f"{s.name} {s.proficiency}" for s in request.student_skills])
        opportunity_corpus = " ".join([f"{s.name} {s.proficiency}" for s in request.opportunity_skills])

        vec_student = embedding_model.encode_text(student_corpus)
        vec_opportunity = embedding_model.encode_text(opportunity_corpus)
        semantic_sim = embedding_model.compute_cosine_similarity(vec_student, vec_opportunity) * 100.0

        # 2. Weighted Rule-Based Score
        total_weight = 0.0
        earned_weight = 0.0
        matching_names: List[str] = []
        missing_names: List[str] = []

        for req in required_skills:
            w = float(req.weightage)
            total_weight += w
            norm_name = req.name.lower().strip()

            if norm_name in student_skills:
                st_skill = student_skills[norm_name]
                matching_names.append(req.name)

                st_level = self.PROFICIENCY_WEIGHTS.get(st_skill.proficiency.upper(), 2)
                req_level = self.PROFICIENCY_WEIGHTS.get(req.proficiency.upper(), 2)

                if st_level >= req_level:
                    factor = 1.0
                elif st_level == req_level - 1:
                    factor = 0.75
                elif st_level == req_level - 2:
                    factor = 0.50
                else:
                    factor = 0.25

                earned_weight += w * factor
            else:
                missing_names.append(req.name)

        rule_score = (earned_weight / total_weight * 100.0) if total_weight > 0 else 100.0

        # Composite score (60% weighted rule-based + 40% semantic embedding score)
        overall = (0.60 * rule_score) + (0.40 * semantic_sim)
        overall_clamped = round(max(0.0, min(100.0, overall)), 1)
        semantic_clamped = round(max(0.0, min(100.0, semantic_sim)), 1)
        rule_clamped = round(max(0.0, min(100.0, rule_score)), 1)

        explanation = (
            f"Composite score of {overall_clamped}% determined from {len(matching_names)} matching "
            f"requirements out of {len(required_skills)} required, with semantic alignment of {semantic_clamped}%."
        )

        return MatchingResponse(
            student_id=request.student_id,
            opportunity_id=request.opportunity_id,
            overall_score=overall_clamped,
            semantic_score=semantic_clamped,
            skill_score=rule_clamped,
            matching_skills=matching_names,
            missing_skills=missing_names,
            explanation=explanation,
            breakdown={
                "matching_count": len(matching_names),
                "missing_count": len(missing_names),
                "earned_weight": round(earned_weight, 2),
                "total_weight": round(total_weight, 2)
            }
        )

matching_service = MatchingService()
