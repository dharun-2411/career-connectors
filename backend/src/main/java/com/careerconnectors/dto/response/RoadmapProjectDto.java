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
public class RoadmapProjectDto {
    private String title;
    private String description;
    private String difficulty; // Beginner, Intermediate, Advanced
    private List<String> technologies;
    private String portfolioImpact;
}
