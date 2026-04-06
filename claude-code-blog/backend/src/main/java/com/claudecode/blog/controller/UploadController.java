package com.claudecode.blog.controller;

import com.claudecode.blog.dto.Result;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/admin/upload")
@RequiredArgsConstructor
public class UploadController {

    @Value("${upload.path}")
    private String uploadPath;

    @Value("${upload.allowed-types}")
    private String allowedTypes;

    @PostMapping("/image")
    public Result<?> uploadImage(@RequestParam("file") MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            return Result.fail("File is empty");
        }

        String contentType = file.getContentType();
        List<String> allowed = Arrays.asList(allowedTypes.split(","));
        if (contentType == null || !allowed.contains(contentType)) {
            return Result.fail("File type not allowed");
        }

        long maxSize = 5 * 1024 * 1024;
        if (file.getSize() > maxSize) {
            return Result.fail("File size exceeds limit (5MB)");
        }

        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String filename = UUID.randomUUID().toString().replace("-", "") + extension;

        File destDir = new File(uploadPath);
        if (!destDir.exists()) {
            destDir.mkdirs();
        }

        File destFile = new File(destDir, filename);
        file.transferTo(destFile);

        String url = "/upload/" + filename;
        return Result.success(url);
    }
}
