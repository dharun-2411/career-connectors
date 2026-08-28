package com.careerconnectors.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CareerSuggestionResponse {
    private Long studentId;
    private List<CareerPathDto> suggestedPaths;
    private List<ProjectIdeaDto> recommendedProjects;
    private List<String> trendingSkillsInMarket;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CareerPathDto {
        private String roleTitle;
        private String industry;
        private String readinessLevel; // High, Medium, Developing
        private String avgMarketDemand;
        private List<String> transferrableSkills;
        private List<String> recommendedNextSkills;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProjectIdeaDto {
        private String title;
        private String description;
        private String difficulty;
        private List<String> technologiesUsed;
        private String portfolioImpact;
    }
}
