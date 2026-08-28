package com.careerconnectors.repository;

import com.careerconnectors.entity.StudentSavedRoadmap;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentSavedRoadmapRepository extends JpaRepository<StudentSavedRoadmap, Long> {

    @Query("SELECT s FROM StudentSavedRoadmap s JOIN FETCH s.roadmap WHERE s.student.id = :studentId ORDER BY s.lastAccessedAt DESC")
    List<StudentSavedRoadmap> findByStudentIdWithRoadmap(Long studentId);

    Optional<StudentSavedRoadmap> findByStudentIdAndRoadmapId(Long studentId, Long roadmapId);

    boolean existsByStudentIdAndRoadmapId(Long studentId, Long roadmapId);
}
