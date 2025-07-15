package com.example.project.entity;

import java.io.Serializable;
import java.util.Objects;

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
@Table(
    name = "MedicalRecordBooking",
    uniqueConstraints = @UniqueConstraint(
        name = "UQ_RecordBooking",
        columnNames = {"recordId", "bookId"}
    )
)
public class MedicalRecordBooking implements Serializable {

    @EmbeddedId
    private MedicalRecordBookingId id;

    // KHÔNG KHAI BÁO field recordId, bookId ở ngoài nữa!!!
    // Các field này nằm trong EmbeddedId

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

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (!(o instanceof MedicalRecordBookingId)) return false;
            MedicalRecordBookingId that = (MedicalRecordBookingId) o;
            return Objects.equals(recordId, that.recordId) &&
                   Objects.equals(bookId, that.bookId);
        }

        @Override
        public int hashCode() {
            return Objects.hash(recordId, bookId);
        }
    }
}