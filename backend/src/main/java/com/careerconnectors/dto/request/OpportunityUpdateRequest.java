package com.careerconnectors.dto.request;

import com.careerconnectors.enums.ExperienceLevel;
import com.careerconnectors.enums.OpportunityStatus;
import com.careerconnectors.enums.OpportunityType;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OpportunityUpdateRequest {
    private String title;
    private String description;
    private OpportunityType type;
    private String location;
    private Boolean isRemote;
    private String stipend;
    private String duration;
    private ExperienceLevel experienceLevel;
    private OpportunityStatus status;
    private LocalDate deadline;
    @Valid
    private List<OpportunitySkillRequest> skills;
}
