package com.careerconnectors.dto.request;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class StudentProfileUpdateRequest {
    private String name;
    private String phone;
    private LocalDate dob;
    private String education;
    private String university;
    private Integer graduationYear;
    private String resumeUrl;
    private String resumeFileName;
    private String bio;
    private String githubUrl;
    private String linkedinUrl;
    private String portfolioUrl;
}
