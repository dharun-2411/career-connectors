package com.careerconnectors.repository;

import com.careerconnectors.entity.TrendingDomain;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TrendingDomainRepository extends JpaRepository<TrendingDomain, Long> {

    List<TrendingDomain> findByIsActiveTrueOrderByDisplayOrderAsc();

    Optional<TrendingDomain> findByDomainNameIgnoreCase(String domainName);

    @Query("SELECT t FROM TrendingDomain t WHERE t.isActive = true AND LOWER(t.domainName) LIKE LOWER(CONCAT('%', :query, '%')) ORDER BY t.displayOrder ASC")
    List<TrendingDomain> searchActiveDomains(String query);
}
