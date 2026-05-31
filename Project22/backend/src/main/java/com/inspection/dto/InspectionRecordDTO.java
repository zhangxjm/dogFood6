package com.inspection.dto;

import java.time.LocalDateTime;

public class InspectionRecordDTO {
    private Long id;
    private Long lineId;
    private String lineName;
    private Long cameraId;
    private String cameraName;
    private Long defectTypeId;
    private String defectTypeName;
    private String defectSeverity;
    private String defectColorCode;
    private Long modelId;
    private String modelName;
    private String result;
    private Double confidence;
    private String imagePath;
    private String annotatedImagePath;
    private LocalDateTime inspectedAt;

    public InspectionRecordDTO() {
    }

    public InspectionRecordDTO(Long id, Long lineId, String lineName, Long cameraId, String cameraName, Long defectTypeId, String defectTypeName, String defectSeverity, String defectColorCode, Long modelId, String modelName, String result, Double confidence, String imagePath, String annotatedImagePath, LocalDateTime inspectedAt) {
        this.id = id;
        this.lineId = lineId;
        this.lineName = lineName;
        this.cameraId = cameraId;
        this.cameraName = cameraName;
        this.defectTypeId = defectTypeId;
        this.defectTypeName = defectTypeName;
        this.defectSeverity = defectSeverity;
        this.defectColorCode = defectColorCode;
        this.modelId = modelId;
        this.modelName = modelName;
        this.result = result;
        this.confidence = confidence;
        this.imagePath = imagePath;
        this.annotatedImagePath = annotatedImagePath;
        this.inspectedAt = inspectedAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public Long getCameraId() {
        return cameraId;
    }

    public void setCameraId(Long cameraId) {
        this.cameraId = cameraId;
    }

    public String getCameraName() {
        return cameraName;
    }

    public void setCameraName(String cameraName) {
        this.cameraName = cameraName;
    }

    public Long getDefectTypeId() {
        return defectTypeId;
    }

    public void setDefectTypeId(Long defectTypeId) {
        this.defectTypeId = defectTypeId;
    }

    public String getDefectTypeName() {
        return defectTypeName;
    }

    public void setDefectTypeName(String defectTypeName) {
        this.defectTypeName = defectTypeName;
    }

    public String getDefectSeverity() {
        return defectSeverity;
    }

    public void setDefectSeverity(String defectSeverity) {
        this.defectSeverity = defectSeverity;
    }

    public String getDefectColorCode() {
        return defectColorCode;
    }

    public void setDefectColorCode(String defectColorCode) {
        this.defectColorCode = defectColorCode;
    }

    public Long getModelId() {
        return modelId;
    }

    public void setModelId(Long modelId) {
        this.modelId = modelId;
    }

    public String getModelName() {
        return modelName;
    }

    public void setModelName(String modelName) {
        this.modelName = modelName;
    }

    public String getResult() {
        return result;
    }

    public void setResult(String result) {
        this.result = result;
    }

    public Double getConfidence() {
        return confidence;
    }

    public void setConfidence(Double confidence) {
        this.confidence = confidence;
    }

    public String getImagePath() {
        return imagePath;
    }

    public void setImagePath(String imagePath) {
        this.imagePath = imagePath;
    }

    public String getAnnotatedImagePath() {
        return annotatedImagePath;
    }

    public void setAnnotatedImagePath(String annotatedImagePath) {
        this.annotatedImagePath = annotatedImagePath;
    }

    public LocalDateTime getInspectedAt() {
        return inspectedAt;
    }

    public void setInspectedAt(LocalDateTime inspectedAt) {
        this.inspectedAt = inspectedAt;
    }
}