package com.inspection.dto;

public class AlertDTO {
    private String id;
    private String type;
    private String level;
    private String title;
    private String message;
    private Long lineId;
    private String lineName;
    private String timestamp;
    private boolean read;

    public AlertDTO() {
    }

    public AlertDTO(String id, String type, String level, String title, String message, Long lineId, String lineName, String timestamp, boolean read) {
        this.id = id;
        this.type = type;
        this.level = level;
        this.title = title;
        this.message = message;
        this.lineId = lineId;
        this.lineName = lineName;
        this.timestamp = timestamp;
        this.read = read;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getLevel() {
        return level;
    }

    public void setLevel(String level) {
        this.level = level;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Long getLineId() {
        return lineId;
    }

    public void setLineId(Long lineId) {
        this.lineId = lineId;
    }

    public String getLineName() {
        return lineName;
    }

    public void setLineName(String lineName) {
        this.lineName = lineName;
    }

    public String getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }

    public boolean isRead() {
        return read;
    }

    public void setRead(boolean read) {
        this.read = read;
    }
}
