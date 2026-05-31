package com.bakery.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "progress_records")
public class ProgressRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_id", nullable = false)
    private Long orderId;

    @Column(name = "order_no", length = 50)
    private String orderNo;

    @Column(name = "status", nullable = false, length = 50)
    private String status;

    @Column(length = 500)
    private String remark;

    @Column(name = "operator", length = 50)
    private String operator;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
