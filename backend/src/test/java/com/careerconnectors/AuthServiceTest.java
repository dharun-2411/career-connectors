package com.careerconnectors;

import com.careerconnectors.dto.request.StudentRegisterRequest;
import com.careerconnectors.dto.response.AuthResponse;
import com.careerconnectors.entity.Student;
import com.careerconnectors.entity.User;
import com.careerconnectors.enums.Role;
import com.careerconnectors.exception.ConflictException;
import com.careerconnectors.repository.AdminRepository;
import com.careerconnectors.repository.CompanyRepository;
import com.careerconnectors.repository.StudentRepository;
import com.careerconnectors.repository.UserRepository;
import com.careerconnectors.security.JwtTokenProvider;
import com.careerconnectors.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private CompanyRepository companyRepository;

    @Mock
    private AdminRepository adminRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider tokenProvider;

    @InjectMocks
    private AuthService authService;

    private StudentRegisterRequest studentRequest;

    @BeforeEach
    void setUp() {
        studentRequest = StudentRegisterRequest.builder()
                .email("test.student@univ.edu")
                .password("password123")
                .name("Test Student")
                .university("Test University")
                .build();
    }

    @Test
    void registerStudent_Success() {
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("hashedPass");

        User savedUser = User.builder().id(1L).email(studentRequest.getEmail()).role(Role.ROLE_STUDENT).build();
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        Student savedStudent = Student.builder().id(10L).user(savedUser).name(studentRequest.getName()).build();
        when(studentRepository.save(any(Student.class))).thenReturn(savedStudent);

        when(tokenProvider.generateTokenFromUser(anyLong(), anyString(), anyString())).thenReturn("mockJwtToken");

        AuthResponse response = authService.registerStudent(studentRequest);

        assertNotNull(response);
        assertEquals("mockJwtToken", response.getToken());
        assertEquals("test.student@univ.edu", response.getEmail());
        assertEquals("Test Student", response.getName());
        assertEquals(Role.ROLE_STUDENT, response.getRole());

        verify(userRepository).save(any(User.class));
        verify(studentRepository).save(any(Student.class));
    }

    @Test
    void registerStudent_EmailAlreadyExists_ThrowsConflict() {
        when(userRepository.existsByEmail(anyString())).thenReturn(true);

        assertThrows(ConflictException.class, () -> authService.registerStudent(studentRequest));

        verify(userRepository, never()).save(any(User.class));
        verify(studentRepository, never()).save(any(Student.class));
    }
}
