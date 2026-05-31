package com.ipr.repository;

import com.ipr.entity.Evidence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EvidenceRepository extends JpaRepository<Evidence, Long> {
    List<Evidence> findByProductId(Long productId);
    
    List<Evidence> findByStatus(Evidence.EvidenceStatus status);
    
    List<Evidence> findByProductIdAndStatus(Long productId, Evidence.EvidenceStatus status);
    
    long countByStatus(Evidence.EvidenceStatus status);
}
