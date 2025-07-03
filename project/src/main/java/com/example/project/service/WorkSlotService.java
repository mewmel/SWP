package com.example.project.service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.example.project.dto.DoctorWeekScheduleDTO;
import com.example.project.entity.WorkSlot;
import com.example.project.repository.WorkSlotRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class WorkSlotService {
    private final WorkSlotRepository workSlotRepository;

    // Ánh xạ weekday sang số ngày cộng thêm từ weekStartDate (Thứ 2)
    private static final Map<String, Integer> WEEKDAY_OFFSET = Map.of(
            "T2", 0, "T3", 1, "T4", 2, "T5", 3, "T6", 4, "T7", 5, "CN", 6
    );
    // Ca sáng: 8-9, 9-10, 10-11, 11-12
    private static final List<SlotTimeRange> MORNING_SLOTS = List.of(
            new SlotTimeRange(LocalTime.of(8, 0), LocalTime.of(9, 0)),
            new SlotTimeRange(LocalTime.of(9, 0), LocalTime.of(10, 0)),
            new SlotTimeRange(LocalTime.of(10, 0), LocalTime.of(11, 0)),
            new SlotTimeRange(LocalTime.of(11, 0), LocalTime.of(12, 0))
    );
    // Ca chiều: 14-15, 15-16, 16-17
    private static final List<SlotTimeRange> AFTERNOON_SLOTS = List.of(
            new SlotTimeRange(LocalTime.of(14, 0), LocalTime.of(15, 0)),
            new SlotTimeRange(LocalTime.of(15, 0), LocalTime.of(16, 0)),
            new SlotTimeRange(LocalTime.of(16, 0), LocalTime.of(17, 0))
    );

    public void saveDoctorWeekSchedules(List<DoctorWeekScheduleDTO> weekScheduleDTOs) {
        for (DoctorWeekScheduleDTO dto : weekScheduleDTOs) {
            Integer maID = dto.getMaId(); // lấy maID từ DTO
            for (DoctorWeekScheduleDTO.ShiftDTO shift : dto.getShifts()) {
                Integer offset = WEEKDAY_OFFSET.get(shift.getWeekday());
                if (offset == null) continue; // bỏ qua nếu sai key
                LocalDate date = dto.getWeekStartDate().plusDays(offset);
                int maxPatient = shift.getMaxPatient() != null ? shift.getMaxPatient() : 2;
                if (Boolean.TRUE.equals(shift.getMorning())) {
                    for (SlotTimeRange slot : MORNING_SLOTS) {
                        WorkSlot ws = new WorkSlot();
                        ws.setDocId(dto.getDocId());
                        ws.setMaId(maID); // Lưu maID vào entity
                        ws.setWorkDate(date);
                        ws.setStartTime(slot.start);
                        ws.setEndTime(slot.end);
                        ws.setMaxPatient(maxPatient);
                        ws.setSlotStatus("approved");
                        workSlotRepository.save(ws);
                    }
                }
                if (Boolean.TRUE.equals(shift.getAfternoon())) {
                    for (SlotTimeRange slot : AFTERNOON_SLOTS) {
                        WorkSlot ws = new WorkSlot();
                        ws.setDocId(dto.getDocId());
                        ws.setMaId(maID); // Lưu maID vào entity
                        ws.setWorkDate(date);
                        ws.setStartTime(slot.start);
                        ws.setEndTime(slot.end);
                        ws.setMaxPatient(maxPatient);
                        ws.setSlotStatus("approved");
                        workSlotRepository.save(ws);
                    }
                }
            }
        }
    }

    public static class SlotTimeRange {
        public final LocalTime start;
        public final LocalTime end;
        public SlotTimeRange(LocalTime start, LocalTime end) {
            this.start = start;
            this.end = end;
        }
    }
}