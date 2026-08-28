import pytest
from app.schemas.matching import MatchingRequest, StudentSkillInput, OpportunitySkillInput
from app.services.matching_service import matching_service

def test_matching_exact_skills():
    req = MatchingRequest(
        student_id=1,
        student_skills=[
            StudentSkillInput(name="Python", proficiency="ADVANCED"),
            StudentSkillInput(name="FastAPI", proficiency="ADVANCED")
        ],
        opportunity_id=10,
        opportunity_skills=[
            OpportunitySkillInput(name="Python", weightage=2.0, proficiency="ADVANCED"),
            OpportunitySkillInput(name="FastAPI", weightage=2.0, proficiency="ADVANCED")
        ]
    )
    res = matching_service.compute_match(req)
    assert res.overall_score >= 80.0
    assert "Python" in res.matching_skills
    assert "FastAPI" in res.matching_skills
    assert len(res.missing_skills) == 0

def test_matching_missing_skills():
    req = MatchingRequest(
        student_id=1,
        student_skills=[
            StudentSkillInput(name="JavaScript", proficiency="INTERMEDIATE")
        ],
        opportunity_id=20,
        opportunity_skills=[
            OpportunitySkillInput(name="Python", weightage=3.0, proficiency="ADVANCED"),
            OpportunitySkillInput(name="Docker", weightage=2.0, proficiency="INTERMEDIATE")
        ]
    )
    res = matching_service.compute_match(req)
    assert "Python" in res.missing_skills
    assert "Docker" in res.missing_skills
    assert len(res.matching_skills) == 0
