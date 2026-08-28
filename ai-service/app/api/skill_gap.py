from fastapi import APIRouter
from ..schemas.skill_gap import SkillGapRequest, SkillGapResponse
from ..services.skill_gap_service import skill_gap_service

router = APIRouter()

@router.post("/skill-gap", response_model=SkillGapResponse)
def analyze_skill_gap(request: SkillGapRequest):
    return skill_gap_service.analyze_gap(request)
