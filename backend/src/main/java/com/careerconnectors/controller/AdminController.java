package com.careerconnectors.controller;

import com.careerconnectors.dto.common.ApiResponse;
import com.careerconnectors.dto.common.PageResponse;
import com.careerconnectors.dto.request.CompanyVerificationRequest;
import com.careerconnectors.dto.response.AdminStatsResponse;
import com.careerconnectors.dto.response.CompanyProfileResponse;
import com.careerconnectors.dto.response.OpportunityResponse;
import com.careerconnectors.dto.response.StudentProfileResponse;
import com.careerconnectors.enums.UserStatus;
import com.careerconnectors.service.AdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin", description = "Admin platform-wide metrics, student/company management, and verification queue")
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/stats")
    @Operation(summary = "Get platform overview and analytics statistics")
    public ResponseEntity<ApiResponse<AdminStatsResponse>> getPlatformStats() {
        AdminStatsResponse stats = adminService.getPlatformStats();
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    @GetMapping("/students")
    @Operation(summary = "Get all student profiles with pagination and search")
    public ResponseEntity<ApiResponse<PageResponse<StudentProfileResponse>>> getAllStudents(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PageResponse<StudentProfileResponse> response = adminService.getAllStudents(search, page, size);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PatchMapping("/users/{userId}/status")
    @Operation(summary = "Update user account status (ACTIVE, SUSPENDED)")
    public ResponseEntity<ApiResponse<String>> updateUserStatus(
            @PathVariable Long userId,
            @RequestParam UserStatus status) {
        adminService.updateUserStatus(userId, status);
        return ResponseEntity.ok(ApiResponse.success("User status updated to " + status, null));
    }

    @DeleteMapping("/users/{userId}")
    @Operation(summary = "Delete user account")
    public ResponseEntity<ApiResponse<String>> deleteUser(@PathVariable Long userId) {
        adminService.deleteUser(userId);
        return ResponseEntity.ok(ApiResponse.success("User deleted successfully", null));
    }

    @GetMapping("/companies")
    @Operation(summary = "Get all companies with pagination and search")
    public ResponseEntity<ApiResponse<PageResponse<CompanyProfileResponse>>> getAllCompanies(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PageResponse<CompanyProfileResponse> response = adminService.getAllCompanies(search, page, size);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PatchMapping("/companies/{companyId}/verify")
    @Operation(summary = "Verify or reject company registration")
    public ResponseEntity<ApiResponse<CompanyProfileResponse>> verifyCompany(
            @PathVariable Long companyId,
            @Valid @RequestBody CompanyVerificationRequest request) {
        CompanyProfileResponse response = adminService.verifyCompany(companyId, request);
        return ResponseEntity.ok(ApiResponse.success("Company verification updated", response));
    }

    @GetMapping("/opportunities")
    @Operation(summary = "Get all opportunities on platform for moderation")
    public ResponseEntity<ApiResponse<PageResponse<OpportunityResponse>>> getAllOpportunities(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PageResponse<OpportunityResponse> response = adminService.getAllOpportunities(page, size);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @DeleteMapping("/opportunities/{opportunityId}")
    @Operation(summary = "Moderate and remove an opportunity")
    public ResponseEntity<ApiResponse<String>> deleteOpportunity(@PathVariable Long opportunityId) {
        adminService.deleteOpportunity(opportunityId);
        return ResponseEntity.ok(ApiResponse.success("Opportunity removed successfully", null));
    }
}
