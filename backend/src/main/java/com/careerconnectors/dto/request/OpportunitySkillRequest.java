package com.careerconnectors.dto.request;

import com.careerconnectors.enums.SkillProficiency;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OpportunitySkillRequest {

    private Long skillId;

    @NotBlank(message = "Skill name is required")
    private String skillName;

    @DecimalMin(value = "0.1", message = "Weightage must be at least 0.1")
    @DecimalMax(value = "10.0", message = "Weightage cannot exceed 10.0")
    @Builder.Default
    private BigDecimal weightage = BigDecimal.valueOf(1.0);

    @NotNull(message = "Required proficiency is required")
    @Builder.Default
    private SkillProficiency requiredProficiency = SkillProficiency.INTERMEDIATE;
}
