package com.docarchive.repository;

import com.docarchive.entity.Document;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {
    Page<Document> findByCategoryId(Long categoryId, Pageable pageable);

    @Query("SELECT d FROM Document d WHERE d.title LIKE %:keyword% OR d.description LIKE %:keyword%")
    Page<Document> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);

    @Query("SELECT d FROM Document d WHERE d.categoryId = :categoryId AND (d.title LIKE %:keyword% OR d.description LIKE %:keyword%)")
    Page<Document> findByCategoryIdAndKeyword(@Param("categoryId") Long categoryId, @Param("keyword") String keyword, Pageable pageable);

    List<Document> findTop10ByOrderByCreateTimeDesc();
    List<Document> findTop10ByOrderByDownloadCountDesc();
}
