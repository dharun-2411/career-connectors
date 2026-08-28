package com.careerconnectors.controller;

import com.careerconnectors.dto.common.ApiResponse;
import com.careerconnectors.dto.response.SkillResponse;
import com.careerconnectors.service.SkillService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/skills")
@RequiredArgsConstructor
@Tag(name = "Skills", description = "Skills dictionary and search endpoints")
public class SkillController {

    private final SkillService skillService;

    @GetMapping
    @Operation(summary = "Get all platform skills or search by name")
    public ResponseEntity<ApiResponse<List<SkillResponse>>> getSkills(@RequestParam(required = false) String search) {
        List<SkillResponse> skills = skillService.searchSkills(search);
        return ResponseEntity.ok(ApiResponse.success(skills));
    }
}
