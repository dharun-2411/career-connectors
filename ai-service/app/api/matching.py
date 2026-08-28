from fastapi import APIRouter
from ..schemas.matching import MatchingRequest, MatchingResponse
from ..services.matching_service import matching_service

router = APIRouter()

@router.post("/matching", response_model=MatchingResponse)
def compute_match_score(request: MatchingRequest):
    return matching_service.compute_match(request)
