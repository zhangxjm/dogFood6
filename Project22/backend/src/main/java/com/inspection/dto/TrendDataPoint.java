package com.inspection.dto;

public class TrendDataPoint {
    private String date;
    private Long total;
    private Long passed;
    private Long failed;
    private Double passRate;

    public TrendDataPoint() {
    }

    public TrendDataPoint(String date, Long total, Long passed, Long failed, Double passRate) {
        this.date = date;
        this.total = total;
        this.passed = passed;
        this.failed = failed;
        this.passRate = passRate;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public Long getTotal() {
        return total;
    }

    public void setTotal(Long total) {
        this.total = total;
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
