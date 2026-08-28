package com.careerconnectors.dto.request;

import com.careerconnectors.enums.AIFeedbackType;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AIFeedbackRequest {

    @NotNull(message = "Entity type is required")
    private AIFeedbackType entityType;

    @NotNull(message = "Entity ID is required")
    private Long entityId;

    @NotNull(message = "Rating is required")
    @Min(value = 1, message = "Rating must be between 1 and 5")
    @Max(value = 5, message = "Rating must be between 1 and 5")
    private Integer rating;

    private String comment;
}
