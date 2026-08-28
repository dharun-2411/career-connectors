package com.careerconnectors.config;

import com.careerconnectors.entity.*;
import com.careerconnectors.enums.*;
import com.careerconnectors.repository.*;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataSeeder.class);

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final CompanyRepository companyRepository;
    private final AdminRepository adminRepository;
    private final SkillRepository skillRepository;
    private final StudentSkillRepository studentSkillRepository;
    private final OpportunityRepository opportunityRepository;
    private final OpportunitySkillRepository opportunitySkillRepository;
    private final ApplicationRepository applicationRepository;
    private final TrendingDomainRepository trendingDomainRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 0) {
            logger.info("Database already seeded with {} users. Skipping seeder.", userRepository.count());
            return;
        }

        logger.info("Seeding Career Connectors database with initial taxonomy, accounts, and opportunities...");

        // 1. Seed Skills
        Skill java = getOrCreateSkill("Java", "Programming");
        Skill python = getOrCreateSkill("Python", "Programming");
        Skill js = getOrCreateSkill("JavaScript", "Programming");
        Skill ts = getOrCreateSkill("TypeScript", "Programming");
        Skill springBoot = getOrCreateSkill("Spring Boot", "Framework");
        Skill react = getOrCreateSkill("React.js", "Framework");
        Skill fastApi = getOrCreateSkill("FastAPI", "Framework");
        Skill tailwind = getOrCreateSkill("TailwindCSS", "Framework");
        Skill docker = getOrCreateSkill("Docker", "Cloud/DevOps");
        Skill k8s = getOrCreateSkill("Kubernetes", "Cloud/DevOps");
        Skill aws = getOrCreateSkill("AWS", "Cloud/DevOps");
        Skill postgres = getOrCreateSkill("PostgreSQL", "Database");
        Skill ml = getOrCreateSkill("Machine Learning", "AI/Data Science");
        Skill deepLearning = getOrCreateSkill("Deep Learning", "AI/Data Science");
        Skill langGraph = getOrCreateSkill("LangGraph / LangChain", "AI/Data Science");
        Skill restApi = getOrCreateSkill("RESTful APIs", "Architecture");
        Skill systemDesign = getOrCreateSkill("System Design", "Architecture");

        String defaultPass = passwordEncoder.encode("password123");
        String adminPass = passwordEncoder.encode("admin123");

        // 2. Seed Admin
        User adminUser = userRepository.save(User.builder()
                .email("admin@careerconnectors.io")
                .passwordHash(adminPass)
                .role(Role.ROLE_ADMIN)
                .status(UserStatus.ACTIVE)
                .build());

        adminRepository.save(Admin.builder()
                .user(adminUser)
                .name("Platform Administrator")
                .department("University Relations & Quality Assurance")
                .build());

        // 3. Seed Companies
        // Company 1: Nexus AI
        User compUser1 = userRepository.save(User.builder()
                .email("recruiter@nexusai.com")
                .passwordHash(defaultPass)
                .role(Role.ROLE_COMPANY)
                .status(UserStatus.ACTIVE)
                .build());

        Company nexusAi = companyRepository.save(Company.builder()
                .user(compUser1)
                .name("Nexus AI Technologies")
                .industry("Artificial Intelligence & Enterprise Software")
                .website("https://nexusai.example.com")
                .location("San Francisco, CA")
                .description("Pioneering enterprise AI workflows and autonomous agents for next-generation intelligence.")
                .logoUrl("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80")
                .verificationStatus(VerificationStatus.VERIFIED)
                .documentsUrl("https://docs.nexusai.example.com/certificate.pdf")
                .build());

        // Company 2: CloudScale Systems
        User compUser2 = userRepository.save(User.builder()
                .email("hiring@cloudscale.io")
                .passwordHash(defaultPass)
                .role(Role.ROLE_COMPANY)
                .status(UserStatus.ACTIVE)
                .build());

        Company cloudScale = companyRepository.save(Company.builder()
                .user(compUser2)
                .name("CloudScale Systems")
                .industry("Cloud Infrastructure & DevOps")
                .website("https://cloudscale.example.com")
                .location("Seattle, WA")
                .description("Ultra-reliable distributed cloud infrastructure and microservice acceleration platform.")
                .logoUrl("https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=150&auto=format&fit=crop&q=80")
                .verificationStatus(VerificationStatus.VERIFIED)
                .build());

        // Company 3: Fintech Innovations (Pending Verification)
        User compUser3 = userRepository.save(User.builder()
                .email("talent@fintechinnovations.com")
                .passwordHash(defaultPass)
                .role(Role.ROLE_COMPANY)
                .status(UserStatus.ACTIVE)
                .build());

        Company fintech = companyRepository.save(Company.builder()
                .user(compUser3)
                .name("FinTech Innovations Corp")
                .industry("Financial Technology & Web3")
                .website("https://fintechinnovations.example.com")
                .location("New York, NY")
                .description("Next generation decentralized finance analytics and real-time payment rails.")
                .logoUrl("https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=150&auto=format&fit=crop&q=80")
                .verificationStatus(VerificationStatus.PENDING)
                .documentsUrl("https://docs.fintech.example.com/registration.pdf")
                .build());

        // 4. Seed Students
        // Student 1: Alex Chen
        User stuUser1 = userRepository.save(User.builder()
                .email("alex.chen@university.edu")
                .passwordHash(defaultPass)
                .role(Role.ROLE_STUDENT)
                .status(UserStatus.ACTIVE)
                .build());

        Student alex = studentRepository.save(Student.builder()
                .user(stuUser1)
                .name("Alex Chen")
                .phone("+1 (555) 234-5678")
                .dob(LocalDate.of(2002, 5, 14))
                .education("B.S. Computer Science")
                .university("University of Washington")
                .graduationYear(2025)
                .bio("Passionate full-stack developer with hands-on experience building reactive web apps and scalable Java backend services.")
                .githubUrl("https://github.com/alexchen-dev")
                .linkedinUrl("https://linkedin.com/in/alexchen-tech")
                .portfolioUrl("https://alexchen.dev")
                .resumeUrl("https://careerconnectors.s3.amazonaws.com/resumes/alex_chen_resume.pdf")
                .build());

        studentSkillRepository.saveAll(List.of(
                StudentSkill.builder().student(alex).skill(java).proficiencyLevel(SkillProficiency.ADVANCED).source(SkillSource.MANUAL).isVerified(true).build(),
                StudentSkill.builder().student(alex).skill(springBoot).proficiencyLevel(SkillProficiency.ADVANCED).source(SkillSource.MANUAL).isVerified(true).build(),
                StudentSkill.builder().student(alex).skill(react).proficiencyLevel(SkillProficiency.INTERMEDIATE).source(SkillSource.MANUAL).isVerified(true).build(),
                StudentSkill.builder().student(alex).skill(postgres).proficiencyLevel(SkillProficiency.INTERMEDIATE).source(SkillSource.MANUAL).isVerified(true).build(),
                StudentSkill.builder().student(alex).skill(docker).proficiencyLevel(SkillProficiency.BEGINNER).source(SkillSource.AI_EXTRACTED).isVerified(false).build(),
                StudentSkill.builder().student(alex).skill(restApi).proficiencyLevel(SkillProficiency.ADVANCED).source(SkillSource.MANUAL).isVerified(true).build()
        ));

        // Student 2: Maya Patel
        User stuUser2 = userRepository.save(User.builder()
                .email("maya.patel@stanford.edu")
                .passwordHash(defaultPass)
                .role(Role.ROLE_STUDENT)
                .status(UserStatus.ACTIVE)
                .build());

        Student maya = studentRepository.save(Student.builder()
                .user(stuUser2)
                .name("Maya Patel")
                .phone("+1 (555) 876-5432")
                .dob(LocalDate.of(2001, 11, 20))
                .education("M.S. Artificial Intelligence")
                .university("Stanford University")
                .graduationYear(2025)
                .bio("AI researcher and engineer focused on LLM reasoning architectures, LangGraph agent workflows, and vector embeddings.")
                .githubUrl("https://github.com/mayapatel-ai")
                .linkedinUrl("https://linkedin.com/in/mayapatel")
                .resumeUrl("https://careerconnectors.s3.amazonaws.com/resumes/maya_patel_resume.pdf")
                .build());

        studentSkillRepository.saveAll(List.of(
                StudentSkill.builder().student(maya).skill(python).proficiencyLevel(SkillProficiency.EXPERT).source(SkillSource.MANUAL).isVerified(true).build(),
                StudentSkill.builder().student(maya).skill(ml).proficiencyLevel(SkillProficiency.ADVANCED).source(SkillSource.MANUAL).isVerified(true).build(),
                StudentSkill.builder().student(maya).skill(deepLearning).proficiencyLevel(SkillProficiency.ADVANCED).source(SkillSource.MANUAL).isVerified(true).build(),
                StudentSkill.builder().student(maya).skill(fastApi).proficiencyLevel(SkillProficiency.ADVANCED).source(SkillSource.MANUAL).isVerified(true).build(),
                StudentSkill.builder().student(maya).skill(langGraph).proficiencyLevel(SkillProficiency.ADVANCED).source(SkillSource.AI_EXTRACTED).isVerified(true).build()
        ));

        // 5. Seed Opportunities
        // Opportunity 1: Full Stack AI Intern @ Nexus AI
        Opportunity opp1 = opportunityRepository.save(Opportunity.builder()
                .company(nexusAi)
                .title("Full Stack AI Engineering Intern")
                .description("Join Nexus AI to build agentic UI workflows and high-throughput Python/React pipelines. You will collaborate directly with our founding engineering team.")
                .type(OpportunityType.INTERNSHIP)
                .location("San Francisco, CA")
                .isRemote(true)
                .stipend("$5,500 / month")
                .duration("3 Months (Summer)")
                .experienceLevel(ExperienceLevel.ENTRY_LEVEL)
                .status(OpportunityStatus.OPEN)
                .deadline(LocalDate.now().plusMonths(2))
                .build());

        opportunitySkillRepository.saveAll(List.of(
                OpportunitySkill.builder().opportunity(opp1).skill(react).weightage(BigDecimal.valueOf(2.5)).requiredProficiency(SkillProficiency.INTERMEDIATE).build(),
                OpportunitySkill.builder().opportunity(opp1).skill(python).weightage(BigDecimal.valueOf(3.0)).requiredProficiency(SkillProficiency.INTERMEDIATE).build(),
                OpportunitySkill.builder().opportunity(opp1).skill(fastApi).weightage(BigDecimal.valueOf(2.0)).requiredProficiency(SkillProficiency.INTERMEDIATE).build(),
                OpportunitySkill.builder().opportunity(opp1).skill(langGraph).weightage(BigDecimal.valueOf(1.5)).requiredProficiency(SkillProficiency.BEGINNER).build()
        ));

        // Opportunity 2: Cloud Backend Engineer @ CloudScale Systems
        Opportunity opp2 = opportunityRepository.save(Opportunity.builder()
                .company(cloudScale)
                .title("Junior Cloud Backend Engineer")
                .description("Help build resilient, low-latency microservices with Spring Boot, PostgreSQL, and Docker. Perfect for graduates with strong core Java fundamentals.")
                .type(OpportunityType.FULL_TIME)
                .location("Seattle, WA")
                .isRemote(false)
                .stipend("$95,000 - $115,000 / year")
                .duration("Permanent")
                .experienceLevel(ExperienceLevel.JUNIOR)
                .status(OpportunityStatus.OPEN)
                .deadline(LocalDate.now().plusMonths(1))
                .build());

        opportunitySkillRepository.saveAll(List.of(
                OpportunitySkill.builder().opportunity(opp2).skill(java).weightage(BigDecimal.valueOf(3.0)).requiredProficiency(SkillProficiency.ADVANCED).build(),
                OpportunitySkill.builder().opportunity(opp2).skill(springBoot).weightage(BigDecimal.valueOf(3.0)).requiredProficiency(SkillProficiency.ADVANCED).build(),
                OpportunitySkill.builder().opportunity(opp2).skill(postgres).weightage(BigDecimal.valueOf(2.0)).requiredProficiency(SkillProficiency.INTERMEDIATE).build(),
                OpportunitySkill.builder().opportunity(opp2).skill(docker).weightage(BigDecimal.valueOf(1.5)).requiredProficiency(SkillProficiency.INTERMEDIATE).build(),
                OpportunitySkill.builder().opportunity(opp2).skill(restApi).weightage(BigDecimal.valueOf(1.5)).requiredProficiency(SkillProficiency.ADVANCED).build()
        ));

        // Opportunity 3: Machine Learning Research Fellow @ Nexus AI
        Opportunity opp3 = opportunityRepository.save(Opportunity.builder()
                .company(nexusAi)
                .title("Machine Learning Research Fellow")
                .description("Conduct research in multi-agent orchestration, synthetic data generation, and context compression algorithms.")
                .type(OpportunityType.PROJECT)
                .location("Remote")
                .isRemote(true)
                .stipend("$6,000 / month")
                .duration("6 Months")
                .experienceLevel(ExperienceLevel.ENTRY_LEVEL)
                .status(OpportunityStatus.OPEN)
                .deadline(LocalDate.now().plusMonths(3))
                .build());

        opportunitySkillRepository.saveAll(List.of(
                OpportunitySkill.builder().opportunity(opp3).skill(python).weightage(BigDecimal.valueOf(3.0)).requiredProficiency(SkillProficiency.EXPERT).build(),
                OpportunitySkill.builder().opportunity(opp3).skill(ml).weightage(BigDecimal.valueOf(3.0)).requiredProficiency(SkillProficiency.ADVANCED).build(),
                OpportunitySkill.builder().opportunity(opp3).skill(deepLearning).weightage(BigDecimal.valueOf(2.5)).requiredProficiency(SkillProficiency.ADVANCED).build()
        ));

        // 6. Seed Sample Applications
        applicationRepository.save(Application.builder()
                .student(alex)
                .opportunity(opp2)
                .status(ApplicationStatus.UNDER_REVIEW)
                .matchScore(BigDecimal.valueOf(88.5))
                .coverLetter("I am very passionate about building high-performance distributed systems in Spring Boot and would love to contribute to CloudScale.")
                .build());

        applicationRepository.save(Application.builder()
                .student(maya)
                .opportunity(opp1)
                .status(ApplicationStatus.SHORTLISTED)
                .matchScore(BigDecimal.valueOf(92.0))
                .coverLetter("My research in LangGraph multi-agent architectures and FastAPI aligns seamlessly with Nexus AI's vision.")
                .build());

        // 7. Seed Trending Domains
        if (trendingDomainRepository.count() == 0) {
            trendingDomainRepository.saveAll(List.of(
                    TrendingDomain.builder().domainName("Cloud Computing").description("Architect, deploy, and scale resilient infrastructure on AWS, Azure, and Google Cloud.").category("Cloud").popularityTag("High demand").iconName("Cloud").displayOrder(1).build(),
                    TrendingDomain.builder().domainName("AI & Machine Learning").description("Develop generative models, deep neural networks, and agentic workflows with PyTorch & LLMs.").category("AI/Data").popularityTag("Fast growing").iconName("Sparkles").displayOrder(2).build(),
                    TrendingDomain.builder().domainName("Data Science").description("Extract predictive insights, analyze large-scale datasets, and build machine learning pipelines.").category("AI/Data").popularityTag("High demand").iconName("BarChart3").displayOrder(3).build(),
                    TrendingDomain.builder().domainName("Cybersecurity").description("Defend corporate networks, audit application vulnerabilities, and implement zero-trust architectures.").category("Security").popularityTag("Top salary").iconName("ShieldCheck").displayOrder(4).build(),
                    TrendingDomain.builder().domainName("DevOps & SRE").description("Automate CI/CD pipelines, container orchestration with Kubernetes, and maintain high availability.").category("Engineering").popularityTag("High demand").iconName("Layers").displayOrder(5).build(),
                    TrendingDomain.builder().domainName("Full Stack Web Development").description("Build modern end-to-end applications using React, Spring Boot, Node.js, and PostgreSQL.").category("Engineering").popularityTag("High demand").iconName("Code2").displayOrder(6).build(),
                    TrendingDomain.builder().domainName("Data Engineering").description("Construct reliable data pipelines, distributed warehouses, and stream processing with Kafka and Spark.").category("AI/Data").popularityTag("High salary").iconName("Database").displayOrder(7).build(),
                    TrendingDomain.builder().domainName("MLOps").description("Bridge machine learning and operations by automating model deployment, monitoring, and feature stores.").category("AI/Data").popularityTag("Emerging tech").iconName("Cpu").displayOrder(8).build(),
                    TrendingDomain.builder().domainName("Cloud Security").description("Secure multi-cloud environments, IAM policies, and automated compliance frameworks.").category("Security").popularityTag("High demand").iconName("Lock").displayOrder(9).build(),
                    TrendingDomain.builder().domainName("Blockchain & Web3").description("Engineer decentralized smart contracts, consensus mechanisms, and Web3 dApps.").category("Engineering").popularityTag("Emerging tech").iconName("Link2").displayOrder(10).build(),
                    TrendingDomain.builder().domainName("UI/UX Design").description("Design intuitive, accessibility-first digital user experiences, wireframes, and design systems in Figma.").category("Design").popularityTag("Creative").iconName("Palette").displayOrder(11).build(),
                    TrendingDomain.builder().domainName("Product Management").description("Lead cross-functional engineering teams, define product roadmaps, and drive market product-market fit.").category("Management").popularityTag("High impact").iconName("Target").displayOrder(12).build()
            ));
        }

        logger.info("Database seeding completed successfully!");
    }

    private Skill getOrCreateSkill(String name, String category) {
        return skillRepository.findByNameIgnoreCase(name)
                .orElseGet(() -> skillRepository.save(Skill.builder().name(name).category(category).build()));
    }
}
