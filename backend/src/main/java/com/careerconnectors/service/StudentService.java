package com.careerconnectors.service;

import com.careerconnectors.dto.request.SkillAddRequest;
import com.careerconnectors.dto.request.StudentProfileUpdateRequest;
import com.careerconnectors.dto.response.StudentProfileResponse;
import com.careerconnectors.dto.response.StudentSkillResponse;
import com.careerconnectors.entity.Skill;
import com.careerconnectors.entity.Student;
import com.careerconnectors.entity.StudentSkill;
import com.careerconnectors.enums.SkillProficiency;
import com.careerconnectors.enums.SkillSource;
import com.careerconnectors.exception.BadRequestException;
import com.careerconnectors.exception.ResourceNotFoundException;
import com.careerconnectors.repository.StudentRepository;
import com.careerconnectors.repository.StudentSkillRepository;
import com.careerconnectors.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final StudentRepository studentRepository;
    private final StudentSkillRepository studentSkillRepository;
    private final SkillService skillService;

    @Transactional(readOnly = true)
    public Student getStudentByUserId(Long userId) {
        return studentRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found for user ID: " + userId));
    }

    @Transactional(readOnly = true)
    public StudentProfileResponse getProfile(UserPrincipal principal) {
        Student student = getStudentByUserId(principal.getId());
        return mapToProfileResponse(student);
    }

    @Transactional(readOnly = true)
    public StudentProfileResponse getProfileById(Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + studentId));
        return mapToProfileResponse(student);
    }

    @Transactional
    public StudentProfileResponse updateProfile(UserPrincipal principal, StudentProfileUpdateRequest request) {
        Student student = getStudentByUserId(principal.getId());

        if (request.getName() != null) student.setName(request.getName());
        if (request.getPhone() != null) student.setPhone(request.getPhone());
        if (request.getDob() != null) student.setDob(request.getDob());
        if (request.getEducation() != null) student.setEducation(request.getEducation());
        if (request.getUniversity() != null) student.setUniversity(request.getUniversity());
        if (request.getGraduationYear() != null) student.setGraduationYear(request.getGraduationYear());
        if (request.getResumeUrl() != null) student.setResumeUrl(request.getResumeUrl());
        if (request.getBio() != null) student.setBio(request.getBio());
        if (request.getGithubUrl() != null) student.setGithubUrl(request.getGithubUrl());
        if (request.getLinkedinUrl() != null) student.setLinkedinUrl(request.getLinkedinUrl());
        if (request.getPortfolioUrl() != null) student.setPortfolioUrl(request.getPortfolioUrl());

        student = studentRepository.save(student);
        return mapToProfileResponse(student);
    }

    @Transactional(readOnly = true)
    public List<StudentSkillResponse> getStudentSkills(UserPrincipal principal) {
        Student student = getStudentByUserId(principal.getId());
        return studentSkillRepository.findByStudent(student).stream()
                .map(this::mapToSkillResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public StudentSkillResponse addSkill(UserPrincipal principal, SkillAddRequest request) {
        Student student = getStudentByUserId(principal.getId());
        Skill skill = skillService.getOrCreateSkill(request.getSkillName(), request.getCategory());

        Optional<StudentSkill> existing = studentSkillRepository.findByStudentAndSkill(student, skill);
        if (existing.isPresent()) {
            StudentSkill studentSkill = existing.get();
            studentSkill.setProficiencyLevel(request.getProficiencyLevel());
            studentSkill.setSource(request.getSource() != null ? request.getSource() : SkillSource.MANUAL);
            return mapToSkillResponse(studentSkillRepository.save(studentSkill));
        }

        StudentSkill studentSkill = StudentSkill.builder()
                .student(student)
                .skill(skill)
                .proficiencyLevel(request.getProficiencyLevel() != null ? request.getProficiencyLevel() : SkillProficiency.INTERMEDIATE)
                .source(request.getSource() != null ? request.getSource() : SkillSource.MANUAL)
                .isVerified(false)
                .build();

        return mapToSkillResponse(studentSkillRepository.save(studentSkill));
    }

    @Transactional
    public void removeSkill(UserPrincipal principal, Long skillId) {
        Student student = getStudentByUserId(principal.getId());
        StudentSkill studentSkill = studentSkillRepository.findByStudentIdAndSkillId(student.getId(), skillId)
                .orElseThrow(() -> new ResourceNotFoundException("Skill not found for student"));
        studentSkillRepository.delete(studentSkill);
    }

    @Transactional
    public StudentSkillResponse updateSkillProficiency(UserPrincipal principal, Long skillId, SkillProficiency proficiency) {
        Student student = getStudentByUserId(principal.getId());
        StudentSkill studentSkill = studentSkillRepository.findByStudentIdAndSkillId(student.getId(), skillId)
                .orElseThrow(() -> new ResourceNotFoundException("Skill not found for student"));
        studentSkill.setProficiencyLevel(proficiency);
        return mapToSkillResponse(studentSkillRepository.save(studentSkill));
    }

    public StudentProfileResponse mapToProfileResponse(Student student) {
        List<StudentSkillResponse> skills = student.getStudentSkills() != null
                ? student.getStudentSkills().stream().map(this::mapToSkillResponse).collect(Collectors.toList())
                : List.of();

        return StudentProfileResponse.builder()
                .id(student.getId())
                .userId(student.getUser().getId())
                .email(student.getUser().getEmail())
                .name(student.getName())
                .phone(student.getPhone())
                .dob(student.getDob())
                .education(student.getEducation())
                .university(student.getUniversity())
                .graduationYear(student.getGraduationYear())
                .resumeUrl(student.getResumeUrl())
                .bio(student.getBio())
                .githubUrl(student.getGithubUrl())
                .linkedinUrl(student.getLinkedinUrl())
                .portfolioUrl(student.getPortfolioUrl())
                .skills(skills)
                .createdAt(student.getCreatedAt())
                .updatedAt(student.getUpdatedAt())
                .build();
    }

    public StudentSkillResponse mapToSkillResponse(StudentSkill ss) {
        return StudentSkillResponse.builder()
                .id(ss.getId())
                .skillId(ss.getSkill().getId())
                .skillName(ss.getSkill().getName())
                .category(ss.getSkill().getCategory())
                .proficiencyLevel(ss.getProficiencyLevel())
                .source(ss.getSource())
                .isVerified(ss.getIsVerified())
                .build();
    }
}
