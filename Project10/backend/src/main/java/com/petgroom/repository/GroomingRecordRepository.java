package com.petgroom.repository;

import com.petgroom.entity.GroomingRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface GroomingRecordRepository extends JpaRepository<GroomingRecord, Long> {
    List<GroomingRecord> findByMemberIdOrderByCreateTimeDesc(Long memberId);
    List<GroomingRecord> findByPetIdOrderByCreateTimeDesc(Long petId);
    List<GroomingRecord> findByStatus(String status);
    List<GroomingRecord> findByCreateTimeBetweenOrderByCreateTimeDesc(LocalDateTime start, LocalDateTime end);
    
    @Query("SELECT COUNT(g) FROM GroomingRecord g WHERE g.memberId = :memberId AND g.status = '已完成'")
    long countCompletedByMemberId(@Param("memberId") Long memberId);
}
