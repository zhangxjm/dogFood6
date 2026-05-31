package com.eldercare.repository;

import com.eldercare.entity.HealthAlert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface HealthAlertRepository extends JpaRepository<HealthAlert, Long> {
    List<HealthAlert> findByElderlyIdOrderByAlertTimeDesc(Long elderlyId);
    List<HealthAlert> findByAlertStatusOrderByAlertTimeDesc(String alertStatus);
    List<HealthAlert> findByElderlyIdAndAlertStatusOrderByAlertTimeDesc(Long elderlyId, String alertStatus);
    List<HealthAlert> findAllByOrderByAlertTimeDesc();
}
