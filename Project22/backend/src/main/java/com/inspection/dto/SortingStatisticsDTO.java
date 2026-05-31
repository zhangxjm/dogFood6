package com.inspection.dto;

public class SortingStatisticsDTO {
    private Long totalProcessed;
    private Long passCount;
    private Long reworkCount;
    private Long rejectCount;
    private Double passRate;

    public SortingStatisticsDTO() {
    }

    public SortingStatisticsDTO(Long totalProcessed, Long passCount, Long reworkCount, Long rejectCount, Double passRate) {
        this.totalProcessed = totalProcessed;
        this.passCount = passCount;
        this.reworkCount = reworkCount;
        this.rejectCount = rejectCount;
        this.passRate = passRate;
    }

    public Long getTotalProcessed() {
        return totalProcessed;
    }

    public void setTotalProcessed(Long totalProcessed) {
        this.totalProcessed = totalProcessed;
    }

    public Long getPassCount() {
        return passCount;
    }

    public void setPassCount(Long passCount) {
        this.passCount = passCount;
    }

    public Long getReworkCount() {
        return reworkCount;
    }

    public void setReworkCount(Long reworkCount) {
        this.reworkCount = reworkCount;
    }

    public Long getRejectCount() {
        return rejectCount;
    }

    public void setRejectCount(Long rejectCount) {
        this.rejectCount = rejectCount;
    }

    public Double getPassRate() {
        return passRate;
    }

    public void setPassRate(Double passRate) {
        this.passRate = passRate;
    }
}
