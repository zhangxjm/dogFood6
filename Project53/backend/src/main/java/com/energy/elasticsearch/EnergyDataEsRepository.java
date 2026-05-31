package com.energy.elasticsearch;

import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EnergyDataEsRepository extends ElasticsearchRepository<EnergyDataDocument, String> {

    List<EnergyDataDocument> findByEquipmentId(Long equipmentId);

    List<EnergyDataDocument> findByEquipmentIdAndCollectTimeBetween(Long equipmentId, LocalDateTime start, LocalDateTime end);

    List<EnergyDataDocument> findByCollectTimeBetween(LocalDateTime start, LocalDateTime end);
}
