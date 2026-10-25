# VOMS PRO — PHASE 4: FAILURE RECOVERY & DEAD LETTER QUEUE (DLQ)

**Mục tiêu:** Phân loại 9 nhóm lỗi hệ thống và quy trình phục hồi, cô lập dữ liệu bất định vào Dead Letter Queue.

---

## 1. PHÂN LOẠI 9 NHÓM LỖI (9 FAILURE CLASSIFICATIONS)

1. `AUTH_FAILURE`: Lỗi xác thực token Bearer hoặc mTLS bắt tay adapter không thành công.
2. `TIMEOUT_TRANSIENT`: Quá thời gian chờ phản hồi do nghẽn mạng tạm thời (timeout > 5000ms).
3. `RATE_LIMITED`: Vượt quá hạn mức tần suất truy cập quy định (Rate limit / phút).
4. `SCHEMA_VALIDATION_ERROR`: Cấu trúc JSON không khớp với schema chuẩn ISO/GMES.
5. `DATA_CONFLICT`: Mâu thuẫn logic dữ liệu giữa các nguồn (ví dụ: SAP ERP vs Cảng Hải Phòng Gate 4).
6. `CIRCUIT_BREAKER_TRIGGERED`: Bộ ngắt mạch tự động nhảy sang trạng thái `OPEN` để bảo vệ hệ thống đối ngoại.
7. `RPA_CRASH`: Robot RPA gặp sự cố treo tiến trình hoặc bị ngắt bởi Kill Switch.
8. `DOWNSTREAM_5XX`: Hệ thống biên hạ tầng trả về lỗi nội bộ 500/502/503.
9. `BUSINESS_RULE_VIOLATION`: Vi phạm quy tắc nghiệp vụ (ví dụ: số lượng xuất kho vượt tồn kho khả dụng).

---

## 2. HÀNG ĐỢI NGOẠI LỆ / DEAD LETTER QUEUE (DLQ)

- Khi một tác vụ tự động hóa gặp lỗi không thể giải quyết tức thì, tác vụ không bị hủy bỏ âm thầm mà được cô lập nguyên vẹn vào `EXCEPTION_QUEUE_DB`.
- Mỗi mục trong DLQ lưu trữ đầy đủ `correlationId`, `sourceModule`, `entityId`, `failureCategory`, `errorMessage`, `originalPayload`, và bộ đếm `retryAttempts`.
- **Cơ chế Thử lại (Retry):**
  - Tối đa 3 lần thử (`maxRetries = 3`).
  - Nếu thử lại thành công, bản ghi tự động chuyển trạng thái sang `RESOLVED`.
- **Cơ chế Xử lý Thủ công (Manual Resolve):**
  - Khi vượt quá số lần thử hoặc gặp mâu thuẫn dữ liệu phức tạp (`DATA_CONFLICT`), người có thẩm quyền (`DATA_OPERATOR`, `QC`, `MANAGEMENT`) trực tiếp đối soát chứng từ và bấm "Xác nhận Xử lý thủ công", lưu vết Audit Log.
