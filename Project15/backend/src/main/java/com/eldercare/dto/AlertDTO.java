package com.eldercare.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class AlertDTO {
    private Long id;
    private Long elderlyId;
    private Long deviceId;
    private String elderlyName;
    private String alertType;
    private String alertContent;
    private String alertLevel;
    private String alertStatus;
    private String alertValue;
    private LocalDateTime alertTime;
    private LocalDateTime handleTime;
    private String handleResult;
    private LocalDateTime createTime;
}
