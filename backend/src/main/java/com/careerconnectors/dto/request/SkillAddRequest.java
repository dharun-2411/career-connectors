package com.careerconnectors.dto.request;

import com.careerconnectors.enums.SkillProficiency;
import com.careerconnectors.enums.SkillSource;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SkillAddRequest {

    private Long skillId;

    @NotBlank(message = "Skill name is required")
    private String skillName;

    private String category;

    @NotNull(message = "Proficiency level is required")
    @Builder.Default
    private SkillProficiency proficiencyLevel = SkillProficiency.INTERMEDIATE;

    @Builder.Default
    private SkillSource source = SkillSource.MANUAL;
}
