package com.careerconnectors.controller;

import com.careerconnectors.dto.common.ApiResponse;
import com.careerconnectors.dto.common.PageResponse;
import com.careerconnectors.dto.request.CompanyProfileUpdateRequest;
import com.careerconnectors.dto.request.OpportunityCreateRequest;
import com.careerconnectors.dto.request.OpportunityUpdateRequest;
import com.careerconnectors.dto.response.CompanyProfileResponse;
import com.careerconnectors.dto.response.OpportunityResponse;
import com.careerconnectors.security.UserPrincipal;
import com.careerconnectors.service.CompanyService;
import com.careerconnectors.service.OpportunityService;
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
@RequestMapping("/api/v1/company")
@RequiredArgsConstructor
@PreAuthorize("hasRole('COMPANY')")
@Tag(name = "Company", description = "Company recruiter profile, opportunity management, and applicant pipeline endpoints")
public class CompanyController {

    private final CompanyService companyService;
    private final OpportunityService opportunityService;

    @GetMapping("/profile")
    @Operation(summary = "Get current company profile")
    public ResponseEntity<ApiResponse<CompanyProfileResponse>> getProfile(@AuthenticationPrincipal UserPrincipal principal) {
        CompanyProfileResponse profile = companyService.getProfile(principal);
        return ResponseEntity.ok(ApiResponse.success(profile));
    }

    @PutMapping("/profile")
    @Operation(summary = "Update current company profile")
    public ResponseEntity<ApiResponse<CompanyProfileResponse>> updateProfile(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CompanyProfileUpdateRequest request) {
        CompanyProfileResponse profile = companyService.updateProfile(principal, request);
        return ResponseEntity.ok(ApiResponse.success("Company profile updated successfully", profile));
    }

    @PostMapping("/opportunities")
    @Operation(summary = "Post a new work opportunity (Internship/Job/Project)")
    public ResponseEntity<ApiResponse<OpportunityResponse>> createOpportunity(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody OpportunityCreateRequest request) {
        OpportunityResponse response = opportunityService.createOpportunity(principal, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Opportunity posted successfully", response));
    }

    @GetMapping("/opportunities")
    @Operation(summary = "Get opportunities posted by current company")
    public ResponseEntity<ApiResponse<PageResponse<OpportunityResponse>>> getMyOpportunities(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PageResponse<OpportunityResponse> response = opportunityService.getCompanyOpportunities(principal, page, size);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/opportunities/{id}")
    @Operation(summary = "Update a posted opportunity")
    public ResponseEntity<ApiResponse<OpportunityResponse>> updateOpportunity(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody OpportunityUpdateRequest request) {
        OpportunityResponse response = opportunityService.updateOpportunity(principal, id, request);
        return ResponseEntity.ok(ApiResponse.success("Opportunity updated successfully", response));
    }

    @DeleteMapping("/opportunities/{id}")
    @Operation(summary = "Delete an opportunity")
    public ResponseEntity<ApiResponse<String>> deleteOpportunity(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        opportunityService.deleteOpportunity(principal, id);
        return ResponseEntity.ok(ApiResponse.success("Opportunity deleted successfully", null));
    }
}
