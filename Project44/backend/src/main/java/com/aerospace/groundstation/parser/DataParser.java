package com.aerospace.groundstation.parser;

import com.aerospace.groundstation.dto.SatelliteMessage;

import java.util.Map;

public interface DataParser {

    String getFormat();

    Map<String, Object> parse(SatelliteMessage message) throws Exception;

    boolean validate(SatelliteMessage message);
}
