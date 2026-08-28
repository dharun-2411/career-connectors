package com.careerconnectors.controller;

import com.careerconnectors.dto.common.ApiResponse;
import com.careerconnectors.dto.common.PageResponse;
import com.careerconnectors.dto.response.OpportunityResponse;
import com.careerconnectors.enums.OpportunityStatus;
import com.careerconnectors.enums.OpportunityType;
import com.careerconnectors.security.UserPrincipal;
import com.careerconnectors.service.OpportunityService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/opportunities")
@RequiredArgsConstructor
@Tag(name = "Opportunities", description = "Public & authenticated opportunity browsing, searching, filtering and details")
public class OpportunityController {

    private final OpportunityService opportunityService;

    @GetMapping
    @Operation(summary = "Search and filter work opportunities with pagination")
    public ResponseEntity<ApiResponse<PageResponse<OpportunityResponse>>> getOpportunities(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) OpportunityType type,
            @RequestParam(required = false) Boolean isRemote,
            @RequestParam(required = false) OpportunityStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @AuthenticationPrincipal UserPrincipal principal) {

        PageResponse<OpportunityResponse> response = opportunityService.searchOpportunities(
                search, type, isRemote, status, page, size, sortBy, sortDir, principal);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get detailed information for a single opportunity")
    public ResponseEntity<ApiResponse<OpportunityResponse>> getOpportunityDetails(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        OpportunityResponse response = opportunityService.getOpportunityDetails(id, principal);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
