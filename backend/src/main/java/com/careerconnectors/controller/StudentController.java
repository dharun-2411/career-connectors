package com.careerconnectors.controller;

import com.careerconnectors.dto.common.ApiResponse;
import com.careerconnectors.dto.request.SkillAddRequest;
import com.careerconnectors.dto.request.StudentProfileUpdateRequest;
import com.careerconnectors.dto.response.StudentProfileResponse;
import com.careerconnectors.dto.response.StudentSkillResponse;
import com.careerconnectors.enums.SkillProficiency;
import com.careerconnectors.security.UserPrincipal;
import com.careerconnectors.service.StudentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/student")
@RequiredArgsConstructor
@PreAuthorize("hasRole('STUDENT')")
@Tag(name = "Student", description = "Student profile and skills management endpoints")
public class StudentController {

    private final StudentService studentService;

    @GetMapping("/profile")
    @Operation(summary = "Get current student profile")
    public ResponseEntity<ApiResponse<StudentProfileResponse>> getProfile(@AuthenticationPrincipal UserPrincipal principal) {
        StudentProfileResponse profile = studentService.getProfile(principal);
        return ResponseEntity.ok(ApiResponse.success(profile));
    }

    @PutMapping("/profile")
    @Operation(summary = "Update current student profile")
    public ResponseEntity<ApiResponse<StudentProfileResponse>> updateProfile(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody StudentProfileUpdateRequest request) {
        StudentProfileResponse profile = studentService.updateProfile(principal, request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", profile));
    }

    @GetMapping("/skills")
    @Operation(summary = "Get current student skills")
    public ResponseEntity<ApiResponse<List<StudentSkillResponse>>> getSkills(@AuthenticationPrincipal UserPrincipal principal) {
        List<StudentSkillResponse> skills = studentService.getStudentSkills(principal);
        return ResponseEntity.ok(ApiResponse.success(skills));
    }

    @PostMapping("/skills")
    @Operation(summary = "Add or update a skill for current student")
    public ResponseEntity<ApiResponse<StudentSkillResponse>> addSkill(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody SkillAddRequest request) {
        StudentSkillResponse skill = studentService.addSkill(principal, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Skill added successfully", skill));
    }

    @DeleteMapping("/skills/{skillId}")
    @Operation(summary = "Remove a skill from student profile")
    public ResponseEntity<ApiResponse<String>> removeSkill(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long skillId) {
        studentService.removeSkill(principal, skillId);
        return ResponseEntity.ok(ApiResponse.success("Skill removed successfully", null));
    }

    @PatchMapping("/skills/{skillId}/proficiency")
    @Operation(summary = "Update proficiency level of a student skill")
    public ResponseEntity<ApiResponse<StudentSkillResponse>> updateSkillProficiency(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long skillId,
            @RequestParam SkillProficiency proficiency) {
        StudentSkillResponse response = studentService.updateSkillProficiency(principal, skillId, proficiency);
        return ResponseEntity.ok(ApiResponse.success("Proficiency updated", response));
    }
}
