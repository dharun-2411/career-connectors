package com.careerconnectors.dto.response;

import com.careerconnectors.enums.ExperienceLevel;
import com.careerconnectors.enums.OpportunityStatus;
import com.careerconnectors.enums.OpportunityType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OpportunityResponse {
    private Long id;
    private Long companyId;
    private String companyName;
    private String companyLogoUrl;
    private String companyLocation;
    private String title;
    private String description;
    private OpportunityType type;
    private String location;
    private Boolean isRemote;
    private String stipend;
    private String duration;
    private ExperienceLevel experienceLevel;
    private OpportunityStatus status;
    private LocalDate deadline;
    @Builder.Default
    private List<OpportunitySkillResponse> requiredSkills = new ArrayList<>();
    @Builder.Default
    private List<ApplicantSummaryDto> recentApplicants = new ArrayList<>();
    private int applicantCount;
    private BigDecimal matchScore; // Calculated match score for the authenticated student
    private Boolean hasApplied;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
