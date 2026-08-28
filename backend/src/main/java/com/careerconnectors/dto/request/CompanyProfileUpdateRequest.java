package com.careerconnectors.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompanyProfileUpdateRequest {
    private String name;
    private String industry;
    private String website;
    private String location;
    private String description;
    private String logoUrl;
    private String documentsUrl;
}
