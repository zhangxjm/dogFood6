package com.ipr.repository;

import com.ipr.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByInfringementStatus(Product.InfringementStatus status);
    
    List<Product> findByPlatform(String platform);
    
    @Query("SELECT p FROM Product p WHERE p.infringementScore >= ?1 ORDER BY p.infringementScore DESC")
    List<Product> findHighRiskProducts(Integer minScore);
    
    long countByInfringementStatus(Product.InfringementStatus status);
}
