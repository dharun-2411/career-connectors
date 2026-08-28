package com.careerconnectors.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoadmapResourceDto {
    private String name;
    private String type; // Course, Documentation, Book, Practice Platform, Video Series
    private String url;
    private String description;
}
