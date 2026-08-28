package com.careerconnectors.dto.response;

import com.careerconnectors.enums.VerificationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompanyProfileResponse {
    private Long id;
    private Long userId;
    private String email;
    private String name;
    private String industry;
    private String website;
    private String location;
    private String description;
    private String logoUrl;
    private VerificationStatus verificationStatus;
    private String documentsUrl;
    private String verificationNotes;
    private int totalOpportunities;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
