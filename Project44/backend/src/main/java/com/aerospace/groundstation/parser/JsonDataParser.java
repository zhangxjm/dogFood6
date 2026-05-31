package com.aerospace.groundstation.parser;

import com.aerospace.groundstation.dto.SatelliteMessage;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class JsonDataParser implements DataParser {

    private final ObjectMapper objectMapper;

    @Override
    public String getFormat() {
        return "JSON";
    }

    @Override
    public Map<String, Object> parse(SatelliteMessage message) throws Exception {
        return objectMapper.readValue(message.getRawData(), new TypeReference<Map<String, Object>>() {});
    }

    @Override
    public boolean validate(SatelliteMessage message) {
        try {
            String checksum = calculateChecksum(message.getRawData());
            return checksum.equalsIgnoreCase(message.getChecksum());
        } catch (Exception e) {
            log.warn("Checksum validation failed for satellite: {}", message.getSatelliteId(), e);
            return false;
        }
    }

    private String calculateChecksum(String data) throws Exception {
        MessageDigest digest = MessageDigest.getInstance("MD5");
        byte[] hash = digest.digest(data.getBytes(StandardCharsets.UTF_8));
        StringBuilder hexString = new StringBuilder();
        for (byte b : hash) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) {
                hexString.append('0');
            }
            hexString.append(hex);
        }
        return hexString.toString();
    }
}
