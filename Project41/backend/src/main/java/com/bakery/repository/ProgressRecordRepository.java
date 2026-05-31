package com.bakery.repository;

import com.bakery.entity.ProgressRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProgressRecordRepository extends JpaRepository<ProgressRecord, Long> {
    List<ProgressRecord> findByOrderIdOrderByCreatedAtDesc(Long orderId);
    List<ProgressRecord> findByOrderNoOrderByCreatedAtDesc(String orderNo);
}
