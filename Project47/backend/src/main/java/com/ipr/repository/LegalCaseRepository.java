package com.ipr.repository;

import com.ipr.entity.LegalCase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LegalCaseRepository extends JpaRepository<LegalCase, Long> {
    Optional<LegalCase> findByCaseNumber(String caseNumber);
    
    List<LegalCase> findByStatus(LegalCase.CaseStatus status);
    
    List<LegalCase> findByProductId(Long productId);
    
    List<LegalCase> findByCaseType(LegalCase.CaseType caseType);
    
    long countByStatus(LegalCase.CaseStatus status);
}
