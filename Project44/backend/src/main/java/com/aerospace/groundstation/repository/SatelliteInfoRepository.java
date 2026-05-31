package com.aerospace.groundstation.repository;

import com.aerospace.groundstation.entity.SatelliteInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SatelliteInfoRepository extends JpaRepository<SatelliteInfo, Long> {

    Optional<SatelliteInfo> findBySatelliteId(String satelliteId);

    List<SatelliteInfo> findByEnabledTrue();

    boolean existsBySatelliteId(String satelliteId);
}
