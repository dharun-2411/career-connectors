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
public class AIRecommendationResponse {
    private Long studentId;
    private List<RecommendedOpportunityDto> recommendations;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecommendedOpportunityDto {
        private OpportunityResponse opportunity;
        private BigDecimal matchScore;
        private String matchReason;
        private List<String> keyStrengths;
        private String careerTrajectoryFit;
    }
}
