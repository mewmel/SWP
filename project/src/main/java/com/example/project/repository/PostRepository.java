package com.example.project.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.project.entity.Post;

public interface PostRepository extends JpaRepository<Post, Integer> {
    // Lấy tất cả bài viết của một bác sĩ
    List<Post> findByDocId(Integer docId);

    // Lấy tất cả bài đã publish
    List<Post> findByPostStatus(String postStatus);

    // Lấy tất cả bài đã publish, sắp xếp theo ngày tạo giảm dần
    List<Post> findByPostStatusOrderByCreatedAtDesc(String postStatus);

    // Lấy 6 bài viết mới nhất đã publish
    List<Post> findTop6ByPostStatusOrderByCreatedAtDesc(String postStatus);
}