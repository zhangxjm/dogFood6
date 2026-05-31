package com.bakery.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "pickup_records")
public class PickupRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_id", nullable = false, unique = true)
    private Long orderId;

    @Column(name = "order_no", nullable = false, length = 50)
    private String orderNo;

    @Column(name = "customer_name", nullable = false, length = 50)
    private String customerName;

    @Column(name = "customer_phone", nullable = false, length = 20)
    private String customerPhone;

    @Column(name = "pickup_code", nullable = false, length = 20)
    private String pickupCode;

    @Column(name = "pickup_time")
    private LocalDateTime pickupTime;

    @Column(name = "operator", length = 50)
    private String operator;

    @Column(length = 500)
    private String remark;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (pickupTime == null) {
            pickupTime = LocalDateTime.now();
        }
    }
}
