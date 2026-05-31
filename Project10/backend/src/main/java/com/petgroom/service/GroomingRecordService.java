package com.petgroom.service;

import com.petgroom.entity.GroomingRecord;
import com.petgroom.repository.GroomingRecordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class GroomingRecordService {

    @Autowired
    private GroomingRecordRepository groomingRecordRepository;

    @Autowired
    private MemberService memberService;

    public List<GroomingRecord> findAll() {
        return groomingRecordRepository.findAll();
    }

    public Optional<GroomingRecord> findById(Long id) {
        return groomingRecordRepository.findById(id);
    }

    public GroomingRecord save(GroomingRecord record) {
        return groomingRecordRepository.save(record);
    }

    public void deleteById(Long id) {
        groomingRecordRepository.deleteById(id);
    }

    public List<GroomingRecord> findByMemberId(Long memberId) {
        return groomingRecordRepository.findByMemberIdOrderByCreateTimeDesc(memberId);
    }

    public List<GroomingRecord> findByPetId(Long petId) {
        return groomingRecordRepository.findByPetIdOrderByCreateTimeDesc(petId);
    }

    public List<GroomingRecord> findByStatus(String status) {
        return groomingRecordRepository.findByStatus(status);
    }

    public List<GroomingRecord> findByDateRange(LocalDateTime start, LocalDateTime end) {
        return groomingRecordRepository.findByCreateTimeBetweenOrderByCreateTimeDesc(start, end);
    }

    public GroomingRecord startGrooming(GroomingRecord record) {
        record.setStatus("进行中");
        record.setStartTime(LocalDateTime.now());
        return groomingRecordRepository.save(record);
    }

    public GroomingRecord completeGrooming(Long id, String notes) {
        Optional<GroomingRecord> recordOpt = groomingRecordRepository.findById(id);
        if (recordOpt.isPresent()) {
            GroomingRecord record = recordOpt.get();
            record.setStatus("已完成");
            record.setEndTime(LocalDateTime.now());
            if (notes != null) {
                record.setNotes(notes);
            }
            if (record.getStartTime() != null) {
                long minutes = java.time.Duration.between(record.getStartTime(), record.getEndTime()).toMinutes();
                record.setDurationMinutes((int) minutes);
            }
            memberService.incrementGroomingCount(record.getMemberId());
            return groomingRecordRepository.save(record);
        }
        return null;
    }

    public long getMemberCompletedCount(Long memberId) {
        return groomingRecordRepository.countCompletedByMemberId(memberId);
    }
}
