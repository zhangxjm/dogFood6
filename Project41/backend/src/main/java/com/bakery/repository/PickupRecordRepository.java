package com.bakery.repository;

import com.bakery.entity.PickupRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PickupRecordRepository extends JpaRepository<PickupRecord, Long> {
    Optional<PickupRecord> findByOrderId(Long orderId);
    Optional<PickupRecord> findByOrderNo(String orderNo);
    Optional<PickupRecord> findByPickupCode(String pickupCode);
}
