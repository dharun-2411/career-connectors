from fastapi import APIRouter
from ..schemas.recommendation import RecommendationRequest, RecommendationResponse
from ..services.recommendation_service import recommendation_service

router = APIRouter()

@router.post("/recommendation", response_model=RecommendationResponse)
def get_recommendations(request: RecommendationRequest):
    return recommendation_service.get_recommendations(request)
