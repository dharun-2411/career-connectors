package com.careerconnectors.entity;

import com.careerconnectors.enums.SkillProficiency;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "opportunity_skills", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"opportunity_id", "skill_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OpportunitySkill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "opportunity_id", nullable = false)
    private Opportunity opportunity;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "skill_id", nullable = false)
    private Skill skill;

    @Column(nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal weightage = BigDecimal.valueOf(1.0);

    @Enumerated(EnumType.STRING)
    @Column(name = "required_proficiency", nullable = false)
    @Builder.Default
    private SkillProficiency requiredProficiency = SkillProficiency.INTERMEDIATE;
}
