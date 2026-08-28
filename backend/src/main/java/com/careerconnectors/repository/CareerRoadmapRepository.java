package com.careerconnectors.repository;

import com.careerconnectors.entity.CareerRoadmap;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface CareerRoadmapRepository extends JpaRepository<CareerRoadmap, Long> {

    @Query("SELECT r FROM CareerRoadmap r WHERE LOWER(r.domainName) = LOWER(:domainName) ORDER BY r.generatedAt DESC LIMIT 1")
    Optional<CareerRoadmap> findLatestByDomainNameIgnoreCase(String domainName);

    @Query("SELECT r FROM CareerRoadmap r WHERE LOWER(r.domainName) = LOWER(:domainName) AND r.generatedAt >= :since ORDER BY r.generatedAt DESC LIMIT 1")
    Optional<CareerRoadmap> findFreshByDomainNameIgnoreCase(String domainName, LocalDateTime since);
}
