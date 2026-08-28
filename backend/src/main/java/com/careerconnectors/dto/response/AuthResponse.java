package com.careerconnectors.dto.response;

import com.careerconnectors.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;
    @Builder.Default
    private String tokenType = "Bearer";
    private Long userId;
    private Long profileId; // studentId or companyId or adminId
    private String email;
    private String name;
    private Role role;
}
