package com.careerconnectors.service;

import com.careerconnectors.dto.response.SkillResponse;
import com.careerconnectors.entity.Skill;
import com.careerconnectors.repository.SkillRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SkillService {

    private final SkillRepository skillRepository;

    @Transactional(readOnly = true)
    public List<SkillResponse> getAllSkills() {
        return skillRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<SkillResponse> searchSkills(String query) {
        if (query == null || query.trim().isEmpty()) {
            return getAllSkills();
        }
        return skillRepository.findByNameContainingIgnoreCase(query.trim()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public Skill getOrCreateSkill(String skillName, String category) {
        return skillRepository.findByNameIgnoreCase(skillName.trim())
                .orElseGet(() -> skillRepository.save(
                        Skill.builder()
                                .name(skillName.trim())
                                .category(category != null ? category.trim() : "General")
                                .build()
                ));
    }

    private SkillResponse mapToResponse(Skill skill) {
        return SkillResponse.builder()
                .id(skill.getId())
                .name(skill.getName())
                .category(skill.getCategory())
                .build();
    }
}
