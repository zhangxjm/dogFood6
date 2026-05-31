package com.docarchive.controller;

import com.docarchive.common.Result;
import com.docarchive.entity.Document;
import com.docarchive.entity.User;
import com.docarchive.service.DocumentService;
import com.docarchive.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/documents")
public class DocumentController {

    @Autowired
    private DocumentService documentService;

    @Autowired
    private UserService userService;

    @GetMapping
    public Result<Page<Document>> getDocuments(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createTime"));
        Page<Document> documents;

        if (categoryId != null && keyword != null && !keyword.isEmpty()) {
            documents = documentService.findByCategoryIdAndKeyword(categoryId, keyword, pageable);
        } else if (categoryId != null) {
            documents = documentService.findByCategoryId(categoryId, pageable);
        } else if (keyword != null && !keyword.isEmpty()) {
            documents = documentService.search(keyword, pageable);
        } else {
            documents = documentService.findByCategoryId(-1L, pageable);
        }

        String username = authentication != null ? authentication.getName() : null;
        String userRole = null;
        if (username != null) {
            User user = userService.findByUsername(username).orElse(null);
            if (user != null) {
                userRole = user.getRole();
            }
        }

        final String finalUsername = username;
        final String finalUserRole = userRole;
        documents = documents.map(doc -> {
            if (!documentService.hasPermission(doc, finalUserRole, finalUsername)) {
                doc.setFilePath(null);
            }
            return doc;
        });

        return Result.success(documents);
    }

    @GetMapping("/latest")
    public Result<List<Document>> getLatestDocuments() {
        return Result.success(documentService.findLatest());
    }

    @GetMapping("/popular")
    public Result<List<Document>> getPopularDocuments() {
        return Result.success(documentService.findPopular());
    }

    @GetMapping("/{id}")
    public Result<Document> getDocumentById(@PathVariable Long id, Authentication authentication) {
        return documentService.findById(id)
                .map(doc -> {
                    String username = authentication != null ? authentication.getName() : null;
                    String userRole = null;
                    if (username != null) {
                        User user = userService.findByUsername(username).orElse(null);
                        if (user != null) {
                            userRole = user.getRole();
                        }
                    }
                    if (!documentService.hasPermission(doc, userRole, username)) {
                        return Result.<Document>error("无权限访问该文档");
                    }
                    documentService.incrementViewCount(id);
                    return Result.success(doc);
                })
                .orElse(Result.error("文档不存在"));
    }

    @PostMapping("/upload")
    public Result<Document> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam Long categoryId,
            @RequestParam String title,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) String permissionLevel,
            Authentication authentication) throws IOException {

        String username = authentication.getName();
        Document document = documentService.uploadDocument(file, categoryId, title, description, permissionLevel, username);
        return Result.success("上传成功", document);
    }

    @GetMapping("/download/{id}")
    public ResponseEntity<Resource> downloadDocument(@PathVariable Long id, Authentication authentication) {
        Optional<Document> docOpt = documentService.findById(id);
        if (!docOpt.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        
        Document doc = docOpt.get();
        String username = authentication != null ? authentication.getName() : null;
        String userRole = null;
        if (username != null) {
            User user = userService.findByUsername(username).orElse(null);
            if (user != null) {
                userRole = user.getRole();
            }
        }
        if (!documentService.hasPermission(doc, userRole, username)) {
            return ResponseEntity.status(403).build();
        }

        File file = new File(doc.getFilePath());
        if (!file.exists()) {
            return ResponseEntity.notFound().build();
        }

        Resource resource = new FileSystemResource(file);
        String fileName = URLEncoder.encode(doc.getOriginalFileName(), StandardCharsets.UTF_8);

        documentService.incrementDownloadCount(id);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename*=UTF-8''" + fileName)
                .body(resource);
    }

    @PutMapping("/{id}")
    public Result<Document> updateDocument(@PathVariable Long id, @RequestBody Map<String, Object> updates, Authentication authentication) {
        return documentService.findById(id)
                .map(existing -> {
                    String username = authentication.getName();
                    User user = userService.findByUsername(username).orElse(null);
                    String userRole = user != null ? user.getRole() : null;

                    if (!username.equals(existing.getCreateBy()) && !"ADMIN".equals(userRole)) {
                        return Result.<Document>error("无权限修改该文档");
                    }

                    if (updates.containsKey("title")) {
                        existing.setTitle((String) updates.get("title"));
                    }
                    if (updates.containsKey("description")) {
                        existing.setDescription((String) updates.get("description"));
                    }
                    if (updates.containsKey("categoryId")) {
                        existing.setCategoryId(Long.valueOf(updates.get("categoryId").toString()));
                    }
                    if (updates.containsKey("permissionLevel")) {
                        existing.setPermissionLevel((String) updates.get("permissionLevel"));
                    }

                    return Result.success("更新成功", documentService.save(existing));
                })
                .orElse(Result.error("文档不存在"));
    }

    @DeleteMapping("/{id}")
    public Result<Void> deleteDocument(@PathVariable Long id, Authentication authentication) {
        return documentService.findById(id)
                .map(doc -> {
                    String username = authentication.getName();
                    User user = userService.findByUsername(username).orElse(null);
                    String userRole = user != null ? user.getRole() : null;

                    if (!username.equals(doc.getCreateBy()) && !"ADMIN".equals(userRole)) {
                        return Result.<Void>error("无权限删除该文档");
                    }

                    documentService.deleteById(id);
                    return Result.<Void>success();
                })
                .orElse(Result.error("文档不存在"));
    }
}
