package com.ipr.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "evidence")
public class Evidence {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @Column(nullable = false)
    private Long productId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EvidenceType type;

    @Column(nullable = false)
    private String filePath;

    private String fileName;

    private String fileHash;

    private Long fileSize;

    @Column(length = 2000)
    private String description;

    private String notaryId;

    private LocalDateTime notarizedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EvidenceStatus status = EvidenceStatus.COLLECTED;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public Evidence() {
    }

    public enum EvidenceType {
        SCREENSHOT,
        PAGE_SOURCE,
        TRANSACTION_RECORD,
        OTHER
    }

    public enum EvidenceStatus {
        COLLECTED,
        VERIFYING,
        VERIFIED,
        NOTARIZED,
        REJECTED
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public EvidenceType getType() {
        return type;
    }

    public void setType(EvidenceType type) {
        this.type = type;
    }

    public String getFilePath() {
        return filePath;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getFileHash() {
        return fileHash;
    }

    public void setFileHash(String fileHash) {
        this.fileHash = fileHash;
    }

    public Long getFileSize() {
        return fileSize;
    }

    public void setFileSize(Long fileSize) {
        this.fileSize = fileSize;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getNotaryId() {
        return notaryId;
    }

    public void setNotaryId(String notaryId) {
        this.notaryId = notaryId;
    }

    public LocalDateTime getNotarizedAt() {
        return notarizedAt;
    }

    public void setNotarizedAt(LocalDateTime notarizedAt) {
        this.notarizedAt = notarizedAt;
    }

    public EvidenceStatus getStatus() {
        return status;
    }

    public void setStatus(EvidenceStatus status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
