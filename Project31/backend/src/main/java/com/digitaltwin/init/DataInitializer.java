package com.digitaltwin.init;

import com.digitaltwin.entity.Device;
import com.digitaltwin.repository.DeviceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private DeviceRepository deviceRepository;

    @Override
    public void run(String... args) {
        if (deviceRepository.count() == 0) {
            initializeDevices();
        }
    }

    private void initializeDevices() {
        String[] deviceNames = {
                "一号电机组件", "二号液压系统", "三号传动装置",
                "四号控制模块", "五号冷却系统", "六号气压装置",
                "七号传感器阵列", "八号电源模块", "九号处理器单元", "十号通信模块"
        };

        String[] deviceTypes = {
                "电机", "液压系统", "传动装置",
                "控制系统", "冷却系统", "气压装置",
                "传感器", "电源", "处理器", "通信模块"
        };

        String[] locations = {
                "A区-01", "A区-02", "A区-03",
                "B区-01", "B区-02", "B区-03",
                "C区-01", "C区-02", "C区-03", "D区-01"
        };

        String[] manufacturers = {
                "西门子", "ABB", "施耐德",
                "三菱电机", "欧姆龙", "博世",
                "霍尼韦尔", "台达", "发那科", "安川"
        };

        for (int i = 0; i < 10; i++) {
            Device device = new Device();
            device.setDeviceCode("DEV-" + String.format("%03d", i + 1));
            device.setDeviceName(deviceNames[i]);
            device.setDeviceType(deviceTypes[i]);
            device.setLocation(locations[i]);
            device.setManufacturer(manufacturers[i]);
            device.setInstallDate(LocalDateTime.now().minusDays(30 + i * 10));
            device.setStatus("ONLINE");
            device.setTemperature(25.0 + i * 2);
            device.setHumidity(40.0 + i * 3);
            device.setPressure(1.0 + i * 0.1);
            device.setVibration(1.0 + i * 0.3);
            device.setRpm(1500.0 + i * 100);
            device.setPowerConsumption(80.0 + i * 10);
            device.setEfficiency(85.0 + i * 1.5);
            device.setAlarmLevel("NORMAL");
            device.setAlarmMessage("");
            deviceRepository.save(device);
        }

        System.out.println("=== 设备数据初始化完成 ===");
    }
}
