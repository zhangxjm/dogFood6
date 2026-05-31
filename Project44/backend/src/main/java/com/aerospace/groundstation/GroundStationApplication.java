package com.aerospace.groundstation;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableAsync
@EnableScheduling
public class GroundStationApplication {

    public static void main(String[] args) {
        SpringApplication.run(GroundStationApplication.class, args);
    }
}
