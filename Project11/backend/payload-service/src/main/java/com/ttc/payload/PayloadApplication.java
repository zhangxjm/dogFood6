package com.ttc.payload;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication(scanBasePackages = {"com.ttc.payload", "com.ttc.common"})
@EnableDiscoveryClient
@MapperScan("com.ttc.payload.mapper")
public class PayloadApplication {
    public static void main(String[] args) {
        SpringApplication.run(PayloadApplication.class, args);
        System.out.println("=== 载荷数据服务启动成功 ===");
    }
}
