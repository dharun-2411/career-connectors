package com.careerconnectors.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentProfileResponse {
    private Long id;
    private Long userId;
    private String email;
    private String name;
    private String phone;
    private LocalDate dob;
    private String education;
    private String university;
    private Integer graduationYear;
    private String resumeUrl;
    private String bio;
    private String githubUrl;
    private String linkedinUrl;
    private String portfolioUrl;
    @Builder.Default
    private List<StudentSkillResponse> skills = new ArrayList<>();
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
