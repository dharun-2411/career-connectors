package com.careerconnectors.repository;

import com.careerconnectors.entity.Company;
import com.careerconnectors.entity.Opportunity;
import com.careerconnectors.enums.OpportunityStatus;
import com.careerconnectors.enums.OpportunityType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OpportunityRepository extends JpaRepository<Opportunity, Long> {
    List<Opportunity> findByCompany(Company company);
    Page<Opportunity> findByCompany(Company company, Pageable pageable);
    List<Opportunity> findByStatus(OpportunityStatus status);
    Page<Opportunity> findByStatus(OpportunityStatus status, Pageable pageable);
    long countByStatus(OpportunityStatus status);

    @Query("SELECT o FROM Opportunity o WHERE " +
           "(:status IS NULL OR o.status = :status) AND " +
           "(:type IS NULL OR o.type = :type) AND " +
           "(:isRemote IS NULL OR o.isRemote = :isRemote) AND " +
           "(:search IS NULL OR " +
           " LOWER(o.title) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) OR " +
           " LOWER(o.description) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) OR " +
           " LOWER(o.location) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) OR " +
           " LOWER(o.company.name) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')))")
    Page<Opportunity> searchAndFilterOpportunities(
            @Param("search") String search,
            @Param("type") OpportunityType type,
            @Param("isRemote") Boolean isRemote,
            @Param("status") OpportunityStatus status,
            Pageable pageable);

    @Query("SELECT DISTINCT o FROM Opportunity o JOIN o.requiredSkills os WHERE " +
           "o.status = 'OPEN' AND os.skill.name IN :skillNames")
    List<Opportunity> findMatchingOpportunitiesBySkills(@Param("skillNames") List<String> skillNames);
}
