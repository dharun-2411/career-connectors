package com.careerconnectors.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrendingDomainDto {
    private Long id;
    private String domainName;
    private String description;
    private String category;
    private String popularityTag;
    private String iconName;
    private Integer displayOrder;
}
