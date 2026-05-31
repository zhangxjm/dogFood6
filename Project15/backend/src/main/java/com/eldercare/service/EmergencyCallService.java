package com.eldercare.service;

import com.eldercare.entity.EmergencyCall;
import com.eldercare.entity.Elderly;
import com.eldercare.entity.FamilyMember;
import com.eldercare.repository.EmergencyCallRepository;
import com.eldercare.repository.ElderlyRepository;
import com.eldercare.repository.FamilyMemberRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmergencyCallService {
    private final EmergencyCallRepository emergencyCallRepository;
    private final ElderlyRepository elderlyRepository;
    private final FamilyMemberRepository familyMemberRepository;
    private final WebSocketService webSocketService;

    public List<EmergencyCall> listByElderly(Long elderlyId) {
        return emergencyCallRepository.findByElderlyIdOrderByCallTimeDesc(elderlyId);
    }

    public List<EmergencyCall> listPending() {
        return emergencyCallRepository.findByCallStatusOrderByCallTimeDesc("PENDING");
    }

    public EmergencyCall createEmergencyCall(Long elderlyId, String callType, String callContent) {
        EmergencyCall call = new EmergencyCall();
        call.setElderlyId(elderlyId);
        call.setCallType(callType);
        call.setCallContent(callContent);
        call.setCallStatus("PENDING");
        call.setCallTime(LocalDateTime.now());

        elderlyRepository.findById(elderlyId).ifPresent(elderly -> {
            call.setContactName(elderly.getEmergencyContact());
            call.setContactPhone(elderly.getEmergencyPhone());
        });

        EmergencyCall saved = emergencyCallRepository.save(call);
        webSocketService.broadcastEmergencyCall(saved);
        return saved;
    }

    public EmergencyCall handleEmergencyCall(Long id, String handleResult) {
        return emergencyCallRepository.findById(id)
                .map(call -> {
                    call.setCallStatus("HANDLED");
                    call.setHandleTime(LocalDateTime.now());
                    call.setHandleResult(handleResult);
                    return emergencyCallRepository.save(call);
                })
                .orElse(null);
    }

    public Map<String, Object> getEmergencyCallDetails(Long id) {
        Map<String, Object> details = new HashMap<>();
        emergencyCallRepository.findById(id).ifPresent(call -> {
            details.put("call", call);
            elderlyRepository.findById(call.getElderlyId()).ifPresent(elderly -> {
                Map<String, Object> elderlyInfo = new HashMap<>();
                elderlyInfo.put("id", elderly.getId());
                elderlyInfo.put("name", elderly.getName());
                elderlyInfo.put("phone", elderly.getPhone());
                elderlyInfo.put("address", elderly.getAddress());
                elderlyInfo.put("medicalHistory", elderly.getMedicalHistory());
                elderlyInfo.put("emergencyContact", elderly.getEmergencyContact());
                elderlyInfo.put("emergencyPhone", elderly.getEmergencyPhone());
                details.put("elderly", elderlyInfo);
            });
            List<FamilyMember> familyMembers = familyMemberRepository.findByElderlyId(call.getElderlyId());
            if (!familyMembers.isEmpty()) {
                details.put("familyMembers", familyMembers);
            }
        });
        return details;
    }
}
