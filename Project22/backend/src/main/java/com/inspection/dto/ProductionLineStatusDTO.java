package com.inspection.dto;

public class ProductionLineStatusDTO {
    private Long lineId;
    private String lineName;
    private String status;
    private Double speed;
    private Long totalInspectedToday;
    private Long passedToday;
    private Long failedToday;
    private Double passRate;
    private Integer cameraCount;
    private Integer activeCameraCount;

    public ProductionLineStatusDTO() {
    }

    public ProductionLineStatusDTO(Long lineId, String lineName, String status, Double speed, Long totalInspectedToday, Long passedToday, Long failedToday, Double passRate, Integer cameraCount, Integer activeCameraCount) {
        this.lineId = lineId;
        this.lineName = lineName;
        this.status = status;
        this.speed = speed;
        this.totalInspectedToday = totalInspectedToday;
        this.passedToday = passedToday;
        this.failedToday = failedToday;
        this.passRate = passRate;
        this.cameraCount = cameraCount;
        this.activeCameraCount = activeCameraCount;
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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Double getSpeed() {
        return speed;
    }

    public void setSpeed(Double speed) {
        this.speed = speed;
    }

    public Long getTotalInspectedToday() {
        return totalInspectedToday;
    }

    public void setTotalInspectedToday(Long totalInspectedToday) {
        this.totalInspectedToday = totalInspectedToday;
    }

    public Long getPassedToday() {
        return passedToday;
    }

    public void setPassedToday(Long passedToday) {
        this.passedToday = passedToday;
    }

    public Long getFailedToday() {
        return failedToday;
    }

    public void setFailedToday(Long failedToday) {
        this.failedToday = failedToday;
    }

    public Double getPassRate() {
        return passRate;
    }

    public void setPassRate(Double passRate) {
        this.passRate = passRate;
    }

    public Integer getCameraCount() {
        return cameraCount;
    }

    public void setCameraCount(Integer cameraCount) {
        this.cameraCount = cameraCount;
    }

    public Integer getActiveCameraCount() {
        return activeCameraCount;
    }

    public void setActiveCameraCount(Integer activeCameraCount) {
        this.activeCameraCount = activeCameraCount;
    }
}
