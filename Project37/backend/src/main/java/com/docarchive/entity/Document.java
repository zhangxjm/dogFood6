package com.docarchive.entity;

import lombok.Data;
import javax.persistence.*;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "doc_document")
public class Document {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(length = 1000)
    private String description;

    @Column(nullable = false)
    private Long categoryId;

    @Column(length = 500)
    private String filePath;

    @Column(length = 200)
    private String originalFileName;

    @Column(length = 50)
    private String fileType;

    private Long fileSize;

    @Column(length = 50)
    private String createBy;

    @Column(length = 50)
    private String permissionLevel;

    private Integer downloadCount = 0;

    private Integer viewCount = 0;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;

    @PrePersist
    protected void onCreate() {
        createTime = LocalDateTime.now();
        updateTime = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updateTime = LocalDateTime.now();
    }
}
