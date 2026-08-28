package com.careerconnectors.service;

import com.careerconnectors.dto.request.AIFeedbackRequest;
import com.careerconnectors.dto.response.*;
import com.careerconnectors.entity.*;
import com.careerconnectors.enums.OpportunityStatus;
import com.careerconnectors.exception.ResourceNotFoundException;
import com.careerconnectors.repository.*;
import com.careerconnectors.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AIIntegrationService {

    private static final Logger logger = LoggerFactory.getLogger(AIIntegrationService.class);

    private final RestTemplate restTemplate;
    private final StudentRepository studentRepository;
    private final OpportunityRepository opportunityRepository;
    private final ApplicationRepository applicationRepository;
    private final SkillGapReportRepository skillGapReportRepository;
    private final AIFeedbackRepository aiFeedbackRepository;
    private final UserRepository userRepository;
    private final SkillService skillService;
    private final OpportunityService opportunityService;

    @Value("${app.ai-service.base-url:http://localhost:8000}")
    private String aiServiceBaseUrl;

    public AIIntegrationService(
            RestTemplateBuilder restTemplateBuilder,
            StudentRepository studentRepository,
            OpportunityRepository opportunityRepository,
            ApplicationRepository applicationRepository,
            SkillGapReportRepository skillGapReportRepository,
            AIFeedbackRepository aiFeedbackRepository,
            UserRepository userRepository,
            SkillService skillService,
            OpportunityService opportunityService) {
        this.restTemplate = restTemplateBuilder
                .setConnectTimeout(Duration.ofMillis(2000))
                .setReadTimeout(Duration.ofMillis(4000))
                .build();
        this.studentRepository = studentRepository;
        this.opportunityRepository = opportunityRepository;
        this.applicationRepository = applicationRepository;
        this.skillGapReportRepository = skillGapReportRepository;
        this.aiFeedbackRepository = aiFeedbackRepository;
        this.userRepository = userRepository;
        this.skillService = skillService;
        this.opportunityService = opportunityService;
    }

    @Transactional(readOnly = true)
    public AIMatchScoreResponse getMatchScore(Long studentId, Long opportunityId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + studentId));
        Opportunity opportunity = opportunityRepository.findById(opportunityId)
                .orElseThrow(() -> new ResourceNotFoundException("Opportunity not found with ID: " + opportunityId));

        // Try calling Python AI microservice first
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("student_id", studentId);
            payload.put("student_skills", student.getStudentSkills().stream()
                    .map(ss -> Map.of("name", ss.getSkill().getName(), "proficiency", ss.getProficiencyLevel().name()))
                    .collect(Collectors.toList()));
            payload.put("opportunity_id", opportunityId);
            payload.put("opportunity_skills", opportunity.getRequiredSkills().stream()
                    .map(os -> Map.of("name", os.getSkill().getName(), "weightage", os.getWeightage(), "proficiency", os.getRequiredProficiency().name()))
                    .collect(Collectors.toList()));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(payload, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(aiServiceBaseUrl + "/api/matching", requestEntity, Map.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map body = response.getBody();
                BigDecimal score = BigDecimal.valueOf(((Number) body.getOrDefault("overall_score", 0)).doubleValue()).setScale(1, RoundingMode.HALF_UP);
                BigDecimal semantic = BigDecimal.valueOf(((Number) body.getOrDefault("semantic_score", 0)).doubleValue()).setScale(1, RoundingMode.HALF_UP);
                BigDecimal skillScore = BigDecimal.valueOf(((Number) body.getOrDefault("skill_score", 0)).doubleValue()).setScale(1, RoundingMode.HALF_UP);
                List<String> matching = (List<String>) body.getOrDefault("matching_skills", List.of());
                List<String> missing = (List<String>) body.getOrDefault("missing_skills", List.of());
                String explanation = (String) body.getOrDefault("explanation", "AI calculated match score based on semantic skills & profile compatibility.");

                return AIMatchScoreResponse.builder()
                        .studentId(studentId)
                        .opportunityId(opportunityId)
                        .overallScore(score)
                        .semanticScore(semantic)
                        .skillProficiencyScore(skillScore)
                        .matchingSkills(matching)
                        .missingSkills(missing)
                        .explanation(explanation)
                        .build();
            }
        } catch (Exception ex) {
            logger.warn("AI microservice call failed for matching, applying resilient fallback: {}", ex.getMessage());
        }

        // Fallback calculation
        return computeFallbackMatch(student, opportunity);
    }

    @Transactional(readOnly = true)
    public AIRecommendationResponse getRecommendations(Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + studentId));

        List<Opportunity> openOpportunities = opportunityRepository.findByStatus(OpportunityStatus.OPEN);

        List<AIRecommendationResponse.RecommendedOpportunityDto> recommendations = openOpportunities.stream()
                .map(opp -> {
                    BigDecimal matchScore = opportunityService.calculateMatchScore(student, opp);
                    OpportunityResponse oppResp = opportunityService.mapToResponse(opp, student);

                    List<String> strengths = student.getStudentSkills().stream()
                            .map(ss -> ss.getSkill().getName())
                            .filter(sName -> opp.getRequiredSkills().stream().anyMatch(rs -> rs.getSkill().getName().equalsIgnoreCase(sName)))
                            .collect(Collectors.toList());

                    String fit = matchScore.doubleValue() >= 80 ? "Exceptional Match for your career trajectory"
                            : matchScore.doubleValue() >= 60 ? "Strong Fit with high growth potential"
                            : "Good Opportunity to expand key skillset";

                    return AIRecommendationResponse.RecommendedOpportunityDto.builder()
                            .opportunity(oppResp)
                            .matchScore(matchScore)
                            .matchReason("Matched on key requirements: " + String.join(", ", strengths.isEmpty() ? List.of("General Profile Alignment") : strengths))
                            .keyStrengths(strengths)
                            .careerTrajectoryFit(fit)
                            .build();
                })
                .sorted((a, b) -> b.getMatchScore().compareTo(a.getMatchScore()))
                .limit(10)
                .collect(Collectors.toList());

        return AIRecommendationResponse.builder()
                .studentId(studentId)
                .recommendations(recommendations)
                .build();
    }

    @Transactional
    public SkillGapResponse getSkillGapAnalysis(Long studentId, Long opportunityId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + studentId));
        Opportunity opportunity = opportunityRepository.findById(opportunityId)
                .orElseThrow(() -> new ResourceNotFoundException("Opportunity not found with ID: " + opportunityId));

        Map<String, StudentSkill> studentSkillMap = student.getStudentSkills().stream()
                .collect(Collectors.toMap(ss -> ss.getSkill().getName().toLowerCase().trim(), ss -> ss, (a, b) -> a));

        List<SkillGapResponse.MissingSkillDto> missingSkills = new ArrayList<>();
        List<SkillGapResponse.LearningResourceDto> roadmap = new ArrayList<>();

        for (OpportunitySkill os : opportunity.getRequiredSkills()) {
            String skillName = os.getSkill().getName();
            String normName = skillName.toLowerCase().trim();

            if (!studentSkillMap.containsKey(normName)) {
                missingSkills.add(SkillGapResponse.MissingSkillDto.builder()
                        .skillName(skillName)
                        .category(os.getSkill().getCategory())
                        .requiredProficiency(os.getRequiredProficiency().name())
                        .currentProficiency("None")
                        .weightage(os.getWeightage())
                        .priority(os.getWeightage().doubleValue() >= 2.0 ? "HIGH" : "MEDIUM")
                        .build());

                roadmap.add(SkillGapResponse.LearningResourceDto.builder()
                        .skill(skillName)
                        .title("Mastering " + skillName + " for Industry Projects")
                        .type("Interactive Course & Practice Project")
                        .estimatedTimeToLearn("2-3 Weeks")
                        .difficulty(os.getRequiredProficiency().name())
                        .resourceUrl("https://www.coursera.org/search?query=" + skillName.replace(" ", "%20"))
                        .build());
            } else {
                StudentSkill ss = studentSkillMap.get(normName);
                if (ss.getProficiencyLevel().ordinal() < os.getRequiredProficiency().ordinal()) {
                    missingSkills.add(SkillGapResponse.MissingSkillDto.builder()
                            .skillName(skillName)
                            .category(os.getSkill().getCategory())
                            .requiredProficiency(os.getRequiredProficiency().name())
                            .currentProficiency(ss.getProficiencyLevel().name())
                            .weightage(os.getWeightage())
                            .priority("MEDIUM")
                            .build());

                    roadmap.add(SkillGapResponse.LearningResourceDto.builder()
                            .skill(skillName)
                            .title("Advanced Techniques in " + skillName)
                            .type("Hands-on Workshop")
                            .estimatedTimeToLearn("1-2 Weeks")
                            .difficulty("Advanced")
                            .resourceUrl("https://github.com/topics/" + skillName.toLowerCase().replace(" ", "-"))
                            .build());
                }
            }
        }

        BigDecimal matchPercentage = opportunityService.calculateMatchScore(student, opportunity);

        String summary = missingSkills.isEmpty()
                ? "You meet 100% of the core skill requirements for this position! We encourage you to submit your application."
                : "You possess a " + matchPercentage + "% match. Focusing on the " + missingSkills.size() + " recommended areas below will significantly elevate your candidacy.";

        return SkillGapResponse.builder()
                .studentId(studentId)
                .opportunityId(opportunityId)
                .opportunityTitle(opportunity.getTitle())
                .companyName(opportunity.getCompany().getName())
                .matchPercentage(matchPercentage)
                .missingSkills(missingSkills)
                .learningRoadmap(roadmap)
                .summary(summary)
                .build();
    }

    @Transactional(readOnly = true)
    public ApplicantRankResponse rankApplicants(Long opportunityId) {
        Opportunity opportunity = opportunityRepository.findById(opportunityId)
                .orElseThrow(() -> new ResourceNotFoundException("Opportunity not found with ID: " + opportunityId));

        List<Application> applications = applicationRepository.findByOpportunity(opportunity);

        List<ApplicantRankResponse.RankedApplicantDto> ranked = applications.stream()
                .map(app -> {
                    Student st = app.getStudent();
                    BigDecimal score = app.getMatchScore() != null ? app.getMatchScore() : opportunityService.calculateMatchScore(st, opportunity);

                    List<String> matching = st.getStudentSkills().stream()
                            .map(ss -> ss.getSkill().getName())
                            .filter(name -> opportunity.getRequiredSkills().stream().anyMatch(os -> os.getSkill().getName().equalsIgnoreCase(name)))
                            .collect(Collectors.toList());

                    List<String> gaps = opportunity.getRequiredSkills().stream()
                            .map(os -> os.getSkill().getName())
                            .filter(name -> st.getStudentSkills().stream().noneMatch(ss -> ss.getSkill().getName().equalsIgnoreCase(name)))
                            .collect(Collectors.toList());

                    String aiRec = score.doubleValue() >= 85 ? "Strongly Recommended: Exceptional profile alignment."
                            : score.doubleValue() >= 65 ? "Recommended: Solid foundation with minor skill gap."
                            : "Potential candidate: Further screening advised.";

                    return ApplicantRankResponse.RankedApplicantDto.builder()
                            .applicationId(app.getId())
                            .studentId(st.getId())
                            .studentName(st.getName())
                            .email(st.getUser().getEmail())
                            .university(st.getUniversity())
                            .resumeUrl((app.getResumeUrl() != null && !app.getResumeUrl().isBlank()) ? app.getResumeUrl() : st.getResumeUrl())
                            .compositeScore(score)
                            .skillMatchScore(score)
                            .experienceRelevanceScore(BigDecimal.valueOf(Math.min(100.0, score.doubleValue() + 5)).setScale(1, RoundingMode.HALF_UP))
                            .topMatchingSkills(matching)
                            .potentialGaps(gaps)
                            .aiRecommendationSummary(aiRec)
                            .status(app.getStatus().name())
                            .build();
                })
                .sorted((a, b) -> b.getCompositeScore().compareTo(a.getCompositeScore()))
                .collect(Collectors.toList());

        for (int i = 0; i < ranked.size(); i++) {
            ranked.get(i).setRank(i + 1);
        }

        return ApplicantRankResponse.builder()
                .opportunityId(opportunityId)
                .totalApplicants(ranked.size())
                .rankedApplicants(ranked)
                .build();
    }

    @Transactional(readOnly = true)
    public CareerSuggestionResponse getCareerSuggestions(Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + studentId));

        List<CareerSuggestionResponse.CareerPathDto> paths = List.of(
                CareerSuggestionResponse.CareerPathDto.builder()
                        .roleTitle("Full Stack AI Software Engineer")
                        .industry("Tech / SaaS / AI")
                        .readinessLevel("High (85%)")
                        .avgMarketDemand("Very High")
                        .transferrableSkills(List.of("Java", "Spring Boot", "React.js", "REST APIs"))
                        .recommendedNextSkills(List.of("LangGraph", "Vector DBs", "Docker"))
                        .build(),
                CareerSuggestionResponse.CareerPathDto.builder()
                        .roleTitle("Cloud Backend Architect")
                        .industry("Enterprise & Cloud")
                        .readinessLevel("Medium (70%)")
                        .avgMarketDemand("High")
                        .transferrableSkills(List.of("Microservices", "PostgreSQL", "System Design"))
                        .recommendedNextSkills(List.of("Kubernetes", "AWS Cloud", "CI/CD"))
                        .build()
        );

        List<CareerSuggestionResponse.ProjectIdeaDto> projects = List.of(
                CareerSuggestionResponse.ProjectIdeaDto.builder()
                        .title("Autonomous Multi-Agent Recruitment Assistant")
                        .description("Build a distributed multi-agent system utilizing LangGraph and Spring Boot to streamline resume indexing and talent match evaluation.")
                        .difficulty("Intermediate to Advanced")
                        .technologiesUsed(List.of("Spring Boot", "FastAPI", "LangGraph", "PostgreSQL"))
                        .portfolioImpact("High - Demonstrates end-to-end full-stack agentic architecture")
                        .build(),
                CareerSuggestionResponse.ProjectIdeaDto.builder()
                        .title("Real-Time Collaborative Code Playground")
                        .description("Create a low-latency collaborative editor using WebSockets, React, and containerized code execution sandboxes.")
                        .difficulty("Intermediate")
                        .technologiesUsed(List.of("React.js", "Docker", "Node.js", "Redis"))
                        .portfolioImpact("High - Highlights distributed systems and real-time frontend synchronization")
                        .build()
        );

        List<String> trending = List.of("LangGraph", "pgvector", "Spring Boot 3", "React 19", "FastAPI", "Kubernetes", "TailwindCSS");

        return CareerSuggestionResponse.builder()
                .studentId(studentId)
                .suggestedPaths(paths)
                .recommendedProjects(projects)
                .trendingSkillsInMarket(trending)
                .build();
    }

    @Transactional
    public AIFeedbackResponse submitFeedback(UserPrincipal principal, AIFeedbackRequest request) {
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        AIFeedback feedback = AIFeedback.builder()
                .user(user)
                .entityType(request.getEntityType())
                .entityId(request.getEntityId())
                .rating(request.getRating())
                .comment(request.getComment())
                .build();

        feedback = aiFeedbackRepository.save(feedback);

        return AIFeedbackResponse.builder()
                .id(feedback.getId())
                .userId(user.getId())
                .entityType(feedback.getEntityType())
                .entityId(feedback.getEntityId())
                .rating(feedback.getRating())
                .comment(feedback.getComment())
                .createdAt(feedback.getCreatedAt())
                .build();
    }

    public RoadmapResponseDto generateRoadmap(String domain, Long studentId) {
        List<String> studentSkills = Collections.emptyList();
        String bio = "";

        if (studentId != null) {
            Optional<Student> studentOpt = studentRepository.findById(studentId);
            if (studentOpt.isPresent()) {
                Student student = studentOpt.get();
                studentSkills = student.getStudentSkills().stream()
                        .map(ss -> ss.getSkill().getName())
                        .collect(Collectors.toList());
                bio = student.getBio() != null ? student.getBio() : "";
            }
        }

        try {
            Map<String, Object> reqBody = new HashMap<>();
            reqBody.put("domain", domain);
            reqBody.put("student_skills", studentSkills);
            reqBody.put("student_bio", bio);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(reqBody, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(
                    aiServiceBaseUrl + "/agent/roadmap",
                    entity,
                    Map.class
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map body = response.getBody();
                return mapToRoadmapResponseDto(body);
            }
        } catch (Exception e) {
            logger.warn("AI service roadmap endpoint failed or timed out: {}. Using resilient fallback roadmap.", e.getMessage());
        }

        return buildFallbackRoadmap(domain);
    }

    @SuppressWarnings("unchecked")
    private RoadmapResponseDto mapToRoadmapResponseDto(Map body) {
        List<Map<String, Object>> rawPhases = (List<Map<String, Object>>) body.getOrDefault("phases", Collections.emptyList());
        List<RoadmapPhaseDto> phases = new ArrayList<>();

        for (Map<String, Object> p : rawPhases) {
            List<Map<String, String>> rawResources = (List<Map<String, String>>) p.getOrDefault("resources", Collections.emptyList());
            List<RoadmapResourceDto> resources = rawResources.stream()
                    .map(r -> RoadmapResourceDto.builder()
                            .name(r.get("name"))
                            .type(r.get("type"))
                            .url(r.get("url"))
                            .description(r.get("description"))
                            .build())
                    .collect(Collectors.toList());

            List<Map<String, Object>> rawProjects = (List<Map<String, Object>>) p.getOrDefault("suggested_projects", Collections.emptyList());
            List<RoadmapProjectDto> projects = rawProjects.stream()
                    .map(prj -> RoadmapProjectDto.builder()
                            .title((String) prj.get("title"))
                            .description((String) prj.get("description"))
                            .difficulty((String) prj.get("difficulty"))
                            .technologies((List<String>) prj.getOrDefault("technologies", Collections.emptyList()))
                            .portfolioImpact((String) prj.get("portfolio_impact"))
                            .build())
                    .collect(Collectors.toList());

            phases.add(RoadmapPhaseDto.builder()
                    .phaseId((String) p.get("phase_id"))
                    .orderIndex((Integer) p.get("order_index"))
                    .title((String) p.get("title"))
                    .duration((String) p.get("duration"))
                    .description((String) p.get("description"))
                    .topics((List<String>) p.getOrDefault("topics", Collections.emptyList()))
                    .resources(resources)
                    .suggestedProjects(projects)
                    .milestones((List<String>) p.getOrDefault("milestones", Collections.emptyList()))
                    .build());
        }

        List<Map<String, Object>> rawCapstones = (List<Map<String, Object>>) body.getOrDefault("capstone_projects", Collections.emptyList());
        List<RoadmapProjectDto> capstones = rawCapstones.stream()
                .map(prj -> RoadmapProjectDto.builder()
                        .title((String) prj.get("title"))
                        .description((String) prj.get("description"))
                        .difficulty((String) prj.get("difficulty"))
                        .technologies((List<String>) prj.getOrDefault("technologies", Collections.emptyList()))
                        .portfolioImpact((String) prj.get("portfolio_impact"))
                        .build())
                .collect(Collectors.toList());

        return RoadmapResponseDto.builder()
                .domainName((String) body.get("domain_name"))
                .overview((String) body.get("overview"))
                .totalDuration((String) body.get("total_duration"))
                .industryDemandSummary((String) body.get("industry_demand_summary"))
                .phases(phases)
                .coreTechnologies((List<String>) body.getOrDefault("core_technologies", Collections.emptyList()))
                .recommendedCertifications((List<String>) body.getOrDefault("recommended_certifications", Collections.emptyList()))
                .capstoneProjects(capstones)
                .adjacentDomains((List<String>) body.getOrDefault("adjacent_domains", Collections.emptyList()))
                .generatedAt(java.time.LocalDateTime.now().toString())
                .isSaved(false)
                .build();
    }

    private RoadmapResponseDto buildFallbackRoadmap(String domain) {
        String cleanDomain = domain.substring(0, 1).toUpperCase() + domain.substring(1);
        List<RoadmapPhaseDto> phases = List.of(
                RoadmapPhaseDto.builder()
                        .phaseId("phase_1")
                        .orderIndex(1)
                        .title("Phase 1: " + cleanDomain + " Foundations & Tooling")
                        .duration("4-6 Weeks")
                        .description("Master core design paradigms, fundamentals, and standard local development environments.")
                        .topics(List.of("Core mental models and architecture of " + cleanDomain, "CLI tools and modern package managers", "Version control & GitHub collaboration"))
                        .resources(List.of(
                                RoadmapResourceDto.builder().name("Official Documentation & Guides").type("Documentation").url("https://docs.github.com").description("Primary reference standards.").build()
                        ))
                        .suggestedProjects(List.of(
                                RoadmapProjectDto.builder().title(cleanDomain + " Starter Sandbox").description("Build a baseline modular project establishing core patterns.").difficulty("Beginner").technologies(List.of(cleanDomain, "Git")).portfolioImpact("Proves foundational fluency.").build()
                        ))
                        .milestones(List.of("Setup development environment", "Push first complete module to GitHub"))
                        .build(),
                RoadmapPhaseDto.builder()
                        .phaseId("phase_2")
                        .orderIndex(2)
                        .title("Phase 2: Intermediate Architecture & Applied Workflows")
                        .duration("6-8 Weeks")
                        .description("Develop robust modular features, data integrations, and test coverage.")
                        .topics(List.of("Framework abstractions and service design", "Database persistence and API contracts", "Unit & integration testing best practices"))
                        .resources(List.of(
                                RoadmapResourceDto.builder().name("Production Best Practices Manual").type("Book").url("").description("Design patterns for maintainable code.").build()
                        ))
                        .suggestedProjects(List.of(
                                RoadmapProjectDto.builder().title(cleanDomain + " End-to-End Service").description("Implement a production-grade service with testing and caching.").difficulty("Intermediate").technologies(List.of(cleanDomain, "PostgreSQL", "Docker")).portfolioImpact("Highlights full-stack capabilities.").build()
                        ))
                        .milestones(List.of("Write comprehensive test suites (>80% coverage)", "Containerize application with Docker"))
                        .build(),
                RoadmapPhaseDto.builder()
                        .phaseId("phase_3")
                        .orderIndex(3)
                        .title("Phase 3: Production Deployment, Observability & Capstones")
                        .duration("6-8 Weeks")
                        .description("Deploy cloud infrastructure, configure CI/CD automation, and build flagship capstone portfolio.")
                        .topics(List.of("Cloud hosting and container orchestration", "Automated CI/CD workflows and monitoring", "System design and technical interview prep"))
                        .resources(List.of(
                                RoadmapResourceDto.builder().name("Cloud & CI/CD Deployment Guides").type("Video Series").url("").description("Automated build and deployment pipelines.").build()
                        ))
                        .suggestedProjects(List.of(
                                RoadmapProjectDto.builder().title("Enterprise " + cleanDomain + " Capstone Platform").description("Distributed high-performance solution solving realistic industry challenges.").difficulty("Advanced").technologies(List.of(cleanDomain, "Cloud", "CI/CD", "Monitoring")).portfolioImpact("Demonstrates senior-level technical depth.").build()
                        ))
                        .milestones(List.of("Deploy live with automated CI/CD", "Prepare architecture diagrams and walkthrough"))
                        .build()
        );

        return RoadmapResponseDto.builder()
                .domainName(cleanDomain)
                .overview(cleanDomain + " is a high-growth engineering discipline emphasizing scalable systems, automated pipelines, and modern user experiences.")
                .totalDuration("4-6 Months (10-15 hrs/week)")
                .industryDemandSummary("Strong industry hiring demand across modern tech enterprises prioritizing verifiable portfolio experience.")
                .phases(phases)
                .coreTechnologies(List.of(cleanDomain, "Git", "Docker", "PostgreSQL", "CI/CD"))
                .recommendedCertifications(List.of("Industry Professional Certification in " + cleanDomain))
                .capstoneProjects(List.of(
                        RoadmapProjectDto.builder().title("Flagship " + cleanDomain + " Platform").description("Comprehensive enterprise system showcasing end-to-end domain mastery.").difficulty("Advanced").technologies(List.of(cleanDomain, "PostgreSQL", "Docker")).portfolioImpact("Strongest signal for technical interviews.").build()
                ))
                .adjacentDomains(List.of("Full Stack Web Development", "Cloud Computing", "DevOps & SRE"))
                .generatedAt(java.time.LocalDateTime.now().toString())
                .isSaved(false)
                .build();
    }

    private AIMatchScoreResponse computeFallbackMatch(Student student, Opportunity opportunity) {
        BigDecimal score = opportunityService.calculateMatchScore(student, opportunity);

        List<String> matching = student.getStudentSkills().stream()
                .map(ss -> ss.getSkill().getName())
                .filter(name -> opportunity.getRequiredSkills().stream().anyMatch(os -> os.getSkill().getName().equalsIgnoreCase(name)))
                .collect(Collectors.toList());

        List<String> missing = opportunity.getRequiredSkills().stream()
                .map(os -> os.getSkill().getName())
                .filter(name -> student.getStudentSkills().stream().noneMatch(ss -> ss.getSkill().getName().equalsIgnoreCase(name)))
                .collect(Collectors.toList());

        String explanation = String.format("Calculated match of %s%% based on %d matching skill requirements out of %d required.",
                score.toString(), matching.size(), opportunity.getRequiredSkills().size());

        return AIMatchScoreResponse.builder()
                .studentId(student.getId())
                .opportunityId(opportunity.getId())
                .overallScore(score)
                .semanticScore(score)
                .skillProficiencyScore(score)
                .matchingSkills(matching)
                .missingSkills(missing)
                .explanation(explanation)
                .build();
    }
}
