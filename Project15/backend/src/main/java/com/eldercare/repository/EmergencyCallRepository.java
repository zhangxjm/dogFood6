package com.eldercare.repository;

import com.eldercare.entity.EmergencyCall;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EmergencyCallRepository extends JpaRepository<EmergencyCall, Long> {
    List<EmergencyCall> findByElderlyIdOrderByCallTimeDesc(Long elderlyId);
    List<EmergencyCall> findByCallStatusOrderByCallTimeDesc(String callStatus);
}
