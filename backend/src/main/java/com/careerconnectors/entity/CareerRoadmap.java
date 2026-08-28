package com.careerconnectors.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "career_roadmaps")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CareerRoadmap {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String domainName;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String overview;

    @Column(nullable = false, length = 100)
    private String totalDuration;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String roadmapJson;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime generatedAt = LocalDateTime.now();

    @Column(length = 50)
    @Builder.Default
    private String generatedBy = "AI";

    @Column(length = 20)
    @Builder.Default
    private String version = "1.0";
}
