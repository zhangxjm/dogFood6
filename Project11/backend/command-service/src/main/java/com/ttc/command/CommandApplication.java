package com.ttc.command;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication(scanBasePackages = {"com.ttc.command", "com.ttc.common"})
@EnableDiscoveryClient
@MapperScan("com.ttc.command.mapper")
public class CommandApplication {
    public static void main(String[] args) {
        SpringApplication.run(CommandApplication.class, args);
        System.out.println("=== 测控指令服务启动成功 ===");
    }
}
