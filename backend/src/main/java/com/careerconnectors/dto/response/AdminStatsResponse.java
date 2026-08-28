package com.careerconnectors.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminStatsResponse {
    private long totalStudents;
    private long totalCompanies;
    private long pendingCompanyVerifications;
    private long totalOpportunities;
    private long activeOpportunities;
    private long totalApplications;
    private long selectedApplications;
    private BigDecimal averageMatchScore;
    private Map<String, Long> applicationsByStatus;
    private Map<String, Long> opportunitiesByType;
    private Map<String, Long> topSkillsDemand;
}
