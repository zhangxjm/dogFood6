package com.docarchive.service;

import com.docarchive.entity.Document;
import com.docarchive.repository.DocumentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class DocumentService {

    @Autowired
    private DocumentRepository documentRepository;

    @Value("${document.storage.path}")
    private String storagePath;

    public Page<Document> findByCategoryId(Long categoryId, Pageable pageable) {
        return documentRepository.findByCategoryId(categoryId, pageable);
    }

    public Page<Document> search(String keyword, Pageable pageable) {
        return documentRepository.searchByKeyword(keyword, pageable);
    }

    public Page<Document> findByCategoryIdAndKeyword(Long categoryId, String keyword, Pageable pageable) {
        return documentRepository.findByCategoryIdAndKeyword(categoryId, keyword, pageable);
    }

    public List<Document> findLatest() {
        return documentRepository.findTop10ByOrderByCreateTimeDesc();
    }

    public List<Document> findPopular() {
        return documentRepository.findTop10ByOrderByDownloadCountDesc();
    }

    public Optional<Document> findById(Long id) {
        return documentRepository.findById(id);
    }

    public Document save(Document document) {
        return documentRepository.save(document);
    }

    public Document uploadDocument(MultipartFile file, Long categoryId, String title, String description,
                                   String permissionLevel, String username) throws IOException {
        File storageDir = new File(storagePath);
        if (!storageDir.exists()) {
            storageDir.mkdirs();
        }

        String originalFileName = file.getOriginalFilename();
        String fileExtension = originalFileName != null && originalFileName.contains(".")
                ? originalFileName.substring(originalFileName.lastIndexOf("."))
                : "";
        String storedFileName = UUID.randomUUID().toString().replace("-", "") + fileExtension;

        Path targetLocation = Paths.get(storagePath, storedFileName);
        Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

        Document document = new Document();
        document.setTitle(title);
        document.setDescription(description);
        document.setCategoryId(categoryId);
        document.setFilePath(targetLocation.toString());
        document.setOriginalFileName(originalFileName);
        document.setFileType(file.getContentType());
        document.setFileSize(file.getSize());
        document.setCreateBy(username);
        document.setPermissionLevel(permissionLevel != null ? permissionLevel : "PUBLIC");

        return documentRepository.save(document);
    }

    public void incrementDownloadCount(Long id) {
        documentRepository.findById(id).ifPresent(doc -> {
            doc.setDownloadCount(doc.getDownloadCount() + 1);
            documentRepository.save(doc);
        });
    }

    public void incrementViewCount(Long id) {
        documentRepository.findById(id).ifPresent(doc -> {
            doc.setViewCount(doc.getViewCount() + 1);
            documentRepository.save(doc);
        });
    }

    public void deleteById(Long id) {
        documentRepository.findById(id).ifPresent(doc -> {
            try {
                if (doc.getFilePath() != null) {
                    Files.deleteIfExists(Paths.get(doc.getFilePath()));
                }
            } catch (IOException e) {
                e.printStackTrace();
            }
        });
        documentRepository.deleteById(id);
    }

    public boolean hasPermission(Document document, String userRole, String username) {
        String permission = document.getPermissionLevel();
        if ("PUBLIC".equals(permission)) {
            return true;
        } else if ("INTERNAL".equals(permission)) {
            return userRole != null;
        } else if ("PRIVATE".equals(permission)) {
            return username != null && username.equals(document.getCreateBy())
                    || "ADMIN".equals(userRole);
        } else if ("ADMIN_ONLY".equals(permission)) {
            return "ADMIN".equals(userRole);
        }
        return false;
    }
}
