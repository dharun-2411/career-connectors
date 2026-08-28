package com.careerconnectors.dto.response;

import com.careerconnectors.enums.Role;
import com.careerconnectors.enums.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private String email;
    private Role role;
    private UserStatus status;
    private LocalDateTime createdAt;
}
