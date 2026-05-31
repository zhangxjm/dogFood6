package com.eldercare.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "family_member")
public class FamilyMember {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "elderly_id")
    private Long elderlyId;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(length = 20)
    private String relationship;

    @Column(length = 20)
    private String phone;

    @Column(length = 50)
    private String email;

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
