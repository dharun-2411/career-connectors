import pytest
from app.schemas.skill_gap import SkillGapRequest
from app.schemas.matching import StudentSkillInput, OpportunitySkillInput
from app.services.skill_gap_service import skill_gap_service

def test_skill_gap_analysis():
    req = SkillGapRequest(
        student_id=1,
        student_skills=[
            StudentSkillInput(name="Java", proficiency="ADVANCED")
        ],
        opportunity_id=101,
        opportunity_title="Cloud Engineer",
        company_name="CloudScale",
        opportunity_skills=[
            OpportunitySkillInput(name="Java", weightage=2.0, proficiency="ADVANCED"),
            OpportunitySkillInput(name="Docker", weightage=3.0, proficiency="INTERMEDIATE")
        ]
    )
    res = skill_gap_service.analyze_gap(req)
    assert res.match_percentage > 0.0
    assert len(res.missing_skills) == 1
    assert res.missing_skills[0].skill_name == "Docker"
    assert len(res.learning_roadmap) == 1
