package com.eldercare.repository;

import com.eldercare.entity.Elderly;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ElderlyRepository extends JpaRepository<Elderly, Long> {
    List<Elderly> findByStatus(Integer status);
}
