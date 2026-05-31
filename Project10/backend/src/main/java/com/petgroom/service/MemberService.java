package com.petgroom.service;

import com.petgroom.entity.Member;
import com.petgroom.repository.MemberRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class MemberService {

    @Autowired
    private MemberRepository memberRepository;

    public List<Member> findAll() {
        return memberRepository.findAll();
    }

    public Optional<Member> findById(Long id) {
        return memberRepository.findById(id);
    }

    public Member save(Member member) {
        if (member.getTotalGroomingCount() == null) {
            member.setTotalGroomingCount(0);
        }
        return memberRepository.save(member);
    }

    public void deleteById(Long id) {
        memberRepository.deleteById(id);
    }

    public List<Member> search(String keyword) {
        return memberRepository.findByNameContainingOrPhoneContaining(keyword, keyword);
    }

    public void incrementGroomingCount(Long memberId) {
        Optional<Member> memberOpt = memberRepository.findById(memberId);
        if (memberOpt.isPresent()) {
            Member member = memberOpt.get();
            member.setTotalGroomingCount(member.getTotalGroomingCount() + 1);
            memberRepository.save(member);
        }
    }
}
