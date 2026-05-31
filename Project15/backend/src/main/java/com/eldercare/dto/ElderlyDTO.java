package com.eldercare.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ElderlyDTO {
    private Long id;
    private String name;
    private String gender;
    private Integer age;
    private String phone;
    private String address;
    private String idCard;
    private String medicalHistory;
    private String emergencyContact;
    private String emergencyPhone;
    private Integer status;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
