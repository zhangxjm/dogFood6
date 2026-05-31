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
public class HexDataParser implements DataParser {

    @Override
    public String getFormat() {
        return "HEX";
    }

    @Override
    public Map<String, Object> parse(SatelliteMessage message) throws Exception {
        String hexData = message.getRawData();
        Map<String, Object> result = new HashMap<>();
        
        result.put("hexLength", hexData.length());
        result.put("byteCount", hexData.length() / 2);
        result.put("rawHex", hexData);
        
        if (hexData.length() >= 16) {
            result.put("header", hexData.substring(0, 16));
            result.put("payload", hexData.substring(16));
        }
        
        result.put("asciiPreview", hexToAscii(hexData.substring(0, Math.min(64, hexData.length()))));
        
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

    private String hexToAscii(String hexStr) {
        StringBuilder output = new StringBuilder();
        for (int i = 0; i < hexStr.length(); i += 2) {
            String str = hexStr.substring(i, i + 2);
            int charCode = Integer.parseInt(str, 16);
            if (charCode >= 32 && charCode <= 126) {
                output.append((char) charCode);
            } else {
                output.append('.');
            }
        }
        return output.toString();
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
