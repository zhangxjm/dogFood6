package com.inspection.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "edge_nodes")
public class EdgeNode {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private String ipAddress;

    private Double cpuUsage;

    private Double memoryUsage;

    private Double inferenceLatency;

    private String status;

    public EdgeNode() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getIpAddress() {
        return ipAddress;
    }

    public void setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
    }

    public Double getCpuUsage() {
        return cpuUsage;
    }

    public void setCpuUsage(Double cpuUsage) {
        this.cpuUsage = cpuUsage;
    }

    public Double getMemoryUsage() {
        return memoryUsage;
    }

    public void setMemoryUsage(Double memoryUsage) {
        this.memoryUsage = memoryUsage;
    }

    public Double getInferenceLatency() {
        return inferenceLatency;
    }

    public void setInferenceLatency(Double inferenceLatency) {
        this.inferenceLatency = inferenceLatency;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
