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
public class ApplicantRankResponse {
    private Long opportunityId;
    private int totalApplicants;
    private List<RankedApplicantDto> rankedApplicants;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RankedApplicantDto {
        private Long applicationId;
        private Long studentId;
        private String studentName;
        private String email;
        private String university;
        private String resumeUrl;
        private int rank;
        private BigDecimal compositeScore;
        private BigDecimal skillMatchScore;
        private BigDecimal experienceRelevanceScore;
        private List<String> topMatchingSkills;
        private List<String> potentialGaps;
        private String aiRecommendationSummary;
        private String status;
    }
}
