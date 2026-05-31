package com.inspection.dto;

public class LineStatistics {
    private Long lineId;
    private String lineName;
    private Long totalInspected;
    private Long passed;
    private Long failed;
    private Double passRate;

    public LineStatistics() {
    }

    public LineStatistics(Long lineId, String lineName, Long totalInspected, Long passed, Long failed, Double passRate) {
        this.lineId = lineId;
        this.lineName = lineName;
        this.totalInspected = totalInspected;
        this.passed = passed;
        this.failed = failed;
        this.passRate = passRate;
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

    public Long getTotalInspected() {
        return totalInspected;
    }

    public void setTotalInspected(Long totalInspected) {
        this.totalInspected = totalInspected;
    }

    public Long getPassed() {
        return passed;
    }

    public void setPassed(Long passed) {
        this.passed = passed;
    }

    public Long getFailed() {
        return failed;
    }

    public void setFailed(Long failed) {
        this.failed = failed;
    }

    public Double getPassRate() {
        return passRate;
    }

    public void setPassRate(Double passRate) {
        this.passRate = passRate;
    }
}
