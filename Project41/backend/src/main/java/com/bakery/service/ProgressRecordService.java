package com.bakery.service;

import com.bakery.entity.ProgressRecord;
import com.bakery.repository.ProgressRecordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProgressRecordService {

    @Autowired
    private ProgressRecordRepository progressRecordRepository;

    public List<ProgressRecord> findAll() {
        return progressRecordRepository.findAll();
    }

    public Optional<ProgressRecord> findById(Long id) {
        return progressRecordRepository.findById(id);
    }

    public List<ProgressRecord> findByOrderId(Long orderId) {
        return progressRecordRepository.findByOrderIdOrderByCreatedAtDesc(orderId);
    }

    public List<ProgressRecord> findByOrderNo(String orderNo) {
        return progressRecordRepository.findByOrderNoOrderByCreatedAtDesc(orderNo);
    }

    public ProgressRecord save(ProgressRecord progressRecord) {
        return progressRecordRepository.save(progressRecord);
    }

    public void delete(Long id) {
        progressRecordRepository.deleteById(id);
    }
}
