package com.careerconnectors.repository;

import com.careerconnectors.entity.Application;
import com.careerconnectors.entity.Opportunity;
import com.careerconnectors.entity.Student;
import com.careerconnectors.enums.ApplicationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {
    List<Application> findByStudent(Student student);
    Page<Application> findByStudent(Student student, Pageable pageable);
    List<Application> findByStudentId(Long studentId);

    List<Application> findByOpportunity(Opportunity opportunity);
    Page<Application> findByOpportunity(Opportunity opportunity, Pageable pageable);
    List<Application> findByOpportunityId(Long opportunityId);
    Page<Application> findByOpportunityId(Long opportunityId, Pageable pageable);

    Optional<Application> findByStudentAndOpportunity(Student student, Opportunity opportunity);
    Optional<Application> findByStudentIdAndOpportunityId(Long studentId, Long opportunityId);
    boolean existsByStudentAndOpportunity(Student student, Opportunity opportunity);

    long countByStatus(ApplicationStatus status);

    @Query("SELECT a FROM Application a WHERE a.opportunity.company.id = :companyId")
    Page<Application> findByCompanyId(@Param("companyId") Long companyId, Pageable pageable);
}
