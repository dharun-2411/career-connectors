package com.careerconnectors.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoadmapPhaseDto {
    private String phaseId;
    private Integer orderIndex;
    private String title;
    private String duration;
    private String description;
    private List<String> topics;
    private List<RoadmapResourceDto> resources;
    private List<RoadmapProjectDto> suggestedProjects;
    private List<String> milestones;
}
