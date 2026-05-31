package com.ipr.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "legal_cases")
public class LegalCase {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @Column(nullable = false, unique = true)
    private String caseNumber;

    @Column(nullable = false)
    private Long productId;

    @Column(nullable = false)
    private String caseTitle;

    @Column(length = 3008)
    private String caseDescription;

    private String plaintiff;

    private String defendant;

    private String attorney;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CaseStatus status = CaseStatus.DRAFT;

    @Enumerated(EnumType.STRING)
    private CaseType caseType = CaseType.TRADEMARK;

    private LocalDateTime filedAt;

    private LocalDateTime courtDate;

    private LocalDateTime closedAt;

    @Column(length = 1000)
    private String result;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public LegalCase() {
    }

    public enum CaseStatus {
        DRAFT,
        PREPARING,
        FILED,
        HEARING,
        JUDGEMENT,
        APPEAL,
        CLOSED_WON,
        CLOSED_LOST,
        SETTLED
    }

    public enum CaseType {
        TRADEMARK,
        COPYRIGHT,
        PATENT,
        COUNTERFEIT,
        OTHER
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

    public String getCaseNumber() {
        return caseNumber;
    }

    public void setCaseNumber(String caseNumber) {
        this.caseNumber = caseNumber;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public String getCaseTitle() {
        return caseTitle;
    }

    public void setCaseTitle(String caseTitle) {
        this.caseTitle = caseTitle;
    }

    public String getCaseDescription() {
        return caseDescription;
    }

    public void setCaseDescription(String caseDescription) {
        this.caseDescription = caseDescription;
    }

    public String getPlaintiff() {
        return plaintiff;
    }

    public void setPlaintiff(String plaintiff) {
        this.plaintiff = plaintiff;
    }

    public String getDefendant() {
        return defendant;
    }

    public void setDefendant(String defendant) {
        this.defendant = defendant;
    }

    public String getAttorney() {
        return attorney;
    }

    public void setAttorney(String attorney) {
        this.attorney = attorney;
    }

    public CaseStatus getStatus() {
        return status;
    }

    public void setStatus(CaseStatus status) {
        this.status = status;
    }

    public CaseType getCaseType() {
        return caseType;
    }

    public void setCaseType(CaseType caseType) {
        this.caseType = caseType;
    }

    public LocalDateTime getFiledAt() {
        return filedAt;
    }

    public void setFiledAt(LocalDateTime filedAt) {
        this.filedAt = filedAt;
    }

    public LocalDateTime getCourtDate() {
        return courtDate;
    }

    public void setCourtDate(LocalDateTime courtDate) {
        this.courtDate = courtDate;
    }

    public LocalDateTime getClosedAt() {
        return closedAt;
    }

    public void setClosedAt(LocalDateTime closedAt) {
        this.closedAt = closedAt;
    }

    public String getResult() {
        return result;
    }

    public void setResult(String result) {
        this.result = result;
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
