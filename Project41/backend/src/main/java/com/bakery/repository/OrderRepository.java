package com.bakery.repository;

import com.bakery.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    Optional<Order> findByOrderNo(String orderNo);
    List<Order> findByCustomerPhone(String customerPhone);
    List<Order> findByStatus(String status);
    List<Order> findByProgressStatus(String progressStatus);
    List<Order> findByOrderNoContainingOrCustomerNameContaining(String orderNo, String customerName);
}
