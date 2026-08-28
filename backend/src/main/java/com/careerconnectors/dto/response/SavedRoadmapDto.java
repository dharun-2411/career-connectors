package com.careerconnectors.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SavedRoadmapDto {
    private Long id; // StudentSavedRoadmap ID
    private Long roadmapId;
    private String domainName;
    private String overview;
    private String totalDuration;
    private String progressJson;
    private Integer completedStepsCount;
    private Integer totalStepsCount;
    private Integer progressPercentage;
    private LocalDateTime savedAt;
    private LocalDateTime lastAccessedAt;
    private RoadmapResponseDto roadmapDetails;
}
