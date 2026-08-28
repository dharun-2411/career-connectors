package com.careerconnectors.repository;

import com.careerconnectors.entity.AIFeedback;
import com.careerconnectors.entity.User;
import com.careerconnectors.enums.AIFeedbackType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AIFeedbackRepository extends JpaRepository<AIFeedback, Long> {
    List<AIFeedback> findByUser(User user);
    List<AIFeedback> findByEntityTypeAndEntityId(AIFeedbackType entityType, Long entityId);
}
