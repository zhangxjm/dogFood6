package com.ttc.monitor;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication(scanBasePackages = {"com.ttc.monitor", "com.ttc.common"})
@EnableDiscoveryClient
@MapperScan("com.ttc.monitor.mapper")
public class MonitorApplication {
    public static void main(String[] args) {
        SpringApplication.run(MonitorApplication.class, args);
        System.out.println("=== 监控告警服务启动成功 ===");
    }
}
