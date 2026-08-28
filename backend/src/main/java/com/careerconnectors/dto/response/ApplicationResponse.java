package com.careerconnectors.dto.response;

import com.careerconnectors.enums.ApplicationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationResponse {
    private Long id;
    private Long studentId;
    private String studentName;
    private String studentEmail;
    private String studentUniversity;
    private String studentEducation;
    private String studentResumeUrl;
    private String resumeUrl;
    private Long opportunityId;
    private String opportunityTitle;
    private String companyName;
    private String companyLogoUrl;
    private ApplicationStatus status;
    private BigDecimal matchScore;
    private String coverLetter;
    private LocalDateTime appliedAt;
    private LocalDateTime updatedAt;
}
