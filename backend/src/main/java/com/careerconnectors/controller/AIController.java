package com.careerconnectors.controller;

import com.careerconnectors.dto.common.ApiResponse;
import com.careerconnectors.dto.request.AIFeedbackRequest;
import com.careerconnectors.dto.response.*;
import com.careerconnectors.entity.Student;
import com.careerconnectors.exception.ResourceNotFoundException;
import com.careerconnectors.repository.StudentRepository;
import com.careerconnectors.security.UserPrincipal;
import com.careerconnectors.service.AIIntegrationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
@Tag(name = "AI Services", description = "AI-powered Semantic Matching, Recommendations, Skill Gap Analysis, and Applicant Ranking")
public class AIController {

    private final AIIntegrationService aiIntegrationService;
    private final StudentRepository studentRepository;

    @GetMapping("/matching/{opportunityId}")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Calculate AI Match score between current student and target opportunity")
    public ResponseEntity<ApiResponse<AIMatchScoreResponse>> getMatchScore(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long opportunityId) {
        Student student = studentRepository.findByUserId(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));
        AIMatchScoreResponse response = aiIntegrationService.getMatchScore(student.getId(), opportunityId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/recommendations")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Get AI-ranked personalized opportunity recommendations feed")
    public ResponseEntity<ApiResponse<AIRecommendationResponse>> getRecommendations(
            @AuthenticationPrincipal UserPrincipal principal) {
        Student student = studentRepository.findByUserId(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));
        AIRecommendationResponse response = aiIntegrationService.getRecommendations(student.getId());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/skill-gap/{opportunityId}")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Get AI Skill Gap analysis & tailored learning roadmap for target opportunity")
    public ResponseEntity<ApiResponse<SkillGapResponse>> getSkillGap(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long opportunityId) {
        Student student = studentRepository.findByUserId(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));
        SkillGapResponse response = aiIntegrationService.getSkillGapAnalysis(student.getId(), opportunityId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/applicant-ranking/{opportunityId}")
    @PreAuthorize("hasAnyRole('COMPANY', 'ADMIN')")
    @Operation(summary = "Get AI multidimensional applicant ranking with explainability badges")
    public ResponseEntity<ApiResponse<ApplicantRankResponse>> rankApplicants(
            @PathVariable Long opportunityId) {
        ApplicantRankResponse response = aiIntegrationService.rankApplicants(opportunityId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/career-suggestions")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Get AI career trajectory suggestions and recommended portfolio project ideas")
    public ResponseEntity<ApiResponse<CareerSuggestionResponse>> getCareerSuggestions(
            @AuthenticationPrincipal UserPrincipal principal) {
        Student student = studentRepository.findByUserId(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));
        CareerSuggestionResponse response = aiIntegrationService.getCareerSuggestions(student.getId());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/feedback")
    @Operation(summary = "Submit user feedback on AI matching / recommendation quality")
    public ResponseEntity<ApiResponse<AIFeedbackResponse>> submitFeedback(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody AIFeedbackRequest request) {
        AIFeedbackResponse response = aiIntegrationService.submitFeedback(principal, request);
        return ResponseEntity.ok(ApiResponse.success("Thank you for your feedback!", response));
    }
}
