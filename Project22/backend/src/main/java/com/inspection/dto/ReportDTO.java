package com.inspection.dto;

import java.util.List;

public class ReportDTO {
    private String periodType;
    private String startDate;
    private String endDate;
    private Long totalInspected;
    private Long passed;
    private Long failed;
    private Double passRate;
    private List<TrendDataPoint> trendData;
    private List<DefectDistribution> defectDistribution;
    private List<LineStatistics> lineStatistics;

    public ReportDTO() {
    }

    public ReportDTO(String periodType, String startDate, String endDate, Long totalInspected, Long passed, Long failed, Double passRate, List<TrendDataPoint> trendData, List<DefectDistribution> defectDistribution, List<LineStatistics> lineStatistics) {
        this.periodType = periodType;
        this.startDate = startDate;
        this.endDate = endDate;
        this.totalInspected = totalInspected;
        this.passed = passed;
        this.failed = failed;
        this.passRate = passRate;
        this.trendData = trendData;
        this.defectDistribution = defectDistribution;
        this.lineStatistics = lineStatistics;
    }

    public String getPeriodType() {
        return periodType;
    }

    public void setPeriodType(String periodType) {
        this.periodType = periodType;
    }

    public String getStartDate() {
        return startDate;
    }

    public void setStartDate(String startDate) {
        this.startDate = startDate;
    }

    public String getEndDate() {
        return endDate;
    }

    public void setEndDate(String endDate) {
        this.endDate = endDate;
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

    public List<TrendDataPoint> getTrendData() {
        return trendData;
    }

    public void setTrendData(List<TrendDataPoint> trendData) {
        this.trendData = trendData;
    }

    public List<DefectDistribution> getDefectDistribution() {
        return defectDistribution;
    }

    public void setDefectDistribution(List<DefectDistribution> defectDistribution) {
        this.defectDistribution = defectDistribution;
    }

    public List<LineStatistics> getLineStatistics() {
        return lineStatistics;
    }

    public void setLineStatistics(List<LineStatistics> lineStatistics) {
        this.lineStatistics = lineStatistics;
    }
}
