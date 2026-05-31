package com.eldercare.service;

import com.eldercare.dto.*;
import com.eldercare.entity.*;
import com.eldercare.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ElderlyService {
    private final ElderlyRepository elderlyRepository;
    private final FamilyMemberRepository familyMemberRepository;
    private final DataDesensitizationService desensitizationService;

    public List<ElderlyDTO> list() {
        return elderlyRepository.findByStatus(1).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public ElderlyDTO getById(Long id) {
        return elderlyRepository.findById(id)
                .map(this::convertToDTO)
                .orElse(null);
    }

    public ElderlyDTO create(ElderlyDTO dto) {
        Elderly elderly = new Elderly();
        BeanUtils.copyProperties(dto, elderly);
        elderly.setStatus(1);
        Elderly saved = elderlyRepository.save(elderly);
        return convertToDTO(saved);
    }

    public ElderlyDTO update(Long id, ElderlyDTO dto) {
        return elderlyRepository.findById(id)
                .map(elderly -> {
                    if (dto.getName() != null) elderly.setName(dto.getName());
                    if (dto.getGender() != null) elderly.setGender(dto.getGender());
                    if (dto.getAge() != null) elderly.setAge(dto.getAge());
                    if (dto.getPhone() != null) elderly.setPhone(dto.getPhone());
                    if (dto.getAddress() != null) elderly.setAddress(dto.getAddress());
                    if (dto.getMedicalHistory() != null) elderly.setMedicalHistory(dto.getMedicalHistory());
                    if (dto.getEmergencyContact() != null) elderly.setEmergencyContact(dto.getEmergencyContact());
                    if (dto.getEmergencyPhone() != null) elderly.setEmergencyPhone(dto.getEmergencyPhone());
                    Elderly saved = elderlyRepository.save(elderly);
                    return convertToDTO(saved);
                })
                .orElse(null);
    }

    public void delete(Long id) {
        elderlyRepository.findById(id).ifPresent(elderly -> {
            elderly.setStatus(0);
            elderlyRepository.save(elderly);
        });
    }

    private ElderlyDTO convertToDTO(Elderly elderly) {
        ElderlyDTO dto = new ElderlyDTO();
        BeanUtils.copyProperties(elderly, dto);
        return desensitizationService.desensitizeElderly(dto);
    }
}
