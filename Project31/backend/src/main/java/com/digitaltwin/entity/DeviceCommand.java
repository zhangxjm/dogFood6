package com.digitaltwin.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "device_commands")
public class DeviceCommand {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String deviceCode;

    @Column(nullable = false)
    private String commandType;

    @Column(nullable = false)
    private String commandData;

    private String status = "PENDING";

    private String result;

    private LocalDateTime executeTime;

    private LocalDateTime createTime;

    private String operator;

    @PrePersist
    protected void onCreate() {
        createTime = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getDeviceCode() { return deviceCode; }
    public void setDeviceCode(String deviceCode) { this.deviceCode = deviceCode; }

    public String getCommandType() { return commandType; }
    public void setCommandType(String commandType) { this.commandType = commandType; }

    public String getCommandData() { return commandData; }
    public void setCommandData(String commandData) { this.commandData = commandData; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getResult() { return result; }
    public void setResult(String result) { this.result = result; }

    public LocalDateTime getExecuteTime() { return executeTime; }
    public void setExecuteTime(LocalDateTime executeTime) { this.executeTime = executeTime; }

    public LocalDateTime getCreateTime() { return createTime; }
    public void setCreateTime(LocalDateTime createTime) { this.createTime = createTime; }

    public String getOperator() { return operator; }
    public void setOperator(String operator) { this.operator = operator; }
}
