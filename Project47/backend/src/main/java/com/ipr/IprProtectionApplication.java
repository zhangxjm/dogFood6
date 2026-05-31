package com.ipr;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableAsync
@EnableScheduling
public class IprProtectionApplication {
    public static void main(String[] args) {
        SpringApplication.run(IprProtectionApplication.class, args);
    }
}
