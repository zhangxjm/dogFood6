package com.inspection.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "sorting_rules")
public class SortingRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private String defectSeverity;

    private String action;

    private Integer priority;

    private Long lineId;

    private Boolean enabled;

    public SortingRule() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDefectSeverity() {
        return defectSeverity;
    }

    public void setDefectSeverity(String defectSeverity) {
        this.defectSeverity = defectSeverity;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public Integer getPriority() {
        return priority;
    }

    public void setPriority(Integer priority) {
        this.priority = priority;
    }

    public Long getLineId() {
        return lineId;
    }

    public void setLineId(Long lineId) {
        this.lineId = lineId;
    }

    public Boolean getEnabled() {
        return enabled;
    }

    public void setEnabled(Boolean enabled) {
        this.enabled = enabled;
    }
}
