package com.eldercare.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "elderly")
public class Elderly {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(length = 10)
    private String gender;

    private Integer age;

    @Column(length = 50)
    private String phone;

    @Column(length = 100)
    private String address;

    @Column(length = 50)
    private String idCard;

    @Column(length = 200)
    private String medicalHistory;

    @Column(length = 100)
    private String emergencyContact;

    @Column(length = 20)
    private String emergencyPhone;

    @Column(nullable = false)
    private Integer status = 1;

    private LocalDateTime createTime;
    private LocalDateTime updateTime;

    @PrePersist
    protected void onCreate() {
        createTime = LocalDateTime.now();
        updateTime = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updateTime = LocalDateTime.now();
    }
}
