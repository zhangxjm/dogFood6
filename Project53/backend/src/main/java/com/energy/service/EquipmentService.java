package com.energy.service;

import com.energy.entity.Equipment;
import com.energy.repository.EquipmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class EquipmentService {

    private final EquipmentRepository equipmentRepository;

    public List<Equipment> findAll() {
        return equipmentRepository.findAll();
    }

    public Optional<Equipment> findById(Long id) {
        return equipmentRepository.findById(id);
    }

    public Optional<Equipment> findByCode(String code) {
        return equipmentRepository.findByCode(code);
    }

    public Equipment save(Equipment equipment) {
        return equipmentRepository.save(equipment);
    }

    public void deleteById(Long id) {
        equipmentRepository.deleteById(id);
    }

    public List<Equipment> findByStatus(String status) {
        return equipmentRepository.findByStatus(status);
    }

    public List<Equipment> findByType(String type) {
        return equipmentRepository.findByType(type);
    }
}
