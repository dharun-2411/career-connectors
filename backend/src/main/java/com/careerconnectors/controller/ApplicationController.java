package com.careerconnectors.controller;

import com.careerconnectors.dto.common.ApiResponse;
import com.careerconnectors.dto.common.PageResponse;
import com.careerconnectors.dto.request.ApplicationRequest;
import com.careerconnectors.dto.request.ApplicationStatusUpdateRequest;
import com.careerconnectors.dto.response.ApplicationResponse;
import com.careerconnectors.security.UserPrincipal;
import com.careerconnectors.service.ApplicationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/applications")
@RequiredArgsConstructor
@Tag(name = "Applications", description = "Student application submissions, tracker, and company status updates")
public class ApplicationController {

    private final ApplicationService applicationService;

    @PostMapping
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Apply for an opportunity")
    public ResponseEntity<ApiResponse<ApplicationResponse>> applyForOpportunity(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ApplicationRequest request) {
        ApplicationResponse response = applicationService.applyForOpportunity(principal, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Application submitted successfully", response));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Get all applications submitted by the current student")
    public ResponseEntity<ApiResponse<PageResponse<ApplicationResponse>>> getMyApplications(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PageResponse<ApplicationResponse> response = applicationService.getStudentApplications(principal, page, size);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/opportunity/{opportunityId}")
    @PreAuthorize("hasAnyRole('COMPANY', 'ADMIN')")
    @Operation(summary = "Get applicants for a specific opportunity")
    public ResponseEntity<ApiResponse<PageResponse<ApplicationResponse>>> getOpportunityApplicants(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long opportunityId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "matchScore") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        PageResponse<ApplicationResponse> response = applicationService.getOpportunityApplications(
                principal, opportunityId, page, size, sortBy, sortDir);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/company")
    @PreAuthorize("hasRole('COMPANY')")
    @Operation(summary = "Get all applications across all postings for current company")
    public ResponseEntity<ApiResponse<PageResponse<ApplicationResponse>>> getAllCompanyApplicants(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PageResponse<ApplicationResponse> response = applicationService.getAllCompanyApplications(principal, page, size);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PatchMapping("/{applicationId}/status")
    @PreAuthorize("hasAnyRole('COMPANY', 'ADMIN')")
    @Operation(summary = "Update applicant status (Under Review, Shortlisted, Selected, Rejected)")
    public ResponseEntity<ApiResponse<ApplicationResponse>> updateApplicationStatus(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long applicationId,
            @Valid @RequestBody ApplicationStatusUpdateRequest request) {
        ApplicationResponse response = applicationService.updateApplicationStatus(principal, applicationId, request);
        return ResponseEntity.ok(ApiResponse.success("Applicant status updated to " + request.getStatus(), response));
    }
}
