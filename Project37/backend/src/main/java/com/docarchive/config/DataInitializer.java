package com.docarchive.config;

import com.docarchive.entity.Category;
import com.docarchive.entity.User;
import com.docarchive.service.CategoryService;
import com.docarchive.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserService userService;

    @Autowired
    private CategoryService categoryService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        initUsers();
        initCategories();
    }

    private void initUsers() {
        if (!userService.existsByUsername("admin")) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRealName("系统管理员");
            admin.setRole("ADMIN");
            admin.setEmail("admin@example.com");
            admin.setPhone("13800138000");
            admin.setEnabled(true);
            userService.save(admin);
            System.out.println("Default admin user created: admin/admin123");
        }

        if (!userService.existsByUsername("user")) {
            User user = new User();
            user.setUsername("user");
            user.setPassword(passwordEncoder.encode("user123"));
            user.setRealName("普通用户");
            user.setRole("USER");
            user.setEmail("user@example.com");
            user.setPhone("13900139000");
            user.setEnabled(true);
            userService.save(user);
            System.out.println("Default user created: user/user123");
        }

        if (!userService.existsByUsername("guest")) {
            User guest = new User();
            guest.setUsername("guest");
            guest.setPassword(passwordEncoder.encode("guest123"));
            guest.setRealName("访客用户");
            guest.setRole("GUEST");
            guest.setEmail("guest@example.com");
            guest.setPhone("13700137000");
            guest.setEnabled(true);
            userService.save(guest);
            System.out.println("Default guest user created: guest/guest123");
        }
    }

    private void initCategories() {
        if (categoryService.findAll().isEmpty()) {
            String[][] categories = {
                    {"项目管理", "项目规划、进度跟踪、里程碑管理相关文档", "0", "1"},
                    {"技术文档", "技术方案、设计文档、接口规范等", "0", "2"},
                    {"会议纪要", "各类会议记录、决议事项", "0", "3"},
                    {"培训资料", "员工培训、知识分享相关资料", "0", "4"},
                    {"财务文档", "财务报表、预算、合同等文档", "0", "5"},
                    {"人力资源", "招聘、绩效、员工关系相关文档", "0", "6"},
                    {"需求文档", "产品需求、用户需求说明书", "1", "1"},
                    {"项目计划", "项目实施计划、甘特图", "1", "2"},
                    {"系统架构", "系统架构设计、技术选型", "2", "1"},
                    {"数据库设计", "数据模型、表结构设计", "2", "2"},
                    {"接口文档", "API接口规范说明", "2", "3"},
                    {"周会纪要", "每周例会记录", "3", "1"},
                    {"项目评审", "项目评审会议记录", "3", "2"}
            };

            for (String[] cat : categories) {
                Category category = new Category();
                category.setName(cat[0]);
                category.setDescription(cat[1]);
                category.setParentId(Long.parseLong(cat[2]));
                category.setSortOrder(Integer.parseInt(cat[3]));
                category.setCreateBy("system");
                categoryService.save(category);
            }
            System.out.println("Default categories initialized");
        }
    }
}
