package com.careerconnectors.service;

import com.careerconnectors.dto.common.PageResponse;
import com.careerconnectors.dto.request.CompanyVerificationRequest;
import com.careerconnectors.dto.response.AdminStatsResponse;
import com.careerconnectors.dto.response.CompanyProfileResponse;
import com.careerconnectors.dto.response.OpportunityResponse;
import com.careerconnectors.dto.response.StudentProfileResponse;
import com.careerconnectors.entity.*;
import com.careerconnectors.enums.*;
import com.careerconnectors.exception.ResourceNotFoundException;
import com.careerconnectors.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final CompanyRepository companyRepository;
    private final OpportunityRepository opportunityRepository;
    private final OpportunitySkillRepository opportunitySkillRepository;
    private final ApplicationRepository applicationRepository;
    private final StudentService studentService;
    private final CompanyService companyService;
    private final OpportunityService opportunityService;

    @Transactional(readOnly = true)
    public AdminStatsResponse getPlatformStats() {
        long totalStudents = studentRepository.count();
        long totalCompanies = companyRepository.count();
        long pendingVerifications = companyRepository.countByVerificationStatus(VerificationStatus.PENDING);
        long totalOpportunities = opportunityRepository.count();
        long activeOpportunities = opportunityRepository.countByStatus(OpportunityStatus.OPEN);
        long totalApplications = applicationRepository.count();
        long selectedApplications = applicationRepository.countByStatus(ApplicationStatus.SELECTED);

        List<Application> allApps = applicationRepository.findAll();
        BigDecimal avgScore = BigDecimal.ZERO;
        if (!allApps.isEmpty()) {
            double sum = allApps.stream()
                    .filter(a -> a.getMatchScore() != null)
                    .mapToDouble(a -> a.getMatchScore().doubleValue())
                    .sum();
            long countWithScore = allApps.stream().filter(a -> a.getMatchScore() != null).count();
            if (countWithScore > 0) {
                avgScore = BigDecimal.valueOf(sum / countWithScore).setScale(1, RoundingMode.HALF_UP);
            }
        }

        Map<String, Long> statusMap = new HashMap<>();
        for (ApplicationStatus status : ApplicationStatus.values()) {
            statusMap.put(status.name(), applicationRepository.countByStatus(status));
        }

        Map<String, Long> typeMap = new HashMap<>();
        List<Opportunity> allOpps = opportunityRepository.findAll();
        for (Opportunity opp : allOpps) {
            typeMap.put(opp.getType().name(), typeMap.getOrDefault(opp.getType().name(), 0L) + 1);
        }

        Map<String, Long> skillDemand = new HashMap<>();
        List<OpportunitySkill> allOppSkills = opportunitySkillRepository.findAll();
        for (OpportunitySkill os : allOppSkills) {
            String skillName = os.getSkill().getName();
            skillDemand.put(skillName, skillDemand.getOrDefault(skillName, 0L) + 1);
        }

        // Keep top 10 most demanded skills
        Map<String, Long> topSkills = skillDemand.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(10)
                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));

        return AdminStatsResponse.builder()
                .totalStudents(totalStudents)
                .totalCompanies(totalCompanies)
                .pendingCompanyVerifications(pendingVerifications)
                .totalOpportunities(totalOpportunities)
                .activeOpportunities(activeOpportunities)
                .totalApplications(totalApplications)
                .selectedApplications(selectedApplications)
                .averageMatchScore(avgScore)
                .applicationsByStatus(statusMap)
                .opportunitiesByType(typeMap)
                .topSkillsDemand(topSkills)
                .build();
    }

    @Transactional(readOnly = true)
    public PageResponse<StudentProfileResponse> getAllStudents(String search, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Student> studentPage;
        if (search != null && !search.trim().isEmpty()) {
            studentPage = studentRepository.searchStudents(search.trim(), pageable);
        } else {
            studentPage = studentRepository.findAll(pageable);
        }

        List<StudentProfileResponse> responses = studentPage.getContent().stream()
                .map(studentService::mapToProfileResponse)
                .collect(Collectors.toList());

        return PageResponse.<StudentProfileResponse>builder()
                .content(responses)
                .pageNumber(studentPage.getNumber())
                .pageSize(studentPage.getSize())
                .totalElements(studentPage.getTotalElements())
                .totalPages(studentPage.getTotalPages())
                .isLast(studentPage.isLast())
                .build();
    }

    @Transactional
    public void updateUserStatus(Long userId, UserStatus status) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));
        user.setStatus(status);
        userRepository.save(user);
    }

    @Transactional
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));
        userRepository.delete(user);
    }

    @Transactional(readOnly = true)
    public PageResponse<CompanyProfileResponse> getAllCompanies(String search, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Company> companyPage;
        if (search != null && !search.trim().isEmpty()) {
            companyPage = companyRepository.searchCompanies(search.trim(), pageable);
        } else {
            companyPage = companyRepository.findAll(pageable);
        }

        List<CompanyProfileResponse> responses = companyPage.getContent().stream()
                .map(companyService::mapToProfileResponse)
                .collect(Collectors.toList());

        return PageResponse.<CompanyProfileResponse>builder()
                .content(responses)
                .pageNumber(companyPage.getNumber())
                .pageSize(companyPage.getSize())
                .totalElements(companyPage.getTotalElements())
                .totalPages(companyPage.getTotalPages())
                .isLast(companyPage.isLast())
                .build();
    }

    @Transactional
    public CompanyProfileResponse verifyCompany(Long companyId, CompanyVerificationRequest request) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with ID: " + companyId));

        company.setVerificationStatus(request.getVerificationStatus());
        company.setVerificationNotes(request.getNotes());
        company = companyRepository.save(company);

        return companyService.mapToProfileResponse(company);
    }

    @Transactional(readOnly = true)
    public PageResponse<OpportunityResponse> getAllOpportunities(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Opportunity> oppPage = opportunityRepository.findAll(pageable);

        List<OpportunityResponse> responses = oppPage.getContent().stream()
                .map(opp -> opportunityService.mapToResponse(opp, null))
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
    public void deleteOpportunity(Long opportunityId) {
        Opportunity opportunity = opportunityRepository.findById(opportunityId)
                .orElseThrow(() -> new ResourceNotFoundException("Opportunity not found with ID: " + opportunityId));
        opportunityRepository.delete(opportunity);
    }
}
