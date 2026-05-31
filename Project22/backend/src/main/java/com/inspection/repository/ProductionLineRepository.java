package com.inspection.repository;

import com.inspection.entity.ProductionLine;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductionLineRepository extends JpaRepository<ProductionLine, Long> {
}
