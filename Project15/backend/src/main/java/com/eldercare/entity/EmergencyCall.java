package com.eldercare.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "emergency_call")
public class EmergencyCall {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "elderly_id")
    private Long elderlyId;

    @Column(length = 20)
    private String callType;

    @Column(length = 200)
    private String callContent;

    @Column(length = 20)
    private String callStatus;

    @Column(length = 50)
    private String contactName;

    @Column(length = 20)
    private String contactPhone;

    private LocalDateTime callTime;

    private LocalDateTime handleTime;

    @Column(length = 200)
    private String handleResult;

    private LocalDateTime createTime;

    @PrePersist
    protected void onCreate() {
        createTime = LocalDateTime.now();
        if (callTime == null) {
            callTime = LocalDateTime.now();
        }
        if (callStatus == null) {
            callStatus = "PENDING";
        }
    }
}
