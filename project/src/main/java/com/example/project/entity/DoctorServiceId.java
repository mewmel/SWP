package com.example.project.entity;

import java.io.Serializable;
import java.util.Objects;

public class DoctorServiceId implements Serializable {
    private Integer docId;
    private Integer serId;

    // equals & hashCode
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof DoctorServiceId)) return false;
        DoctorServiceId that = (DoctorServiceId) o;
        return Objects.equals(docId, that.docId) && Objects.equals(serId, that.serId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(docId, serId);
    }
}