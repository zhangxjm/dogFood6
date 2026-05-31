package com.energy.elasticsearch;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.Document;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;

import java.time.LocalDateTime;

@Data
@Document(indexName = "energy_data")
public class EnergyDataDocument {

    @Id
    private String id;

    @Field(type = FieldType.Long)
    private Long equipmentId;

    @Field(type = FieldType.Keyword)
    private String equipmentCode;

    @Field(type = FieldType.Double)
    private Double voltage;

    @Field(type = FieldType.Double)
    private Double current;

    @Field(type = FieldType.Double)
    private Double power;

    @Field(type = FieldType.Double)
    private Double powerFactor;

    @Field(type = FieldType.Double)
    private Double energyConsumption;

    @Field(type = FieldType.Double)
    private Double temperature;

    @Field(type = FieldType.Date)
    private LocalDateTime collectTime;

    @Field(type = FieldType.Date)
    private LocalDateTime createTime;
}
