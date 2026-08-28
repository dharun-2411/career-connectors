package com.careerconnectors;

import com.careerconnectors.entity.*;
import com.careerconnectors.enums.OpportunityStatus;
import com.careerconnectors.enums.OpportunityType;
import com.careerconnectors.enums.SkillProficiency;
import com.careerconnectors.repository.ApplicationRepository;
import com.careerconnectors.repository.CompanyRepository;
import com.careerconnectors.repository.OpportunityRepository;
import com.careerconnectors.repository.OpportunitySkillRepository;
import com.careerconnectors.repository.StudentRepository;
import com.careerconnectors.service.OpportunityService;
import com.careerconnectors.service.SkillService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class OpportunityServiceTest {

    @Mock
    private OpportunityRepository opportunityRepository;
    @Mock
    private OpportunitySkillRepository opportunitySkillRepository;
    @Mock
    private CompanyRepository companyRepository;
    @Mock
    private StudentRepository studentRepository;
    @Mock
    private ApplicationRepository applicationRepository;
    @Mock
    private SkillService skillService;

    @InjectMocks
    private OpportunityService opportunityService;

    @Test
    void calculateMatchScore_ExactMatch() {
        Skill javaSkill = Skill.builder().id(1L).name("Java").category("Programming").build();
        Skill springSkill = Skill.builder().id(2L).name("Spring Boot").category("Framework").build();

        Student student = Student.builder().id(1L).build();
        student.setStudentSkills(List.of(
                StudentSkill.builder().student(student).skill(javaSkill).proficiencyLevel(SkillProficiency.ADVANCED).build(),
                StudentSkill.builder().student(student).skill(springSkill).proficiencyLevel(SkillProficiency.ADVANCED).build()
        ));

        Opportunity opportunity = Opportunity.builder().id(10L).title("Java Developer").status(OpportunityStatus.OPEN).type(OpportunityType.FULL_TIME).location("Remote").build();
        opportunity.setRequiredSkills(List.of(
                OpportunitySkill.builder().opportunity(opportunity).skill(javaSkill).weightage(BigDecimal.valueOf(2.0)).requiredProficiency(SkillProficiency.ADVANCED).build(),
                OpportunitySkill.builder().opportunity(opportunity).skill(springSkill).weightage(BigDecimal.valueOf(2.0)).requiredProficiency(SkillProficiency.ADVANCED).build()
        ));

        BigDecimal score = opportunityService.calculateMatchScore(student, opportunity);

        assertNotNull(score);
        assertEquals(BigDecimal.valueOf(100.0).setScale(1), score);
    }

    @Test
    void calculateMatchScore_PartialMatch() {
        Skill javaSkill = Skill.builder().id(1L).name("Java").category("Programming").build();
        Skill pythonSkill = Skill.builder().id(2L).name("Python").category("Programming").build();

        Student student = Student.builder().id(1L).build();
        student.setStudentSkills(List.of(
                StudentSkill.builder().student(student).skill(javaSkill).proficiencyLevel(SkillProficiency.ADVANCED).build()
        ));

        Opportunity opportunity = Opportunity.builder().id(10L).title("Backend Polyglot").status(OpportunityStatus.OPEN).type(OpportunityType.FULL_TIME).location("Remote").build();
        opportunity.setRequiredSkills(List.of(
                OpportunitySkill.builder().opportunity(opportunity).skill(javaSkill).weightage(BigDecimal.valueOf(1.0)).requiredProficiency(SkillProficiency.ADVANCED).build(),
                OpportunitySkill.builder().opportunity(opportunity).skill(pythonSkill).weightage(BigDecimal.valueOf(1.0)).requiredProficiency(SkillProficiency.ADVANCED).build()
        ));

        BigDecimal score = opportunityService.calculateMatchScore(student, opportunity);

        assertNotNull(score);
        assertEquals(BigDecimal.valueOf(50.0).setScale(1), score);
    }
}
