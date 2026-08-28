package com.careerconnectors.repository;

import com.careerconnectors.entity.Opportunity;
import com.careerconnectors.entity.SkillGapReport;
import com.careerconnectors.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SkillGapReportRepository extends JpaRepository<SkillGapReport, Long> {
    List<SkillGapReport> findByStudent(Student student);
    Optional<SkillGapReport> findByStudentAndOpportunity(Student student, Opportunity opportunity);
    Optional<SkillGapReport> findFirstByStudentIdAndOpportunityIdOrderByCreatedAtDesc(Long studentId, Long opportunityId);
}
