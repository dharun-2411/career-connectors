package com.careerconnectors.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoadmapResponseDto {
    private Long id; // DB cached roadmap ID
    private String domainName;
    private String overview;
    private String totalDuration;
    private String industryDemandSummary;
    private List<RoadmapPhaseDto> phases;
    private List<String> coreTechnologies;
    private List<String> recommendedCertifications;
    private List<RoadmapProjectDto> capstoneProjects;
    private List<String> adjacentDomains;
    private String generatedAt;
    private Boolean isSaved;
    private String progressJson;
}
