package com.careerconnectors.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AIMatchScoreResponse {
    private Long studentId;
    private Long opportunityId;
    private BigDecimal overallScore; // 0 - 100
    private BigDecimal semanticScore;
    private BigDecimal skillProficiencyScore;
    private List<String> matchingSkills;
    private List<String> missingSkills;
    private String explanation;
    private Map<String, Object> breakdown;
}
