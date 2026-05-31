package com.silvercare.config;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.silvercare.entity.Room;
import com.silvercare.entity.ServicePackage;
import com.silvercare.entity.User;
import com.silvercare.mapper.RoomMapper;
import com.silvercare.mapper.ServicePackageMapper;
import com.silvercare.mapper.UserMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private RoomMapper roomMapper;

    @Autowired
    private ServicePackageMapper packageMapper;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        try {
            ClassPathResource resource = new ClassPathResource("schema.sql");
            BufferedReader reader = new BufferedReader(new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8));
            StringBuilder sqlBuilder = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                sqlBuilder.append(line).append("\n");
            }
            String[] sqlStatements = sqlBuilder.toString().split(";");
            for (String sql : sqlStatements) {
                if (!sql.trim().isEmpty()) {
                    jdbcTemplate.execute(sql.trim());
                }
            }
        } catch (Exception e) {
            System.out.println("Database schema initialized or already exists");
        }

        initUsers();
        initRooms();
        initPackages();
    }

    private void initUsers() {
        QueryWrapper<User> adminWrapper = new QueryWrapper<>();
        adminWrapper.eq("username", "admin");
        if (userMapper.selectCount(adminWrapper) == 0) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRealName("系统管理员");
            admin.setPhone("13800138000");
            admin.setRole("ADMIN");
            admin.setStatus(1);
            userMapper.insert(admin);
        }

        QueryWrapper<User> staffWrapper = new QueryWrapper<>();
        staffWrapper.eq("username", "staff");
        if (userMapper.selectCount(staffWrapper) == 0) {
            User staff = new User();
            staff.setUsername("staff");
            staff.setPassword(passwordEncoder.encode("staff123"));
            staff.setRealName("客服人员");
            staff.setPhone("13800138001");
            staff.setRole("STAFF");
            staff.setStatus(1);
            userMapper.insert(staff);
        }

        QueryWrapper<User> userWrapper = new QueryWrapper<>();
        userWrapper.eq("username", "user");
        if (userMapper.selectCount(userWrapper) == 0) {
            User user = new User();
            user.setUsername("user");
            user.setPassword(passwordEncoder.encode("user123"));
            user.setRealName("张大爷");
            user.setPhone("13900139000");
            user.setAge(68);
            user.setGender("男");
            user.setRole("USER");
            user.setStatus(1);
            user.setEmergencyContact("张小明");
            user.setEmergencyPhone("13900139001");
            userMapper.insert(user);
        }
    }

    private void initRooms() {
        if (roomMapper.selectCount(null) == 0) {
            String[] roomTypes = {"标准单人间", "标准双人间", "豪华套房", "康养套房"};
            String[] facilities = {"空调,电视,独立卫浴,紧急呼叫按钮", "空调,电视,独立卫浴,紧急呼叫按钮,24小时护理", "空调,电视,独立卫浴,紧急呼叫按钮,24小时护理,康复理疗设备", "空调,电视,独立卫浴,紧急呼叫按钮,24小时护理,康复理疗设备,专业护工"};
            
            for (int i = 1; i <= 20; i++) {
                Room room = new Room();
                room.setRoomNo(String.format("%03d", i));
                int typeIndex = (i - 1) / 5;
                room.setName(roomTypes[typeIndex] + "-" + String.format("%02d", i));
                room.setType(roomTypes[typeIndex]);
                room.setPrice(new BigDecimal(180 + typeIndex * 120));
                room.setDescription("舒适的" + roomTypes[typeIndex] + "，配备完善的养老设施和服务。");
                room.setFacilities(facilities[typeIndex]);
                room.setFloor((i - 1) / 10 + 1);
                room.setBedCount(typeIndex == 1 ? 2 : 1);
                room.setArea((25 + typeIndex * 10) + "㎡");
                room.setStatus(1);
                roomMapper.insert(room);
            }
        }
    }

    private void initPackages() {
        if (packageMapper.selectCount(null) == 0) {
            String[][] packages = {
                {"基础康养套餐", "提供基础的生活照料和健康监测服务，适合自理能力较好的老人。", "980", "30", "每日三餐,健康监测,定期体检,文娱活动", "自理老人"},
                {"标准护理套餐", "包含基础服务外，增加个人护理和康复训练，适合半失能老人。", "1980", "30", "每日三餐,健康监测,个人护理,康复训练,定期体检", "半失能老人"},
                {"专业护理套餐", "全天候专业护理服务，适合失能或需要特殊照护的老人。", "3680", "30", "24小时护工,专业护理,康复治疗,医疗协助,营养配餐", "失能老人"},
                {"康复理疗套餐", "针对术后康复或慢性病管理，提供专业康复服务。", "2680", "15", "康复评估,理疗服务,运动康复,营养指导,心理疏导", "康复期老人"},
                {"短期体验套餐", "7天短期入住体验，感受康养服务品质。", "1280", "7", "三餐食宿,基础照料,健康体检,体验活动", "首次体验客户"}
            };

            for (String[] pkg : packages) {
                ServicePackage servicePackage = new ServicePackage();
                servicePackage.setName(pkg[0]);
                servicePackage.setDescription(pkg[1]);
                servicePackage.setPrice(new BigDecimal(pkg[2]));
                servicePackage.setDuration(Integer.parseInt(pkg[3]));
                servicePackage.setServices(pkg[4]);
                servicePackage.setSuitableFor(pkg[5]);
                servicePackage.setStatus(1);
                packageMapper.insert(servicePackage);
            }
        }
    }
}
