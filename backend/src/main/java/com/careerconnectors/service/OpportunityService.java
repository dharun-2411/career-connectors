package com.careerconnectors.service;

import com.careerconnectors.dto.common.PageResponse;
import com.careerconnectors.dto.request.OpportunityCreateRequest;
import com.careerconnectors.dto.request.OpportunitySkillRequest;
import com.careerconnectors.dto.request.OpportunityUpdateRequest;
import com.careerconnectors.dto.response.ApplicantSummaryDto;
import com.careerconnectors.dto.response.OpportunityResponse;
import com.careerconnectors.dto.response.OpportunitySkillResponse;
import com.careerconnectors.entity.*;
import com.careerconnectors.enums.OpportunityStatus;
import com.careerconnectors.enums.OpportunityType;
import com.careerconnectors.enums.Role;
import com.careerconnectors.enums.VerificationStatus;
import com.careerconnectors.exception.ForbiddenException;
import com.careerconnectors.exception.ResourceNotFoundException;
import com.careerconnectors.repository.*;
import com.careerconnectors.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OpportunityService {

    private final OpportunityRepository opportunityRepository;
    private final OpportunitySkillRepository opportunitySkillRepository;
    private final CompanyRepository companyRepository;
    private final StudentRepository studentRepository;
    private final ApplicationRepository applicationRepository;
    private final SkillService skillService;

    @Transactional
    public OpportunityResponse createOpportunity(UserPrincipal principal, OpportunityCreateRequest request) {
        Company company = companyRepository.findByUserId(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Company profile not found"));

        if (company.getVerificationStatus() != VerificationStatus.VERIFIED) {
            throw new ForbiddenException("Company account is pending administrator verification. You must be approved by an administrator before posting opportunities.");
        }

        Opportunity opportunity = Opportunity.builder()
                .company(company)
                .title(request.getTitle())
                .description(request.getDescription())
                .type(request.getType())
                .location(request.getLocation())
                .isRemote(request.getIsRemote() != null ? request.getIsRemote() : false)
                .stipend(request.getStipend())
                .duration(request.getDuration())
                .experienceLevel(request.getExperienceLevel())
                .status(OpportunityStatus.OPEN)
                .deadline(request.getDeadline())
                .build();

        opportunity = opportunityRepository.save(opportunity);

        List<OpportunitySkill> skills = new ArrayList<>();
        if (request.getSkills() != null) {
            for (OpportunitySkillRequest reqSkill : request.getSkills()) {
                Skill skill = skillService.getOrCreateSkill(reqSkill.getSkillName(), "Required Skill");
                OpportunitySkill oppSkill = OpportunitySkill.builder()
                        .opportunity(opportunity)
                        .skill(skill)
                        .weightage(reqSkill.getWeightage() != null ? reqSkill.getWeightage() : BigDecimal.valueOf(1.0))
                        .requiredProficiency(reqSkill.getRequiredProficiency())
                        .build();
                skills.add(oppSkill);
            }
            opportunitySkillRepository.saveAll(skills);
        }

        opportunity.setRequiredSkills(skills);
        return mapToResponse(opportunity, null);
    }

    @Transactional
    public OpportunityResponse updateOpportunity(UserPrincipal principal, Long id, OpportunityUpdateRequest request) {
        Opportunity opportunity = opportunityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Opportunity not found with ID: " + id));

        Company company = companyRepository.findByUserId(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Company profile not found"));

        if (!opportunity.getCompany().getId().equals(company.getId()) && !principal.getAuthorities().iterator().next().getAuthority().equals(Role.ROLE_ADMIN.name())) {
            throw new ForbiddenException("You are not authorized to update this opportunity");
        }

        if (request.getTitle() != null) opportunity.setTitle(request.getTitle());
        if (request.getDescription() != null) opportunity.setDescription(request.getDescription());
        if (request.getType() != null) opportunity.setType(request.getType());
        if (request.getLocation() != null) opportunity.setLocation(request.getLocation());
        if (request.getIsRemote() != null) opportunity.setIsRemote(request.getIsRemote());
        if (request.getStipend() != null) opportunity.setStipend(request.getStipend());
        if (request.getDuration() != null) opportunity.setDuration(request.getDuration());
        if (request.getExperienceLevel() != null) opportunity.setExperienceLevel(request.getExperienceLevel());
        if (request.getStatus() != null) opportunity.setStatus(request.getStatus());
        if (request.getDeadline() != null) opportunity.setDeadline(request.getDeadline());

        if (request.getSkills() != null) {
            opportunitySkillRepository.deleteAll(opportunity.getRequiredSkills());
            opportunity.getRequiredSkills().clear();

            List<OpportunitySkill> newSkills = new ArrayList<>();
            for (OpportunitySkillRequest reqSkill : request.getSkills()) {
                Skill skill = skillService.getOrCreateSkill(reqSkill.getSkillName(), "Required Skill");
                OpportunitySkill oppSkill = OpportunitySkill.builder()
                        .opportunity(opportunity)
                        .skill(skill)
                        .weightage(reqSkill.getWeightage() != null ? reqSkill.getWeightage() : BigDecimal.valueOf(1.0))
                        .requiredProficiency(reqSkill.getRequiredProficiency())
                        .build();
                newSkills.add(oppSkill);
            }
            opportunitySkillRepository.saveAll(newSkills);
            opportunity.setRequiredSkills(newSkills);
        }

        opportunity = opportunityRepository.save(opportunity);
        return mapToResponse(opportunity, null);
    }

    @Transactional(readOnly = true)
    public PageResponse<OpportunityResponse> searchOpportunities(
            String search,
            OpportunityType type,
            Boolean isRemote,
            OpportunityStatus status,
            int page,
            int size,
            String sortBy,
            String sortDirection,
            UserPrincipal principal) {

        Sort sort = sortDirection.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        OpportunityStatus filterStatus = status != null ? status : OpportunityStatus.OPEN;
        Page<Opportunity> oppPage = opportunityRepository.searchAndFilterOpportunities(search, type, isRemote, filterStatus, pageable);

        Student student = null;
        if (principal != null) {
            Optional<Student> studentOpt = studentRepository.findByUserId(principal.getId());
            if (studentOpt.isPresent()) {
                student = studentOpt.get();
            }
        }

        Student finalStudent = student;
        List<OpportunityResponse> responses = oppPage.getContent().stream()
                .map(opp -> mapToResponse(opp, finalStudent))
                .collect(Collectors.toList());

        return PageResponse.<OpportunityResponse>builder()
                .content(responses)
                .pageNumber(oppPage.getNumber())
                .pageSize(oppPage.getSize())
                .totalElements(oppPage.getTotalElements())
                .totalPages(oppPage.getTotalPages())
                .isLast(oppPage.isLast())
                .build();
    }

    @Transactional(readOnly = true)
    public OpportunityResponse getOpportunityDetails(Long id, UserPrincipal principal) {
        Opportunity opportunity = opportunityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Opportunity not found with ID: " + id));

        Student student = null;
        if (principal != null) {
            Optional<Student> studentOpt = studentRepository.findByUserId(principal.getId());
            if (studentOpt.isPresent()) {
                student = studentOpt.get();
            }
        }

        return mapToResponse(opportunity, student);
    }

    @Transactional(readOnly = true)
    public PageResponse<OpportunityResponse> getCompanyOpportunities(UserPrincipal principal, int page, int size) {
        Company company = companyRepository.findByUserId(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Company profile not found"));

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Opportunity> oppPage = opportunityRepository.findByCompany(company, pageable);

        List<OpportunityResponse> responses = oppPage.getContent().stream()
                .map(opp -> mapToResponse(opp, null))
                .collect(Collectors.toList());

        return PageResponse.<OpportunityResponse>builder()
                .content(responses)
                .pageNumber(oppPage.getNumber())
                .pageSize(oppPage.getSize())
                .totalElements(oppPage.getTotalElements())
                .totalPages(oppPage.getTotalPages())
                .isLast(oppPage.isLast())
                .build();
    }

    @Transactional
    public void deleteOpportunity(UserPrincipal principal, Long id) {
        Opportunity opportunity = opportunityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Opportunity not found with ID: " + id));

        Company company = companyRepository.findByUserId(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Company profile not found"));

        if (!opportunity.getCompany().getId().equals(company.getId()) && !principal.getAuthorities().iterator().next().getAuthority().equals(Role.ROLE_ADMIN.name())) {
            throw new ForbiddenException("You are not authorized to delete this opportunity");
        }

        opportunityRepository.delete(opportunity);
    }

    public BigDecimal calculateMatchScore(Student student, Opportunity opportunity) {
        if (student == null || student.getStudentSkills() == null || student.getStudentSkills().isEmpty()) {
            return BigDecimal.ZERO;
        }

        List<OpportunitySkill> required = opportunity.getRequiredSkills();
        if (required == null || required.isEmpty()) {
            return BigDecimal.valueOf(100.0);
        }

        Map<String, StudentSkill> studentSkillMap = student.getStudentSkills().stream()
                .collect(Collectors.toMap(
                        ss -> ss.getSkill().getName().toLowerCase().trim(),
                        ss -> ss,
                        (existing, replacement) -> existing
                ));

        BigDecimal totalWeight = BigDecimal.ZERO;
        BigDecimal earnedWeight = BigDecimal.ZERO;

        for (OpportunitySkill oppSkill : required) {
            BigDecimal weight = oppSkill.getWeightage() != null ? oppSkill.getWeightage() : BigDecimal.valueOf(1.0);
            totalWeight = totalWeight.add(weight);

            String skillName = oppSkill.getSkill().getName().toLowerCase().trim();
            if (studentSkillMap.containsKey(skillName)) {
                StudentSkill studentSkill = studentSkillMap.get(skillName);
                double proficiencyFactor = getProficiencyFactor(studentSkill.getProficiencyLevel().name(), oppSkill.getRequiredProficiency().name());
                earnedWeight = earnedWeight.add(weight.multiply(BigDecimal.valueOf(proficiencyFactor)));
            }
        }

        if (totalWeight.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.valueOf(100.0);
        }

        return earnedWeight.divide(totalWeight, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100.0))
                .setScale(1, RoundingMode.HALF_UP);
    }

    private double getProficiencyFactor(String current, String required) {
        int curVal = getProficiencyValue(current);
        int reqVal = getProficiencyValue(required);
        if (curVal >= reqVal) return 1.0;
        if (curVal == reqVal - 1) return 0.75;
        if (curVal == reqVal - 2) return 0.50;
        return 0.25;
    }

    private int getProficiencyValue(String prof) {
        return switch (prof) {
            case "EXPERT" -> 4;
            case "ADVANCED" -> 3;
            case "INTERMEDIATE" -> 2;
            default -> 1;
        };
    }

    public OpportunityResponse mapToResponse(Opportunity opp, Student student) {
        List<OpportunitySkillResponse> skills = opp.getRequiredSkills() != null
                ? opp.getRequiredSkills().stream().map(os -> OpportunitySkillResponse.builder()
                        .id(os.getId())
                        .skillId(os.getSkill().getId())
                        .skillName(os.getSkill().getName())
                        .category(os.getSkill().getCategory())
                        .weightage(os.getWeightage())
                        .requiredProficiency(os.getRequiredProficiency())
                        .build()).collect(Collectors.toList())
                : List.of();

        BigDecimal matchScore = null;
        Boolean hasApplied = false;

        if (student != null) {
            matchScore = calculateMatchScore(student, opp);
            hasApplied = applicationRepository.existsByStudentAndOpportunity(student, opp);
        }

        List<Application> apps = applicationRepository.findByOpportunityId(opp.getId());
        int applicantCount = apps != null ? apps.size() : 0;
        List<ApplicantSummaryDto> applicantSummaries = apps != null ? apps.stream()
                .map(a -> ApplicantSummaryDto.builder()
                        .applicationId(a.getId())
                        .studentId(a.getStudent().getId())
                        .studentName(a.getStudent().getName())
                        .studentEmail(a.getStudent().getUser() != null ? a.getStudent().getUser().getEmail() : null)
                        .studentUniversity(a.getStudent().getUniversity())
                        .status(a.getStatus() != null ? a.getStatus().name() : "APPLIED")
                        .appliedAt(a.getAppliedAt())
                        .build())
                .collect(Collectors.toList()) : List.of();

        return OpportunityResponse.builder()
                .id(opp.getId())
                .companyId(opp.getCompany().getId())
                .companyName(opp.getCompany().getName())
                .companyLogoUrl(opp.getCompany().getLogoUrl())
                .companyLocation(opp.getCompany().getLocation())
                .title(opp.getTitle())
                .description(opp.getDescription())
                .type(opp.getType())
                .location(opp.getLocation())
                .isRemote(opp.getIsRemote())
                .stipend(opp.getStipend())
                .duration(opp.getDuration())
                .experienceLevel(opp.getExperienceLevel())
                .status(opp.getStatus())
                .deadline(opp.getDeadline())
                .requiredSkills(skills)
                .applicantCount(applicantCount)
                .recentApplicants(applicantSummaries)
                .matchScore(matchScore)
                .hasApplied(hasApplied)
                .createdAt(opp.getCreatedAt())
                .updatedAt(opp.getUpdatedAt())
                .build();
    }
}
