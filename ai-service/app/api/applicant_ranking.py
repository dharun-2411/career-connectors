from fastapi import APIRouter
from ..schemas.applicant_ranking import ApplicantRankingRequest, ApplicantRankingResponse
from ..services.applicant_ranking_service import applicant_ranking_service

router = APIRouter()

@router.post("/applicant-ranking", response_model=ApplicantRankingResponse)
def rank_applicants(request: ApplicantRankingRequest):
    return applicant_ranking_service.rank_applicants(request)
