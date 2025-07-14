package com.example.project.entity;

import java.io.Serializable;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;   

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "MedicalRecordBooking",
    uniqueConstraints = @UniqueConstraint(
        name = "UQ_RecordBooking",
        columnNames = {"recordId", "bookId"}
    )
)
public class MedicalRecordBooking implements Serializable {

    @EmbeddedId
    private MedicalRecordBookingId id;


    @Embeddable
    @Getter
    @Setter
    @AllArgsConstructor
    @NoArgsConstructor
    public static class MedicalRecordBookingId implements Serializable {
        @Column(name = "recordId")
        private Integer recordId;

        @Column(name = "bookId")
        private Integer bookId;
    }
}
