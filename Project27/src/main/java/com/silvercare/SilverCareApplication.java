package com.silvercare;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@MapperScan("com.silvercare.mapper")
@EnableScheduling
public class SilverCareApplication {
    public static void main(String[] args) {
        SpringApplication.run(SilverCareApplication.class, args);
    }
}
