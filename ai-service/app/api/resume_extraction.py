from fastapi import APIRouter
from ..schemas.resume import ResumeExtractRequest, ResumeExtractResponse
from ..services.resume_service import resume_service

router = APIRouter()

@router.post("/resume-extraction", response_model=ResumeExtractResponse)
def extract_resume_skills(request: ResumeExtractRequest):
    return resume_service.extract_from_text(request)
