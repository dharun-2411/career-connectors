package com.careerconnectors.repository;

import com.careerconnectors.entity.Company;
import com.careerconnectors.entity.User;
import com.careerconnectors.enums.VerificationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CompanyRepository extends JpaRepository<Company, Long> {
    Optional<Company> findByUser(User user);
    Optional<Company> findByUserId(Long userId);
    List<Company> findByVerificationStatus(VerificationStatus status);
    long countByVerificationStatus(VerificationStatus status);

    @Query("SELECT c FROM Company c WHERE " +
           "LOWER(c.name) LIKE LOWER(CONCAT('%', CAST(:query AS string), '%')) OR " +
           "LOWER(c.industry) LIKE LOWER(CONCAT('%', CAST(:query AS string), '%')) OR " +
           "LOWER(c.location) LIKE LOWER(CONCAT('%', CAST(:query AS string), '%'))")
    Page<Company> searchCompanies(@Param("query") String query, Pageable pageable);
}
