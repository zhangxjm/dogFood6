package com.bakery.service;

import com.bakery.entity.Order;
import com.bakery.entity.PickupRecord;
import com.bakery.repository.OrderRepository;
import com.bakery.repository.PickupRecordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PickupRecordService {

    @Autowired
    private PickupRecordRepository pickupRecordRepository;

    @Autowired
    private OrderRepository orderRepository;

    public List<PickupRecord> findAll() {
        return pickupRecordRepository.findAll();
    }

    public Optional<PickupRecord> findById(Long id) {
        return pickupRecordRepository.findById(id);
    }

    public Optional<PickupRecord> findByOrderId(Long orderId) {
        return pickupRecordRepository.findByOrderId(orderId);
    }

    public Optional<PickupRecord> findByOrderNo(String orderNo) {
        return pickupRecordRepository.findByOrderNo(orderNo);
    }

    public Optional<PickupRecord> findByPickupCode(String pickupCode) {
        return pickupRecordRepository.findByPickupCode(pickupCode);
    }

    public PickupRecord createPickupRecord(Long orderId, String pickupCode) {
        Optional<Order> orderOpt = orderRepository.findById(orderId);
        if (orderOpt.isPresent()) {
            Order order = orderOpt.get();

            Optional<PickupRecord> existing = pickupRecordRepository.findByOrderId(orderId);
            if (existing.isPresent()) {
                return existing.get();
            }

            PickupRecord pickupRecord = new PickupRecord();
            pickupRecord.setOrderId(order.getId());
            pickupRecord.setOrderNo(order.getOrderNo());
            pickupRecord.setCustomerName(order.getCustomerName());
            pickupRecord.setCustomerPhone(order.getCustomerPhone());
            pickupRecord.setPickupCode(pickupCode);
            pickupRecord.setOperator("系统");
            pickupRecord.setRemark("订单已完成制作，等待自提");

            order.setProgressStatus("READY");
            order.setStatus("READY");
            orderRepository.save(order);

            return pickupRecordRepository.save(pickupRecord);
        }
        return null;
    }

    public PickupRecord verifyPickup(String pickupCode) {
        Optional<PickupRecord> recordOpt = pickupRecordRepository.findByPickupCode(pickupCode);
        if (recordOpt.isPresent()) {
            PickupRecord pickupRecord = recordOpt.get();

            Optional<Order> orderOpt = orderRepository.findById(pickupRecord.getOrderId());
            if (orderOpt.isPresent()) {
                Order order = orderOpt.get();
                order.setProgressStatus("PICKED_UP");
                order.setStatus("COMPLETED");
                orderRepository.save(order);
            }

            pickupRecord.setRemark("已完成自提核销");
            return pickupRecordRepository.save(pickupRecord);
        }
        return null;
    }

    public PickupRecord save(PickupRecord pickupRecord) {
        return pickupRecordRepository.save(pickupRecord);
    }

    public void delete(Long id) {
        pickupRecordRepository.deleteById(id);
    }
}
