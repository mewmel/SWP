package com.example.project.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.project.entity.PostImage;

public interface PostImageRepository extends JpaRepository<PostImage, Integer> {
    // Lấy tất cả ảnh của một bài viết
    List<PostImage> findByPost_PostId(Integer postId);

    // Lấy tất cả ảnh của một bài viết (alias method)
    List<PostImage> findByPostPostId(Integer postId);
}