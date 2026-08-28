package com.careerconnectors.controller;

import com.careerconnectors.dto.common.ApiResponse;
import com.careerconnectors.dto.request.SaveRoadmapRequest;
import com.careerconnectors.dto.request.UpdateProgressRequest;
import com.careerconnectors.dto.response.RoadmapResponseDto;
import com.careerconnectors.dto.response.SavedRoadmapDto;
import com.careerconnectors.dto.response.TrendingDomainDto;
import com.careerconnectors.security.UserPrincipal;
import com.careerconnectors.service.RoadmapService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/roadmap")
@RequiredArgsConstructor
@Tag(name = "AI Career Roadmaps", description = "Endpoints for AI-generated preparation roadmaps, trending domains, and progress tracking")
public class RoadmapController {

    private final RoadmapService roadmapService;

    @GetMapping("/trending-domains")
    @Operation(summary = "Get list of curated and trending domains")
    public ResponseEntity<ApiResponse<List<TrendingDomainDto>>> getTrendingDomains() {
        List<TrendingDomainDto> domains = roadmapService.getTrendingDomains();
        return ResponseEntity.ok(ApiResponse.success("Trending domains retrieved successfully", domains));
    }

    @GetMapping("/search")
    @Operation(summary = "Search or generate an AI career roadmap for a domain")
    public ResponseEntity<ApiResponse<RoadmapResponseDto>> searchRoadmap(
            @RequestParam String domain,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        RoadmapResponseDto roadmap = roadmapService.searchRoadmap(domain, userPrincipal);
        return ResponseEntity.ok(ApiResponse.success("Career roadmap retrieved successfully", roadmap));
    }

    @PostMapping("/save")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Bookmark/save a career roadmap to student profile")
    public ResponseEntity<ApiResponse<SavedRoadmapDto>> saveRoadmap(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody SaveRoadmapRequest request) {
        SavedRoadmapDto saved = roadmapService.saveRoadmap(userPrincipal, request);
        return ResponseEntity.ok(ApiResponse.success("Roadmap saved to profile successfully", saved));
    }

    @GetMapping("/saved")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Get student's saved career roadmaps and progress")
    public ResponseEntity<ApiResponse<List<SavedRoadmapDto>>> getSavedRoadmaps(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<SavedRoadmapDto> savedList = roadmapService.getSavedRoadmaps(userPrincipal);
        return ResponseEntity.ok(ApiResponse.success("Saved roadmaps retrieved successfully", savedList));
    }

    @PatchMapping("/saved/{id}/progress")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Update completed roadmap steps and milestone progress")
    public ResponseEntity<ApiResponse<SavedRoadmapDto>> updateProgress(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id,
            @Valid @RequestBody UpdateProgressRequest request) {
        SavedRoadmapDto updated = roadmapService.updateProgress(userPrincipal, id, request);
        return ResponseEntity.ok(ApiResponse.success("Roadmap progress updated successfully", updated));
    }
}
