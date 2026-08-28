package com.careerconnectors.service;

import com.careerconnectors.dto.request.CompanyProfileUpdateRequest;
import com.careerconnectors.dto.response.CompanyProfileResponse;
import com.careerconnectors.entity.Company;
import com.careerconnectors.exception.ResourceNotFoundException;
import com.careerconnectors.repository.CompanyRepository;
import com.careerconnectors.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CompanyService {

    private final CompanyRepository companyRepository;

    @Transactional(readOnly = true)
    public Company getCompanyByUserId(Long userId) {
        return companyRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Company profile not found for user ID: " + userId));
    }

    @Transactional(readOnly = true)
    public CompanyProfileResponse getProfile(UserPrincipal principal) {
        Company company = getCompanyByUserId(principal.getId());
        return mapToProfileResponse(company);
    }

    @Transactional(readOnly = true)
    public CompanyProfileResponse getProfileById(Long companyId) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with ID: " + companyId));
        return mapToProfileResponse(company);
    }

    @Transactional
    public CompanyProfileResponse updateProfile(UserPrincipal principal, CompanyProfileUpdateRequest request) {
        Company company = getCompanyByUserId(principal.getId());

        if (request.getName() != null) company.setName(request.getName());
        if (request.getIndustry() != null) company.setIndustry(request.getIndustry());
        if (request.getWebsite() != null) company.setWebsite(request.getWebsite());
        if (request.getLocation() != null) company.setLocation(request.getLocation());
        if (request.getDescription() != null) company.setDescription(request.getDescription());
        if (request.getLogoUrl() != null) company.setLogoUrl(request.getLogoUrl());
        if (request.getDocumentsUrl() != null) company.setDocumentsUrl(request.getDocumentsUrl());

        company = companyRepository.save(company);
        return mapToProfileResponse(company);
    }

    public CompanyProfileResponse mapToProfileResponse(Company company) {
        int totalOpportunities = company.getOpportunities() != null ? company.getOpportunities().size() : 0;

        return CompanyProfileResponse.builder()
                .id(company.getId())
                .userId(company.getUser().getId())
                .email(company.getUser().getEmail())
                .name(company.getName())
                .industry(company.getIndustry())
                .website(company.getWebsite())
                .location(company.getLocation())
                .description(company.getDescription())
                .logoUrl(company.getLogoUrl())
                .verificationStatus(company.getVerificationStatus())
                .documentsUrl(company.getDocumentsUrl())
                .verificationNotes(company.getVerificationNotes())
                .totalOpportunities(totalOpportunities)
                .createdAt(company.getCreatedAt())
                .updatedAt(company.getUpdatedAt())
                .build();
    }
}
