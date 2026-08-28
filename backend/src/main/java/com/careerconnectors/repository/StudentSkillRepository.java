package com.careerconnectors.repository;

import com.careerconnectors.entity.Skill;
import com.careerconnectors.entity.Student;
import com.careerconnectors.entity.StudentSkill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentSkillRepository extends JpaRepository<StudentSkill, Long> {
    List<StudentSkill> findByStudent(Student student);
    List<StudentSkill> findByStudentId(Long studentId);
    Optional<StudentSkill> findByStudentAndSkill(Student student, Skill skill);
    Optional<StudentSkill> findByStudentIdAndSkillId(Long studentId, Long skillId);
    void deleteByStudentAndSkill(Student student, Skill skill);
}
