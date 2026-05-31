package com.digitaltwin.dto;

public class AlarmResolveRequest {

    private Long alarmId;
    private String resolveNote;

    public Long getAlarmId() { return alarmId; }
    public void setAlarmId(Long alarmId) { this.alarmId = alarmId; }

    public String getResolveNote() { return resolveNote; }
    public void setResolveNote(String resolveNote) { this.resolveNote = resolveNote; }
}
