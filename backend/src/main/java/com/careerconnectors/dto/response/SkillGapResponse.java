package com.careerconnectors.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SkillGapResponse {
    private Long studentId;
    private Long opportunityId;
    private String opportunityTitle;
    private String companyName;
    private BigDecimal matchPercentage;
    private List<MissingSkillDto> missingSkills;
    private List<LearningResourceDto> learningRoadmap;
    private String summary;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MissingSkillDto {
        private String skillName;
        private String category;
        private String requiredProficiency;
        private String currentProficiency; // null if student doesn't have it
        private BigDecimal weightage;
        private String priority; // HIGH, MEDIUM, LOW
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LearningResourceDto {
        private String skill;
        private String title;
        private String type; // Course, Project, Tutorial, Documentation
        private String estimatedTimeToLearn;
        private String difficulty;
        private String resourceUrl;
    }
}
