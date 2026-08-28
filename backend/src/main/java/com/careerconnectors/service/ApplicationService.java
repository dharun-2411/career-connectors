package com.careerconnectors.service;

import com.careerconnectors.dto.common.PageResponse;
import com.careerconnectors.dto.request.ApplicationRequest;
import com.careerconnectors.dto.request.ApplicationStatusUpdateRequest;
import com.careerconnectors.dto.response.ApplicationResponse;
import com.careerconnectors.entity.Application;
import com.careerconnectors.entity.Company;
import com.careerconnectors.entity.Opportunity;
import com.careerconnectors.entity.Student;
import com.careerconnectors.enums.ApplicationStatus;
import com.careerconnectors.enums.OpportunityStatus;
import com.careerconnectors.enums.Role;
import com.careerconnectors.exception.BadRequestException;
import com.careerconnectors.exception.ConflictException;
import com.careerconnectors.exception.ForbiddenException;
import com.careerconnectors.exception.ResourceNotFoundException;
import com.careerconnectors.repository.ApplicationRepository;
import com.careerconnectors.repository.CompanyRepository;
import com.careerconnectors.repository.OpportunityRepository;
import com.careerconnectors.repository.StudentRepository;
import com.careerconnectors.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final OpportunityRepository opportunityRepository;
    private final StudentRepository studentRepository;
    private final CompanyRepository companyRepository;
    private final OpportunityService opportunityService;

    @Transactional
    public ApplicationResponse applyForOpportunity(UserPrincipal principal, ApplicationRequest request) {
        Student student = studentRepository.findByUserId(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));

        Opportunity opportunity = opportunityRepository.findById(request.getOpportunityId())
                .orElseThrow(() -> new ResourceNotFoundException("Opportunity not found with ID: " + request.getOpportunityId()));

        if (opportunity.getStatus() != OpportunityStatus.OPEN) {
            throw new BadRequestException("This opportunity is no longer open for applications");
        }

        if (applicationRepository.existsByStudentAndOpportunity(student, opportunity)) {
            throw new ConflictException("You have already applied for this opportunity");
        }

        BigDecimal matchScore = opportunityService.calculateMatchScore(student, opportunity);

        String appResumeUrl = (request.getResumeUrl() != null && !request.getResumeUrl().isBlank())
                ? request.getResumeUrl()
                : student.getResumeUrl();

        Application application = Application.builder()
                .student(student)
                .opportunity(opportunity)
                .status(ApplicationStatus.APPLIED)
                .matchScore(matchScore)
                .coverLetter(request.getCoverLetter())
                .resumeUrl(appResumeUrl)
                .build();

        application = applicationRepository.save(application);
        return mapToResponse(application);
    }

    @Transactional(readOnly = true)
    public PageResponse<ApplicationResponse> getStudentApplications(UserPrincipal principal, int page, int size) {
        Student student = studentRepository.findByUserId(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));

        Pageable pageable = PageRequest.of(page, size, Sort.by("appliedAt").descending());
        Page<Application> appPage = applicationRepository.findByStudent(student, pageable);

        List<ApplicationResponse> responses = appPage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return PageResponse.<ApplicationResponse>builder()
                .content(responses)
                .pageNumber(appPage.getNumber())
                .pageSize(appPage.getSize())
                .totalElements(appPage.getTotalElements())
                .totalPages(appPage.getTotalPages())
                .isLast(appPage.isLast())
                .build();
    }

    @Transactional(readOnly = true)
    public PageResponse<ApplicationResponse> getOpportunityApplications(
            UserPrincipal principal, Long opportunityId, int page, int size, String sortBy, String sortDirection) {

        Opportunity opportunity = opportunityRepository.findById(opportunityId)
                .orElseThrow(() -> new ResourceNotFoundException("Opportunity not found with ID: " + opportunityId));

        Company company = companyRepository.findByUserId(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Company profile not found"));

        if (!opportunity.getCompany().getId().equals(company.getId()) && !principal.getAuthorities().iterator().next().getAuthority().equals(Role.ROLE_ADMIN.name())) {
            throw new ForbiddenException("You are not authorized to view applicants for this opportunity");
        }

        Sort sort = sortDirection.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Application> appPage = applicationRepository.findByOpportunity(opportunity, pageable);

        List<ApplicationResponse> responses = appPage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return PageResponse.<ApplicationResponse>builder()
                .content(responses)
                .pageNumber(appPage.getNumber())
                .pageSize(appPage.getSize())
                .totalElements(appPage.getTotalElements())
                .totalPages(appPage.getTotalPages())
                .isLast(appPage.isLast())
                .build();
    }

    @Transactional(readOnly = true)
    public PageResponse<ApplicationResponse> getAllCompanyApplications(UserPrincipal principal, int page, int size) {
        Company company = companyRepository.findByUserId(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Company profile not found"));

        Pageable pageable = PageRequest.of(page, size, Sort.by("appliedAt").descending());
        Page<Application> appPage = applicationRepository.findByCompanyId(company.getId(), pageable);

        List<ApplicationResponse> responses = appPage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return PageResponse.<ApplicationResponse>builder()
                .content(responses)
                .pageNumber(appPage.getNumber())
                .pageSize(appPage.getSize())
                .totalElements(appPage.getTotalElements())
                .totalPages(appPage.getTotalPages())
                .isLast(appPage.isLast())
                .build();
    }

    @Transactional
    public ApplicationResponse updateApplicationStatus(UserPrincipal principal, Long applicationId, ApplicationStatusUpdateRequest request) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with ID: " + applicationId));

        Company company = companyRepository.findByUserId(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Company profile not found"));

        if (!application.getOpportunity().getCompany().getId().equals(company.getId()) && !principal.getAuthorities().iterator().next().getAuthority().equals(Role.ROLE_ADMIN.name())) {
            throw new ForbiddenException("You are not authorized to update this application");
        }

        application.setStatus(request.getStatus());
        application = applicationRepository.save(application);
        return mapToResponse(application);
    }

    public ApplicationResponse mapToResponse(Application app) {
        String effectiveResumeUrl = (app.getResumeUrl() != null && !app.getResumeUrl().isBlank())
                ? app.getResumeUrl()
                : (app.getStudent() != null ? app.getStudent().getResumeUrl() : null);

        return ApplicationResponse.builder()
                .id(app.getId())
                .studentId(app.getStudent().getId())
                .studentName(app.getStudent().getName())
                .studentEmail(app.getStudent().getUser().getEmail())
                .studentUniversity(app.getStudent().getUniversity())
                .studentEducation(app.getStudent().getEducation())
                .studentResumeUrl(effectiveResumeUrl)
                .resumeUrl(effectiveResumeUrl)
                .opportunityId(app.getOpportunity().getId())
                .opportunityTitle(app.getOpportunity().getTitle())
                .companyName(app.getOpportunity().getCompany().getName())
                .companyLogoUrl(app.getOpportunity().getCompany().getLogoUrl())
                .status(app.getStatus())
                .matchScore(app.getMatchScore())
                .coverLetter(app.getCoverLetter())
                .appliedAt(app.getAppliedAt())
                .updatedAt(app.getUpdatedAt())
                .build();
    }
}
