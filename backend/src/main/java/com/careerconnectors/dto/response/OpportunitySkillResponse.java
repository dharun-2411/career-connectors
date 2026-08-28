package com.careerconnectors.dto.response;

import com.careerconnectors.enums.SkillProficiency;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OpportunitySkillResponse {
    private Long id;
    private Long skillId;
    private String skillName;
    private String category;
    private BigDecimal weightage;
    private SkillProficiency requiredProficiency;
}
