package com.inspection.dto;

public class DefectDistribution {
    private String defectName;
    private String defectSeverity;
    private String colorCode;
    private Long count;
    private Double percentage;

    public DefectDistribution() {
    }

    public DefectDistribution(String defectName, String defectSeverity, String colorCode, Long count, Double percentage) {
        this.defectName = defectName;
        this.defectSeverity = defectSeverity;
        this.colorCode = colorCode;
        this.count = count;
        this.percentage = percentage;
    }

    public String getDefectName() {
        return defectName;
    }

    public void setDefectName(String defectName) {
        this.defectName = defectName;
    }

    public String getDefectSeverity() {
        return defectSeverity;
    }

    public void setDefectSeverity(String defectSeverity) {
        this.defectSeverity = defectSeverity;
    }

    public String getColorCode() {
        return colorCode;
    }

    public void setColorCode(String colorCode) {
        this.colorCode = colorCode;
    }

    public Long getCount() {
        return count;
    }

    public void setCount(Long count) {
        this.count = count;
    }

    public Double getPercentage() {
        return percentage;
    }

    public void setPercentage(Double percentage) {
        this.percentage = percentage;
    }
}
