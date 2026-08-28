package com.careerconnectors.dto.response;

import com.careerconnectors.enums.AIFeedbackType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AIFeedbackResponse {
    private Long id;
    private Long userId;
    private AIFeedbackType entityType;
    private Long entityId;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;
}
