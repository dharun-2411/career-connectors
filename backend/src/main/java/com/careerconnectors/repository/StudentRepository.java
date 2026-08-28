package com.careerconnectors.repository;

import com.careerconnectors.entity.Student;
import com.careerconnectors.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByUser(User user);
    Optional<Student> findByUserId(Long userId);

    @Query("SELECT s FROM Student s WHERE " +
           "LOWER(s.name) LIKE LOWER(CONCAT('%', CAST(:query AS string), '%')) OR " +
           "LOWER(s.education) LIKE LOWER(CONCAT('%', CAST(:query AS string), '%')) OR " +
           "LOWER(s.university) LIKE LOWER(CONCAT('%', CAST(:query AS string), '%'))")
    Page<Student> searchStudents(@Param("query") String query, Pageable pageable);
}
