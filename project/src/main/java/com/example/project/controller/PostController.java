package com.example.project.controller;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
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

            Map<String, Object> result = new HashMap<>();
            result.put("postId", post.getPostId());
            result.put("message", "Tạo bài viết thành công");
            return ResponseEntity.ok(result);
        } catch (IOException e) {
            return ResponseEntity.status(500).body("Lỗi khi upload ảnh: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi server: " + e.getMessage());
        }
    }

    /**
     * API lấy danh sách bài viết blog để hiển thị trên trang chủ
     * GET /api/posts/homepage
     */
    @GetMapping("/homepage")
    public ResponseEntity<List<Map<String, Object>>> getHomepagePosts() {
        try {
            // Lấy 6 bài viết mới nhất có status = "published"
            List<Post> posts = postRepository.findTop6ByPostStatusOrderByCreatedAtDesc("published");
            List<Map<String, Object>> result = new ArrayList<>();

            for (Post post : posts) {
                Map<String, Object> postData = new HashMap<>();
                postData.put("postId", post.getPostId());
                postData.put("title", post.getTitle());
                postData.put("summary", post.getSummary());
                postData.put("createdAt", post.getCreatedAt());
                postData.put("docId", post.getDocId());

                // Lấy ảnh đầu tiên của bài viết (nếu có)
                List<PostImage> postImages = postImageRepository.findByPostPostId(post.getPostId());
                if (!postImages.isEmpty()) {
                    Image firstImage = postImages.get(0).getImage();
                    postData.put("imageId", firstImage.getImageId());
                    postData.put("hasImage", true);
                } else {
                    postData.put("hasImage", false);
                }

                result.add(postData);
            }

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * API lấy tất cả bài viết blog (cho trang "Xem tất cả bài viết")
     * GET /api/posts/all
     */
    @GetMapping("/all")
    public ResponseEntity<List<Map<String, Object>>> getAllPosts() {
        try {
            // Lấy tất cả bài viết có status = "published"
            List<Post> posts = postRepository.findByPostStatusOrderByCreatedAtDesc("published");
            List<Map<String, Object>> result = new ArrayList<>();

            for (Post post : posts) {
                Map<String, Object> postData = new HashMap<>();
                postData.put("postId", post.getPostId());
                postData.put("title", post.getTitle());
                postData.put("summary", post.getSummary());
                postData.put("createdAt", post.getCreatedAt());
                postData.put("docId", post.getDocId());

                // Lấy ảnh đầu tiên của bài viết (nếu có)
                List<PostImage> postImages = postImageRepository.findByPostPostId(post.getPostId());
                if (!postImages.isEmpty()) {
                    Image firstImage = postImages.get(0).getImage();
                    postData.put("imageId", firstImage.getImageId());
                    postData.put("hasImage", true);
                } else {
                    postData.put("hasImage", false);
                }

                result.add(postData);
            }

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * API lấy ảnh của bài viết
     * GET /api/posts/{postId}/image
     */
    @GetMapping("/{postId}/image")
    public ResponseEntity<byte[]> getPostImage(@PathVariable Integer postId) {
        try {
            List<PostImage> postImages = postImageRepository.findByPostPostId(postId);
            if (!postImages.isEmpty()) {
                Image image = postImages.get(0).getImage();
                return ResponseEntity.ok()
                        .header("Content-Type", image.getImageMimeType())
                        .body(image.getImageData());
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * API lấy bài viết nháp của bác sĩ
     * GET /api/posts/drafts
     */
    @GetMapping("/drafts")
    public ResponseEntity<List<Map<String, Object>>> getDraftPosts() {
        try {
            // Lấy tất cả bài viết có status = "draft"
            List<Post> drafts = postRepository.findByPostStatusOrderByCreatedAtDesc("draft");
            List<Map<String, Object>> result = new ArrayList<>();

            for (Post draft : drafts) {
                Map<String, Object> draftData = new HashMap<>();
                draftData.put("postId", draft.getPostId());
                draftData.put("title", draft.getTitle());
                draftData.put("summary", draft.getSummary());
                draftData.put("content", draft.getContent());
                draftData.put("createdAt", draft.getCreatedAt());
                draftData.put("docId", draft.getDocId());

                result.add(draftData);
            }

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * API lấy chi tiết bài viết theo ID
     * GET /api/posts/{postId}
     */
    @GetMapping("/{postId}")
    public ResponseEntity<Map<String, Object>> getPostById(@PathVariable Integer postId) {
        try {
            Post post = postRepository.findById(postId).orElse(null);
            if (post == null) {
                return ResponseEntity.notFound().build();
            }

            Map<String, Object> postData = new HashMap<>();
            postData.put("postId", post.getPostId());
            postData.put("title", post.getTitle());
            postData.put("summary", post.getSummary());
            postData.put("content", post.getContent());
            postData.put("postStatus", post.getPostStatus());
            postData.put("createdAt", post.getCreatedAt());
            postData.put("docId", post.getDocId());

            // Lấy ảnh đầu tiên của bài viết (nếu có)
            List<PostImage> postImages = postImageRepository.findByPostPostId(post.getPostId());
            if (!postImages.isEmpty()) {
                Image firstImage = postImages.get(0).getImage();
                postData.put("imageId", firstImage.getImageId());
                postData.put("hasImage", true);
            } else {
                postData.put("hasImage", false);
            }

            return ResponseEntity.ok(postData);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * API cập nhật trạng thái bài viết (publish draft)
     * PUT /api/posts/{postId}/publish
     */
    @PutMapping("/{postId}/publish")
    public ResponseEntity<?> publishPost(@PathVariable Integer postId, @RequestBody Map<String, String> request) {
        try {
            Post post = postRepository.findById(postId).orElse(null);
            if (post == null) {
                return ResponseEntity.notFound().build();
            }

            String newStatus = request.get("postStatus");
            if ("published".equals(newStatus)) {
                post.setPostStatus("published");
                postRepository.save(post);
                return ResponseEntity.ok("Bài viết đã được xuất bản thành công");
            } else {
                return ResponseEntity.badRequest().body("Trạng thái không hợp lệ");
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Lỗi server: " + e.getMessage());
        }
    }

    /**
     * API cập nhật bài viết
     * PUT /api/posts/{postId}
     */
    @PutMapping("/{postId}")
    public ResponseEntity<?> updatePost(@PathVariable Integer postId, @RequestBody Map<String, Object> request) {
        try {
            Post post = postRepository.findById(postId).orElse(null);
            if (post == null) {
                return ResponseEntity.notFound().build();
            }

            // Cập nhật thông tin bài viết
            if (request.containsKey("title")) {
                post.setTitle((String) request.get("title"));
            }
            if (request.containsKey("summary")) {
                post.setSummary((String) request.get("summary"));
            }
            if (request.containsKey("content")) {
                post.setContent((String) request.get("content"));
            }
            if (request.containsKey("postStatus")) {
                post.setPostStatus((String) request.get("postStatus"));
            }

            postRepository.save(post);

            Map<String, Object> result = new HashMap<>();
            result.put("postId", post.getPostId());
            result.put("message", "Bài viết đã được cập nhật thành công");

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Lỗi server: " + e.getMessage());
        }
    }

    /**
     * API xóa bài viết
     * DELETE /api/posts/{postId}
     */
    @DeleteMapping("/{postId}")
    public ResponseEntity<?> deletePost(@PathVariable Integer postId) {
        try {
            Post post = postRepository.findById(postId).orElse(null);
            if (post == null) {
                return ResponseEntity.notFound().build();
            }

            // Xóa các PostImage trước
            List<PostImage> postImages = postImageRepository.findByPostPostId(postId);
            for (PostImage postImage : postImages) {
                // Xóa Image
                imageRepository.delete(postImage.getImage());
                // Xóa PostImage
                postImageRepository.delete(postImage);
            }

            // Xóa Post
            postRepository.delete(post);

            return ResponseEntity.ok("Bài viết đã được xóa thành công");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Lỗi server: " + e.getMessage());
        }
    }
}