package com.petgroom.repository;

import com.petgroom.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MemberRepository extends JpaRepository<Member, Long> {
    List<Member> findByNameContainingOrPhoneContaining(String name, String phone);
}
