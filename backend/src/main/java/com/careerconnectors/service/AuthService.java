package com.careerconnectors.service;

import com.careerconnectors.dto.request.CompanyRegisterRequest;
import com.careerconnectors.dto.request.LoginRequest;
import com.careerconnectors.dto.request.StudentRegisterRequest;
import com.careerconnectors.dto.response.AuthResponse;
import com.careerconnectors.dto.response.UserResponse;
import com.careerconnectors.entity.Admin;
import com.careerconnectors.entity.Company;
import com.careerconnectors.entity.Student;
import com.careerconnectors.entity.User;
import com.careerconnectors.enums.Role;
import com.careerconnectors.enums.UserStatus;
import com.careerconnectors.enums.VerificationStatus;
import com.careerconnectors.exception.BadRequestException;
import com.careerconnectors.exception.ConflictException;
import com.careerconnectors.exception.ResourceNotFoundException;
import com.careerconnectors.exception.UnauthorizedException;
import com.careerconnectors.repository.AdminRepository;
import com.careerconnectors.repository.CompanyRepository;
import com.careerconnectors.repository.StudentRepository;
import com.careerconnectors.repository.UserRepository;
import com.careerconnectors.security.JwtTokenProvider;
import com.careerconnectors.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final CompanyRepository companyRepository;
    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    @Transactional
    public AuthResponse registerStudent(StudentRegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail().toLowerCase().trim())) {
            throw new ConflictException("Email already in use: " + request.getEmail());
        }

        User user = User.builder()
                .email(request.getEmail().toLowerCase().trim())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(Role.ROLE_STUDENT)
                .status(UserStatus.ACTIVE)
                .build();
        user = userRepository.save(user);

        Student student = Student.builder()
                .user(user)
                .name(request.getName())
                .phone(request.getPhone())
                .dob(request.getDob())
                .education(request.getEducation())
                .university(request.getUniversity())
                .graduationYear(request.getGraduationYear())
                .bio(request.getBio())
                .build();
        student = studentRepository.save(student);

        String token = tokenProvider.generateTokenFromUser(user.getId(), user.getEmail(), user.getRole().name());

        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .profileId(student.getId())
                .email(user.getEmail())
                .name(student.getName())
                .role(user.getRole())
                .build();
    }

    @Transactional
    public AuthResponse registerCompany(CompanyRegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail().toLowerCase().trim())) {
            throw new ConflictException("Email already in use: " + request.getEmail());
        }

        User user = User.builder()
                .email(request.getEmail().toLowerCase().trim())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(Role.ROLE_COMPANY)
                .status(UserStatus.ACTIVE)
                .build();
        user = userRepository.save(user);

        Company company = Company.builder()
                .user(user)
                .name(request.getName())
                .industry(request.getIndustry())
                .website(request.getWebsite())
                .location(request.getLocation())
                .description(request.getDescription())
                .documentsUrl(request.getDocumentsUrl())
                .verificationStatus(VerificationStatus.PENDING)
                .build();
        company = companyRepository.save(company);

        String token = tokenProvider.generateTokenFromUser(user.getId(), user.getEmail(), user.getRole().name());

        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .profileId(company.getId())
                .email(user.getEmail())
                .name(company.getName())
                .role(user.getRole())
                .build();
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail().toLowerCase().trim())
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new UnauthorizedException("Invalid email or password");
        }

        if (user.getStatus() == UserStatus.SUSPENDED) {
            throw new BadRequestException("Account is suspended. Please contact support.");
        }

        Long profileId = null;
        String name = "";

        if (user.getRole() == Role.ROLE_STUDENT) {
            Student student = studentRepository.findByUser(user)
                    .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));
            profileId = student.getId();
            name = student.getName();
        } else if (user.getRole() == Role.ROLE_COMPANY) {
            Company company = companyRepository.findByUser(user)
                    .orElseThrow(() -> new ResourceNotFoundException("Company profile not found"));
            profileId = company.getId();
            name = company.getName();
        } else if (user.getRole() == Role.ROLE_ADMIN) {
            Admin admin = adminRepository.findByUser(user)
                    .orElseThrow(() -> new ResourceNotFoundException("Admin profile not found"));
            profileId = admin.getId();
            name = admin.getName();
        }

        String token = tokenProvider.generateTokenFromUser(user.getId(), user.getEmail(), user.getRole().name());

        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .profileId(profileId)
                .email(user.getEmail())
                .name(name)
                .role(user.getRole())
                .build();
    }

    @Transactional(readOnly = true)
    public AuthResponse getCurrentUser(UserPrincipal principal) {
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Long profileId = null;
        String name = "";

        if (user.getRole() == Role.ROLE_STUDENT) {
            Student student = studentRepository.findByUser(user)
                    .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));
            profileId = student.getId();
            name = student.getName();
        } else if (user.getRole() == Role.ROLE_COMPANY) {
            Company company = companyRepository.findByUser(user)
                    .orElseThrow(() -> new ResourceNotFoundException("Company profile not found"));
            profileId = company.getId();
            name = company.getName();
        } else if (user.getRole() == Role.ROLE_ADMIN) {
            Admin admin = adminRepository.findByUser(user)
                    .orElseThrow(() -> new ResourceNotFoundException("Admin profile not found"));
            profileId = admin.getId();
            name = admin.getName();
        }

        String token = tokenProvider.generateTokenFromUser(user.getId(), user.getEmail(), user.getRole().name());

        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .profileId(profileId)
                .email(user.getEmail())
                .name(name)
                .role(user.getRole())
                .build();
    }
}
