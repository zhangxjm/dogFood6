package com.aerospace.groundstation.parser;

import com.aerospace.groundstation.dto.SatelliteMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class CsvDataParser implements DataParser {

    @Override
    public String getFormat() {
        return "CSV";
    }

    @Override
    public Map<String, Object> parse(SatelliteMessage message) throws Exception {
        String csvData = message.getRawData();
        String[] lines = csvData.split("\n");
        Map<String, Object> result = new HashMap<>();
        
        result.put("lineCount", lines.length);
        result.put("totalSize", csvData.length());
        
        if (lines.length > 0) {
            String[] headers = lines[0].split(",");
            result.put("headers", headers);
            
            if (lines.length > 1) {
                Map<String, Object> firstRow = new HashMap<>();
                String[] firstDataRow = lines[1].split(",");
                for (int i = 0; i < Math.min(headers.length, firstDataRow.length); i++) {
                    firstRow.put(headers[i].trim(), parseValue(firstDataRow[i].trim()));
                }
                result.put("firstRow", firstRow);
            }
        }
        
        result.put("sampleRows", Math.min(lines.length, 10));
        return result;
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

    private Object parseValue(String value) {
        try {
            if (value.contains(".")) {
                return Double.parseDouble(value);
            }
            return Long.parseLong(value);
        } catch (NumberFormatException e) {
            if ("true".equalsIgnoreCase(value) || "false".equalsIgnoreCase(value)) {
                return Boolean.parseBoolean(value);
            }
            return value;
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
