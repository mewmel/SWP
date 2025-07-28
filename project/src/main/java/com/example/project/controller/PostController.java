package com.example.project.controller;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.project.entity.Image;
import com.example.project.entity.Post;
import com.example.project.entity.PostImage;
import com.example.project.repository.ImageRepository;
import com.example.project.repository.PostImageRepository;
import com.example.project.repository.PostRepository;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    @Autowired
    private PostRepository postRepository;
    @Autowired
    private ImageRepository imageRepository;
    @Autowired
    private PostImageRepository postImageRepository;

    /**
     * Tạo mới bài viết, có thể upload nhiều ảnh đi kèm (dạng multipart/form-data)
     */
    @PostMapping("/create/{docId}")
    @Transactional
    public ResponseEntity<?> createPostWithImages(
            @PathVariable("docId") Integer docId,
            @RequestParam("title") String title,
            @RequestParam("content") String content,
            @RequestParam(value = "summary", required = false) String summary,
            @RequestParam("postStatus") String postStatus,
            @RequestPart(value = "images", required = false) List<MultipartFile> images
    ) {
        try {
            // 1. Tạo Post mới
            Post post = new Post();
            post.setDocId(docId);
            post.setTitle(title);
            post.setContent(content);
            post.setSummary(summary);
            post.setPostStatus(postStatus);
            post.setCreatedAt(LocalDateTime.now());
            postRepository.save(post);

            // 2. Lưu ảnh nếu có
            if (images != null && !images.isEmpty()) {
                for (MultipartFile file : images) {
                    if (!file.isEmpty()) {
                        Image img = new Image();
                        img.setImageData(file.getBytes());
                        img.setImageMimeType(file.getContentType());
                        imageRepository.save(img);

                        PostImage pi = new PostImage();
                        pi.setPost(post);
                        pi.setImage(img);
                        postImageRepository.save(pi);
                    }
                }
            }

            return ResponseEntity.ok("Tạo bài viết thành công");
        } catch (IOException e) {
            return ResponseEntity.status(500).body("Lỗi khi upload ảnh: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi server: " + e.getMessage());
        }
    }
}
