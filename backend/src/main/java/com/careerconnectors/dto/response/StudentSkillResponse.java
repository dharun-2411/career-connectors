package com.careerconnectors.dto.response;

import com.careerconnectors.enums.SkillProficiency;
import com.careerconnectors.enums.SkillSource;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentSkillResponse {
    private Long id;
    private Long skillId;
    private String skillName;
    private String category;
    private SkillProficiency proficiencyLevel;
    private SkillSource source;
    private Boolean isVerified;
}
