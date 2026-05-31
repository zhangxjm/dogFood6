package com.aerospace.groundstation.parser;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class ParserFactory {

    private final List<DataParser> parsers;
    private final Map<String, DataParser> parserMap = new HashMap<>();

    @PostConstruct
    public void init() {
        for (DataParser parser : parsers) {
            parserMap.put(parser.getFormat().toUpperCase(), parser);
            log.info("Registered data parser: {}", parser.getFormat());
        }
    }

    public DataParser getParser(String format) {
        DataParser parser = parserMap.get(format.toUpperCase());
        if (parser == null) {
            log.warn("No parser found for format: {}, using default JSON parser", format);
            return parserMap.get("JSON");
        }
        return parser;
    }

    public boolean hasParser(String format) {
        return parserMap.containsKey(format.toUpperCase());
    }
}
