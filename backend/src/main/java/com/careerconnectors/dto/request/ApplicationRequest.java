package com.careerconnectors.dto.request;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class ApplicationRequest {

    @NotNull(message = "Opportunity ID is required")
    private Long opportunityId;

    private String coverLetter;

    private String resumeUrl;

    private String resumeFileName;
}
