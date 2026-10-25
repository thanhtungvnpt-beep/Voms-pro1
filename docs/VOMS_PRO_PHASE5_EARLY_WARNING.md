# VOMS PRO PHASE 5 — EARLY WARNING SYSTEM & SLA ESCALATION

**Phân hệ:** Early Warning System (Module D)  
**Tiêu chuẩn điều hành:** Real-time SLA Governance & Risk Projections  

---

## 1. CƠ CHẾ DỰ BÁO NGUY CƠ SỚM (PREDICTIVE WARNING CRITERIA)

Early Warning System không chỉ ghi nhận sự cố đã xảy ra mà chủ động tính toán nguy cơ trước khi sự cố phát tác ra thực địa:

1. **Nguy cơ Giao hàng Trễ hạn (OTD Failure Risk):**
   - Đơn vận chuyển TO-3011 (Hải Phòng Port Gate 4).
   - Dự báo: Tốc độ đóng hàng hiện tại chỉ đạt 8,600 / 18,000 pcs; thời gian tới giờ tàu rời cảng (ETD) còn 2.5 giờ.
   - Thiệt hại dự kiến: \$18,400 SLA Penalty.
2. **Nguy cơ Tăng vọt Phế phẩm (Defect Surge Spike):**
   - Xu hướng lệch tiêu cự quang học thấu kính hàn laser tại HOJEONG VINA.
   - Dự báo: Lỗi hàn vỏ camera tăng vượt 6.5% trong 3 ca tiếp theo nếu không offset quang học.
3. **Nguy cơ Phá hủy Thiết bị (Catastrophic Spindle Failure):**
   - Nhiệt độ ổ bi vượt 68°C kết hợp rung chấn harmonic 2.4 kHz tại KTECH.
   - Dự báo: Cháy kẹt Spindle 04 trong vòng 3.2 giờ; thiệt hại dừng máy \$24,000.

---

## 2. QUẢN LÝ THỜI GIAN SLA VÀ LEO THANG TỰ ĐỘNG

- **Đồng hồ đếm ngược SLA (`slaRemainingMinutes`):** Hiển thị trực tiếp thời gian còn lại trước khi hết hạn phản hồi xử lý.
- **Cấp độ Leo thang (Escalation Level):**
  - **Cấp 1:** Thông báo cho Kỹ thuật viên phụ trách phân xưởng.
  - **Cấp 2:** Leo thang tới Quản đốc Phân xưởng và Điều độ Kế hoạch.
  - **Cấp 3:** Leo thang khẩn cấp tới Ban Lãnh đạo VOMS (Management) và kích hoạt cơ chế can thiệp ưu tiên.
