package com.eldercare.config;

import com.eldercare.entity.Elderly;
import com.eldercare.entity.FamilyMember;
import com.eldercare.entity.HealthData;
import com.eldercare.entity.WearableDevice;
import com.eldercare.repository.ElderlyRepository;
import com.eldercare.repository.FamilyMemberRepository;
import com.eldercare.repository.HealthDataRepository;
import com.eldercare.repository.WearableDeviceRepository;
import com.eldercare.service.BluetoothIoTService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDateTime;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class DataInitializer {

    private final BluetoothIoTService bluetoothIoTService;

    @Bean
    public CommandLineRunner initData(ElderlyRepository elderlyRepository,
                                       FamilyMemberRepository familyMemberRepository,
                                       WearableDeviceRepository deviceRepository,
                                       HealthDataRepository healthDataRepository) {
        return args -> {
            if (elderlyRepository.count() > 0) {
                log.info("Data already initialized, skipping...");
                return;
            }

            log.info("Initializing sample data...");

            Elderly elderly1 = new Elderly();
            elderly1.setName("张爷爷");
            elderly1.setGender("男");
            elderly1.setAge(75);
            elderly1.setPhone("13812345678");
            elderly1.setAddress("北京市朝阳区某某小区1号楼101室");
            elderly1.setIdCard("110101194901011234");
            elderly1.setMedicalHistory("高血压,糖尿病");
            elderly1.setEmergencyContact("张小明");
            elderly1.setEmergencyPhone("13987654321");
            elderly1.setStatus(1);
            elderlyRepository.save(elderly1);

            Elderly elderly2 = new Elderly();
            elderly2.setName("李奶奶");
            elderly2.setGender("女");
            elderly2.setAge(72);
            elderly2.setPhone("13711112222");
            elderly2.setAddress("上海市浦东新区某某花园3栋202");
            elderly2.setIdCard("310115195203154321");
            elderly2.setMedicalHistory("心脏病,关节炎");
            elderly2.setEmergencyContact("李小红");
            elderly2.setEmergencyPhone("13633334444");
            elderly2.setStatus(1);
            elderlyRepository.save(elderly2);

            Elderly elderly3 = new Elderly();
            elderly3.setName("王大爷");
            elderly3.setGender("男");
            elderly3.setAge(80);
            elderly3.setPhone("13555556666");
            elderly3.setAddress("广州市天河区某某大厦5栋801");
            elderly3.setIdCard("440106194405051234");
            elderly3.setMedicalHistory("高血压,冠心病");
            elderly3.setEmergencyContact("王小华");
            elderly3.setEmergencyPhone("13477778888");
            elderly3.setStatus(1);
            elderlyRepository.save(elderly3);

            FamilyMember family1 = new FamilyMember();
            family1.setElderlyId(elderly1.getId());
            family1.setName("张小明");
            family1.setRelationship("儿子");
            family1.setPhone("13987654321");
            family1.setEmail("zhangxiaoming@example.com");
            family1.setStatus(1);
            familyMemberRepository.save(family1);

            FamilyMember family2 = new FamilyMember();
            family2.setElderlyId(elderly1.getId());
            family2.setName("张小红");
            family2.setRelationship("女儿");
            family2.setPhone("13699998888");
            family2.setEmail("zhangxiaohong@example.com");
            family2.setStatus(1);
            familyMemberRepository.save(family2);

            FamilyMember family3 = new FamilyMember();
            family3.setElderlyId(elderly2.getId());
            family3.setName("李小红");
            family3.setRelationship("女儿");
            family3.setPhone("13633334444");
            family3.setEmail("lixiaohong@example.com");
            family3.setStatus(1);
            familyMemberRepository.save(family3);

            FamilyMember family4 = new FamilyMember();
            family4.setElderlyId(elderly3.getId());
            family4.setName("王小华");
            family4.setRelationship("孙子");
            family4.setPhone("13477778888");
            family4.setEmail("wangxiaohua@example.com");
            family4.setStatus(1);
            familyMemberRepository.save(family4);

            WearableDevice device1 = new WearableDevice();
            device1.setElderlyId(elderly1.getId());
            device1.setDeviceCode("WR-001");
            device1.setDeviceType("智能手表");
            device1.setDeviceName("健康守护者1号");
            device1.setBluetoothMac("00:1A:2B:3C:4D:5E");
            device1.setConnectionStatus("CONNECTED");
            device1.setBatteryLevel("85");
            device1.setStatus(1);
            deviceRepository.save(device1);

            WearableDevice device2 = new WearableDevice();
            device2.setElderlyId(elderly2.getId());
            device2.setDeviceCode("WR-002");
            device2.setDeviceType("智能手环");
            device2.setDeviceName("健康守护者2号");
            device2.setBluetoothMac("00:1A:2B:3C:4D:5F");
            device2.setConnectionStatus("CONNECTED");
            device2.setBatteryLevel("72");
            device2.setStatus(1);
            deviceRepository.save(device2);

            WearableDevice device3 = new WearableDevice();
            device3.setElderlyId(elderly3.getId());
            device3.setDeviceCode("WR-003");
            device3.setDeviceType("智能手表");
            device3.setDeviceName("健康守护者3号");
            device3.setBluetoothMac("00:1A:2B:3C:4D:60");
            device3.setConnectionStatus("CONNECTED");
            device3.setBatteryLevel("90");
            device3.setStatus(1);
            deviceRepository.save(device3);

            HealthData healthData1 = new HealthData();
            healthData1.setElderlyId(elderly1.getId());
            healthData1.setDeviceId(device1.getId());
            healthData1.setHeartRate(78);
            healthData1.setBloodOxygen(97.5);
            healthData1.setTemperature(36.6);
            healthData1.setSystolicPressure(128.0);
            healthData1.setDiastolicPressure(82.0);
            healthData1.setSteps(3500);
            healthData1.setSleepQuality("GOOD");
            healthData1.setDataTime(LocalDateTime.now().minusMinutes(10));
            healthData1.setStatus(1);
            healthDataRepository.save(healthData1);

            HealthData healthData2 = new HealthData();
            healthData2.setElderlyId(elderly2.getId());
            healthData2.setDeviceId(device2.getId());
            healthData2.setHeartRate(82);
            healthData2.setBloodOxygen(96.8);
            healthData2.setTemperature(36.4);
            healthData2.setSystolicPressure(135.0);
            healthData2.setDiastolicPressure(88.0);
            healthData2.setSteps(2800);
            healthData2.setSleepQuality("NORMAL");
            healthData2.setDataTime(LocalDateTime.now().minusMinutes(8));
            healthData2.setStatus(1);
            healthDataRepository.save(healthData2);

            HealthData healthData3 = new HealthData();
            healthData3.setElderlyId(elderly3.getId());
            healthData3.setDeviceId(device3.getId());
            healthData3.setHeartRate(72);
            healthData3.setBloodOxygen(98.2);
            healthData3.setTemperature(36.8);
            healthData3.setSystolicPressure(142.0);
            healthData3.setDiastolicPressure(92.0);
            healthData3.setSteps(4200);
            healthData3.setSleepQuality("GOOD");
            healthData3.setDataTime(LocalDateTime.now().minusMinutes(5));
            healthData3.setStatus(1);
            healthDataRepository.save(healthData3);

            bluetoothIoTService.startSimulation();
            
            log.info("Sample data initialized successfully!");
            log.info("3 elderly persons, 4 family members, 3 devices, 3 health data records created.");
        };
    }
}
