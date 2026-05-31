package com.bakery.service;

import com.bakery.entity.Dessert;
import com.bakery.entity.Order;
import com.bakery.entity.ProgressRecord;
import com.bakery.repository.OrderRepository;
import com.bakery.repository.DessertRepository;
import com.bakery.repository.ProgressRecordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.Random;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private DessertRepository dessertRepository;

    @Autowired
    private ProgressRecordRepository progressRecordRepository;

    public List<Order> findAll() {
        List<Order> orders = orderRepository.findAll();
        orders.forEach(this::populateDessertName);
        return orders;
    }

    public Optional<Order> findById(Long id) {
        Optional<Order> order = orderRepository.findById(id);
        order.ifPresent(this::populateDessertName);
        return order;
    }

    public Optional<Order> findByOrderNo(String orderNo) {
        Optional<Order> order = orderRepository.findByOrderNo(orderNo);
        order.ifPresent(this::populateDessertName);
        return order;
    }

    public List<Order> findByStatus(String status) {
        List<Order> orders = orderRepository.findByStatus(status);
        orders.forEach(this::populateDessertName);
        return orders;
    }

    public List<Order> findByProgressStatus(String progressStatus) {
        List<Order> orders = orderRepository.findByProgressStatus(progressStatus);
        orders.forEach(this::populateDessertName);
        return orders;
    }

    public List<Order> search(String keyword) {
        List<Order> orders = orderRepository.findByOrderNoContainingOrCustomerNameContaining(keyword, keyword);
        orders.forEach(this::populateDessertName);
        return orders;
    }

    private void populateDessertName(Order order) {
        if (order.getDessertId() != null) {
            dessertRepository.findById(order.getDessertId()).ifPresent(dessert -> {
                order.setDessertName(dessert.getName());
            });
        }
    }

    public Order save(Order order) {
        if (order.getOrderNo() == null || order.getOrderNo().isEmpty()) {
            order.setOrderNo(generateOrderNo());
        }
        if (order.getTotalPrice() == null) {
            order.setTotalPrice(order.getUnitPrice() * order.getQuantity());
        }
        if (order.getStatus() == null) {
            order.setStatus("PENDING");
        }
        if (order.getProgressStatus() == null) {
            order.setProgressStatus("WAITING");
        }

        Order savedOrder = orderRepository.save(order);

        ProgressRecord progressRecord = new ProgressRecord();
        progressRecord.setOrderId(savedOrder.getId());
        progressRecord.setOrderNo(savedOrder.getOrderNo());
        progressRecord.setStatus("WAITING");
        progressRecord.setRemark("订单已创建，等待制作");
        progressRecord.setOperator("系统");
        progressRecordRepository.save(progressRecord);

        return savedOrder;
    }

    public Order updateStatus(Long id, String status) {
        Optional<Order> existing = orderRepository.findById(id);
        if (existing.isPresent()) {
            Order order = existing.get();
            order.setStatus(status);
            return orderRepository.save(order);
        }
        return null;
    }

    public Order updateProgress(Long id, String progressStatus, String remark) {
        Optional<Order> existing = orderRepository.findById(id);
        if (existing.isPresent()) {
            Order order = existing.get();
            order.setProgressStatus(progressStatus);
            Order updatedOrder = orderRepository.save(order);

            ProgressRecord progressRecord = new ProgressRecord();
            progressRecord.setOrderId(order.getId());
            progressRecord.setOrderNo(order.getOrderNo());
            progressRecord.setStatus(progressStatus);
            progressRecord.setRemark(remark);
            progressRecord.setOperator("管理员");
            progressRecordRepository.save(progressRecord);

            return updatedOrder;
        }
        return null;
    }

    public void delete(Long id) {
        orderRepository.deleteById(id);
    }

    private String generateOrderNo() {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
        String datePart = LocalDateTime.now().format(formatter);
        Random random = new Random();
        int randomPart = random.nextInt(10000);
        return "ORD" + datePart + String.format("%04d", randomPart);
    }

    public String generatePickupCode() {
        Random random = new Random();
        return String.format("%06d", random.nextInt(1000000));
    }
}
