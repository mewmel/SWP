package com.example.project.repository;

import java.util.List;
import com.example.project.entity.BookingStep;
import org.springframework.data.jpa.repository.JpaRepository;
;

public interface BookingStepRepository extends JpaRepository<BookingStep, Integer> {
    List<BookingStep> findByBookId(Integer bookId);

}