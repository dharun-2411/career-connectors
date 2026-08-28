package com.careerconnectors.repository;

import com.careerconnectors.entity.Opportunity;
import com.careerconnectors.entity.OpportunitySkill;
import com.careerconnectors.entity.Skill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OpportunitySkillRepository extends JpaRepository<OpportunitySkill, Long> {
    List<OpportunitySkill> findByOpportunity(Opportunity opportunity);
    List<OpportunitySkill> findByOpportunityId(Long opportunityId);
    Optional<OpportunitySkill> findByOpportunityAndSkill(Opportunity opportunity, Skill skill);
    void deleteByOpportunityAndSkill(Opportunity opportunity, Skill skill);
}
