package com.careerconnectors.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "student_saved_roadmaps", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"student_id", "roadmap_id"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentSavedRoadmap {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "roadmap_id", nullable = false)
    private CareerRoadmap roadmap;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime savedAt = LocalDateTime.now();

    @Column(columnDefinition = "TEXT")
    @Builder.Default
    private String progressJson = "{}";

    @Builder.Default
    private LocalDateTime lastAccessedAt = LocalDateTime.now();

    @PreUpdate
    protected void onUpdate() {
        this.lastAccessedAt = LocalDateTime.now();
    }
}
