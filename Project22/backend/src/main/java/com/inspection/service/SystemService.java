package com.inspection.service;

import com.inspection.entity.DefectType;
import com.inspection.entity.SystemSetting;
import com.inspection.entity.User;
import com.inspection.repository.DefectTypeRepository;
import com.inspection.repository.SystemSettingRepository;
import com.inspection.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SystemService {

    private static final Logger log = LoggerFactory.getLogger(SystemService.class);

    private final UserRepository userRepository;
    private final DefectTypeRepository defectTypeRepository;
    private final SystemSettingRepository settingRepository;

    public SystemService(UserRepository userRepository, DefectTypeRepository defectTypeRepository, SystemSettingRepository settingRepository) {
        this.userRepository = userRepository;
        this.defectTypeRepository = defectTypeRepository;
        this.settingRepository = settingRepository;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User createUser(User user) {
        return userRepository.save(user);
    }

    public User updateUser(Long id, User user) {
        user.setId(id);
        return userRepository.save(user);
    }

    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    public List<DefectType> getAllDefectTypes() {
        return defectTypeRepository.findAll();
    }

    public DefectType createDefectType(DefectType defectType) {
        return defectTypeRepository.save(defectType);
    }

    public DefectType updateDefectType(Long id, DefectType defectType) {
        defectType.setId(id);
        return defectTypeRepository.save(defectType);
    }

    public void deleteDefectType(Long id) {
        defectTypeRepository.deleteById(id);
    }

    public List<SystemSetting> getAllSettings() {
        return settingRepository.findAll();
    }

    public SystemSetting updateSetting(String key, String value) {
        SystemSetting setting = settingRepository.findAll().stream()
            .filter(s -> key.equals(s.getSettingKey()))
            .findFirst()
            .orElseGet(() -> {
                SystemSetting s = new SystemSetting();
                s.setSettingKey(key);
                return s;
            });
        setting.setSettingValue(value);
        return settingRepository.save(setting);
    }
}
