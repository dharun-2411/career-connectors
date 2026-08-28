from fastapi import APIRouter
from ..schemas.career import CareerSuggestionRequest, CareerSuggestionResponse
from ..services.career_service import career_service

router = APIRouter()

@router.post("/career-suggestions", response_model=CareerSuggestionResponse)
def get_career_suggestions(request: CareerSuggestionRequest):
    return career_service.generate_suggestions(request)
