package com.careerconnectors.service;

import com.careerconnectors.dto.request.SaveRoadmapRequest;
import com.careerconnectors.dto.request.UpdateProgressRequest;
import com.careerconnectors.dto.response.*;
import com.careerconnectors.entity.*;
import com.careerconnectors.exception.BadRequestException;
import com.careerconnectors.exception.ResourceNotFoundException;
import com.careerconnectors.repository.*;
import com.careerconnectors.security.UserPrincipal;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoadmapService {

    private static final Logger logger = LoggerFactory.getLogger(RoadmapService.class);
    private static final int CACHE_VALIDITY_DAYS = 30;

    private final TrendingDomainRepository trendingDomainRepository;
    private final CareerRoadmapRepository careerRoadmapRepository;
    private final StudentSavedRoadmapRepository studentSavedRoadmapRepository;
    private final StudentRepository studentRepository;
    private final AIIntegrationService aiIntegrationService;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public List<TrendingDomainDto> getTrendingDomains() {
        return trendingDomainRepository.findByIsActiveTrueOrderByDisplayOrderAsc()
                .stream()
                .map(this::mapToTrendingDomainDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public RoadmapResponseDto searchRoadmap(String domain, UserPrincipal userPrincipal) {
        if (domain == null || domain.trim().length() < 2) {
            throw new BadRequestException("Domain search query must be at least 2 characters");
        }

        String cleanDomain = domain.trim();
        LocalDateTime cacheThreshold = LocalDateTime.now().minusDays(CACHE_VALIDITY_DAYS);

        // 1. Check if a fresh roadmap exists in cache
        Optional<CareerRoadmap> cachedOpt = careerRoadmapRepository.findFreshByDomainNameIgnoreCase(cleanDomain, cacheThreshold);
        CareerRoadmap roadmapEntity;

        Long studentId = null;
        if (userPrincipal != null) {
            Optional<Student> studentOpt = studentRepository.findByUserId(userPrincipal.getId());
            if (studentOpt.isPresent()) {
                studentId = studentOpt.get().getId();
            }
        }

        if (cachedOpt.isPresent()) {
            roadmapEntity = cachedOpt.get();
        } else {
            // 2. Generate new roadmap via AI Integration Service
            RoadmapResponseDto aiGenerated = aiIntegrationService.generateRoadmap(cleanDomain, studentId);

            String jsonPayload;
            try {
                jsonPayload = objectMapper.writeValueAsString(aiGenerated);
            } catch (JsonProcessingException e) {
                logger.error("Failed to serialize roadmap to JSON", e);
                jsonPayload = "{}";
            }

            roadmapEntity = CareerRoadmap.builder()
                    .domainName(aiGenerated.getDomainName() != null ? aiGenerated.getDomainName() : cleanDomain)
                    .overview(aiGenerated.getOverview() != null ? aiGenerated.getOverview() : "")
                    .totalDuration(aiGenerated.getTotalDuration() != null ? aiGenerated.getTotalDuration() : "4-6 Months")
                    .roadmapJson(jsonPayload)
                    .generatedBy("AI")
                    .version("1.0")
                    .build();

            roadmapEntity = careerRoadmapRepository.save(roadmapEntity);
        }

        // 3. Reconstruct response DTO
        RoadmapResponseDto responseDto = deserializeRoadmap(roadmapEntity.getRoadmapJson(), roadmapEntity.getDomainName());
        responseDto.setId(roadmapEntity.getId());
        responseDto.setGeneratedAt(roadmapEntity.getGeneratedAt().toString());

        // 4. Attach saved status and progress if student is logged in
        if (studentId != null) {
            Optional<StudentSavedRoadmap> savedOpt = studentSavedRoadmapRepository
                    .findByStudentIdAndRoadmapId(studentId, roadmapEntity.getId());
            if (savedOpt.isPresent()) {
                responseDto.setIsSaved(true);
                responseDto.setProgressJson(savedOpt.get().getProgressJson());
            } else {
                responseDto.setIsSaved(false);
                responseDto.setProgressJson("{}");
            }
        } else {
            responseDto.setIsSaved(false);
            responseDto.setProgressJson("{}");
        }

        return responseDto;
    }

    @Transactional
    public SavedRoadmapDto saveRoadmap(UserPrincipal userPrincipal, SaveRoadmapRequest request) {
        Student student = studentRepository.findByUserId(userPrincipal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));

        CareerRoadmap roadmap = careerRoadmapRepository.findById(request.getRoadmapId())
                .orElseThrow(() -> new ResourceNotFoundException("Career Roadmap not found with id: " + request.getRoadmapId()));

        Optional<StudentSavedRoadmap> existingOpt = studentSavedRoadmapRepository
                .findByStudentIdAndRoadmapId(student.getId(), roadmap.getId());

        StudentSavedRoadmap savedEntity;
        if (existingOpt.isPresent()) {
            savedEntity = existingOpt.get();
            savedEntity.setLastAccessedAt(LocalDateTime.now());
            if (request.getInitialProgressJson() != null) {
                savedEntity.setProgressJson(request.getInitialProgressJson());
            }
        } else {
            savedEntity = StudentSavedRoadmap.builder()
                    .student(student)
                    .roadmap(roadmap)
                    .progressJson(request.getInitialProgressJson() != null ? request.getInitialProgressJson() : "{}")
                    .savedAt(LocalDateTime.now())
                    .lastAccessedAt(LocalDateTime.now())
                    .build();
        }

        savedEntity = studentSavedRoadmapRepository.save(savedEntity);
        return mapToSavedRoadmapDto(savedEntity, true);
    }

    @Transactional(readOnly = true)
    public List<SavedRoadmapDto> getSavedRoadmaps(UserPrincipal userPrincipal) {
        Student student = studentRepository.findByUserId(userPrincipal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));

        return studentSavedRoadmapRepository.findByStudentIdWithRoadmap(student.getId())
                .stream()
                .map(s -> mapToSavedRoadmapDto(s, false))
                .collect(Collectors.toList());
    }

    @Transactional
    public SavedRoadmapDto updateProgress(UserPrincipal userPrincipal, Long savedId, UpdateProgressRequest request) {
        Student student = studentRepository.findByUserId(userPrincipal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));

        StudentSavedRoadmap saved = studentSavedRoadmapRepository.findById(savedId)
                .orElseThrow(() -> new ResourceNotFoundException("Saved roadmap not found with id: " + savedId));

        if (!saved.getStudent().getId().equals(student.getId())) {
            throw new BadRequestException("You are not authorized to update this roadmap progress");
        }

        saved.setProgressJson(request.getProgressJson());
        saved.setLastAccessedAt(LocalDateTime.now());
        saved = studentSavedRoadmapRepository.save(saved);

        return mapToSavedRoadmapDto(saved, true);
    }

    private TrendingDomainDto mapToTrendingDomainDto(TrendingDomain entity) {
        return TrendingDomainDto.builder()
                .id(entity.getId())
                .domainName(entity.getDomainName())
                .description(entity.getDescription())
                .category(entity.getCategory())
                .popularityTag(entity.getPopularityTag())
                .iconName(entity.getIconName())
                .displayOrder(entity.getDisplayOrder())
                .build();
    }

    private SavedRoadmapDto mapToSavedRoadmapDto(StudentSavedRoadmap entity, boolean includeFullDetails) {
        CareerRoadmap roadmap = entity.getRoadmap();
        RoadmapResponseDto details = deserializeRoadmap(roadmap.getRoadmapJson(), roadmap.getDomainName());
        details.setId(roadmap.getId());
        details.setIsSaved(true);
        details.setProgressJson(entity.getProgressJson());

        int totalSteps = 0;
        if (details.getPhases() != null) {
            for (RoadmapPhaseDto phase : details.getPhases()) {
                totalSteps += (phase.getMilestones() != null ? phase.getMilestones().size() : 1);
            }
        }
        if (totalSteps == 0) totalSteps = 6;

        int completedSteps = 0;
        try {
            Map<String, Object> progressMap = objectMapper.readValue(
                    entity.getProgressJson() != null ? entity.getProgressJson() : "{}",
                    new TypeReference<Map<String, Object>>() {}
            );
            for (Object val : progressMap.values()) {
                if (Boolean.TRUE.equals(val) || "completed".equalsIgnoreCase(String.valueOf(val))) {
                    completedSteps++;
                }
            }
        } catch (Exception e) {
            logger.debug("Failed to parse progress JSON", e);
        }

        int percentage = Math.min(100, Math.round(((float) completedSteps / (float) totalSteps) * 100));

        return SavedRoadmapDto.builder()
                .id(entity.getId())
                .roadmapId(roadmap.getId())
                .domainName(roadmap.getDomainName())
                .overview(roadmap.getOverview())
                .totalDuration(roadmap.getTotalDuration())
                .progressJson(entity.getProgressJson())
                .completedStepsCount(completedSteps)
                .totalStepsCount(totalSteps)
                .progressPercentage(percentage)
                .savedAt(entity.getSavedAt())
                .lastAccessedAt(entity.getLastAccessedAt())
                .roadmapDetails(includeFullDetails ? details : null)
                .build();
    }

    private RoadmapResponseDto deserializeRoadmap(String json, String domainFallback) {
        try {
            return objectMapper.readValue(json, RoadmapResponseDto.class);
        } catch (Exception e) {
            logger.error("Failed to parse cached roadmap JSON for domain: " + domainFallback, e);
            return aiIntegrationService.generateRoadmap(domainFallback, null);
        }
    }
}
