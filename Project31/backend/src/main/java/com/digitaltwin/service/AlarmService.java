package com.digitaltwin.service;

import com.digitaltwin.entity.Alarm;
import com.digitaltwin.repository.AlarmRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AlarmService {

    @Autowired
    private AlarmRepository alarmRepository;

    public List<Alarm> getAllAlarms() {
        return alarmRepository.findAll();
    }

    public List<Alarm> getActiveAlarms() {
        return alarmRepository.findActiveAlarms();
    }

    public List<Alarm> getAlarmsByDevice(String deviceCode) {
        return alarmRepository.findByDeviceCodeOrderByAlarmTimeDesc(deviceCode);
    }

    public Alarm resolveAlarm(Long alarmId, String resolveNote) {
        Alarm alarm = alarmRepository.findById(alarmId).orElse(null);
        if (alarm != null) {
            alarm.setStatus("RESOLVED");
            alarm.setResolveTime(LocalDateTime.now());
            alarm.setResolveNote(resolveNote);
            return alarmRepository.save(alarm);
        }
        return null;
    }

    public long getActiveAlarmCount() {
        Long count = alarmRepository.countActiveAlarms();
        return count != null ? count : 0;
    }
}
