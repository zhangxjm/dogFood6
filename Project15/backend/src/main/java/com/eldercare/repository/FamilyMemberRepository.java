package com.eldercare.repository;

import com.eldercare.entity.FamilyMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FamilyMemberRepository extends JpaRepository<FamilyMember, Long> {
    List<FamilyMember> findByElderlyId(Long elderlyId);
    List<FamilyMember> findByElderlyIdAndStatus(Long elderlyId, Integer status);
}
