# VOMS PRO — PHASE 4: WORKFLOW ORCHESTRATION ENGINE (9-STATE FSM)

**Mô hình:** Finite State Machine (FSM) 9 trạng thái điều phối quy trình vận hành sản xuất.

---

## 1. MA TRẬN 9 TRẠNG THÁI FSM (STATE TRANSITION MATRIX)

```
 [ DRAFT ] ---> [ READY ] ---> [ RUNNING ] -------------> [ COMPLETED ]
                   ^               |    |
                   |               |    +---> [ PAUSED ] ---> (Resume)
                   |               |
                   +-- [ WAITING_APPROVAL ] (Cổng HITL)
                   |
                   +-- [ WAITING_RETRY ] (Khi gặp lỗi tạm thời)
                   |
                   v
             [ FAILED ]  /  [ CANCELLED ]
```

### Các trạng thái chuẩn hóa:
1. `DRAFT`: Bản phác thảo quy trình đang soạn thảo.
2. `READY`: Đã xác thực điều kiện tiên quyết và có đủ phê duyệt, sẵn sàng kích hoạt.
3. `RUNNING`: Đang thực thi các bước tuần tự hoặc phân nhánh.
4. `WAITING_APPROVAL`: Tạm dừng tại Cổng Phê duyệt Con người (bắt buộc cho Level C & Level D).
5. `WAITING_RETRY`: Chờ khoảng nghỉ thử lại (exponential backoff) khi gặp lỗi tạm thời.
6. `PAUSED`: Bị tạm dừng thủ công bởi Quản đốc hoặc Kế hoạch viên.
7. `COMPLETED`: Tất cả các bước đã hoàn tất an toàn.
8. `FAILED`: Thất bại không thể phục hồi và đã được chuyển vào Exception Queue (DLQ).
9. `CANCELLED`: Bị hủy bởi người có thẩm quyền.

---

## 2. QUẢN LÝ KHÓA CẠNH TRANH (CONCURRENCY LOCKS)

Để ngăn chặn race conditions khi hai quy trình cùng tác động vào một tài nguyên vật lý (ví dụ: cấp phôi cùng lúc cho DAAL hoặc reset cùng trục dao phay KTECH):
- Mỗi quy trình được gán `concurrencyKey` duy nhất (ví dụ: `PLANT_DAAL_MATERIAL`, `PLANT_KTECH_SPINDLE`).
- Trong suốt thời gian chạy (`RUNNING`), khóa được giữ chặt chẽ trong `ACTIVE_CONCURRENCY_LOCKS`.
- Bất kỳ yêu cầu thực thi quy trình khác mang cùng khóa cạnh tranh sẽ bị từ chối với mã lỗi `HTTP 409 Conflict - CONCURRENCY_LOCKED`.
- Khóa tự động giải phóng khi quy trình chuyển sang `COMPLETED`, `FAILED`, `CANCELLED` hoặc `PAUSED`.
