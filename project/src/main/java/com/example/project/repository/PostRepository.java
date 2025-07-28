package com.example.project.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.project.entity.Post;

public interface PostRepository extends JpaRepository<Post, Integer> {
    // Lấy tất cả bài viết của một bác sĩ
    List<Post> findByDocId(Integer docId);

    // Lấy tất cả bài đã publish
    List<Post> findByPostStatus(String postStatus);

}
