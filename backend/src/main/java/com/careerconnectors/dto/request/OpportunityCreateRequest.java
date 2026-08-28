package com.careerconnectors.dto.request;

import com.careerconnectors.enums.ExperienceLevel;
import com.careerconnectors.enums.OpportunityType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OpportunityCreateRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Opportunity type is required")
    private OpportunityType type;

    @NotBlank(message = "Location is required")
    private String location;

    @Builder.Default
    private Boolean isRemote = false;

    private String stipend;
    private String duration;

    @Builder.Default
    private ExperienceLevel experienceLevel = ExperienceLevel.ENTRY_LEVEL;

    private LocalDate deadline;

    @NotEmpty(message = "At least one required skill must be specified")
    @Valid
    @Builder.Default
    private List<OpportunitySkillRequest> skills = new ArrayList<>();
}
