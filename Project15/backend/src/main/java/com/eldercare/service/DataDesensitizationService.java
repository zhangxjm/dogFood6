package com.eldercare.service;

import com.eldercare.dto.ElderlyDTO;
import com.eldercare.dto.HealthDataDTO;
import com.eldercare.dto.AlertDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class DataDesensitizationService {

    @Value("${eldercare.desensitization.name-mask:true}")
    private boolean maskName;

    @Value("${eldercare.desensitization.phone-mask:true}")
    private boolean maskPhone;

    @Value("${eldercare.desensitization.id-card-mask:true}")
    private boolean maskIdCard;

    @Value("${eldercare.desensitization.address-mask:true}")
    private boolean maskAddress;

    public ElderlyDTO desensitizeElderly(ElderlyDTO dto) {
        if (dto == null) return null;
        
        if (maskName && dto.getName() != null) {
            dto.setName(maskName(dto.getName()));
        }
        
        if (maskPhone && dto.getPhone() != null) {
            dto.setPhone(maskPhone(dto.getPhone()));
        }
        
        if (maskIdCard && dto.getIdCard() != null) {
            dto.setIdCard(maskIdCard(dto.getIdCard()));
        }
        
        if (maskAddress && dto.getAddress() != null) {
            dto.setAddress(maskAddress(dto.getAddress()));
        }
        
        if (maskPhone && dto.getEmergencyPhone() != null) {
            dto.setEmergencyPhone(maskPhone(dto.getEmergencyPhone()));
        }
        
        return dto;
    }

    public HealthDataDTO desensitizeHealthData(HealthDataDTO dto) {
        if (dto == null) return null;
        
        if (maskName && dto.getElderlyName() != null) {
            dto.setElderlyName(maskName(dto.getElderlyName()));
        }
        
        return dto;
    }

    public AlertDTO desensitizeAlert(AlertDTO dto) {
        if (dto == null) return null;
        
        if (maskName && dto.getElderlyName() != null) {
            dto.setElderlyName(maskName(dto.getElderlyName()));
        }
        
        return dto;
    }

    public String maskName(String name) {
        if (name == null || name.isEmpty()) return name;
        if (name.length() <= 1) return name;
        if (name.length() == 2) return name.charAt(0) + "*";
        return name.charAt(0) + "*".repeat(name.length() - 2) + name.charAt(name.length() - 1);
    }

    public String maskPhone(String phone) {
        if (phone == null || phone.length() < 7) return phone;
        return phone.substring(0, 3) + "****" + phone.substring(phone.length() - 4);
    }

    public String maskIdCard(String idCard) {
        if (idCard == null || idCard.length() < 8) return idCard;
        return idCard.substring(0, 4) + "**********" + idCard.substring(idCard.length() - 4);
    }

    public String maskAddress(String address) {
        if (address == null || address.length() < 6) return address;
        return address.substring(0, 6) + "****";
    }

    public String maskNameOriginal(String name) {
        return name;
    }
}
