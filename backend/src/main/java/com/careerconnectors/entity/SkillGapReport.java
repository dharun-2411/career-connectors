package com.careerconnectors.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "skill_gap_reports")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SkillGapReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "opportunity_id", nullable = false)
    private Opportunity opportunity;

    @Column(name = "match_percentage", nullable = false, precision = 5, scale = 2)
    private BigDecimal matchPercentage;

    @Column(name = "missing_skills", columnDefinition = "TEXT")
    private String missingSkills; // JSON representation of missing skills

    @Column(name = "suggested_resources", columnDefinition = "TEXT")
    private String suggestedResources; // JSON representation of learning path

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
