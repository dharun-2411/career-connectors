package com.careerconnectors.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SaveRoadmapRequest {
    @NotNull(message = "Roadmap ID is required")
    private Long roadmapId;

    private String initialProgressJson;
}
