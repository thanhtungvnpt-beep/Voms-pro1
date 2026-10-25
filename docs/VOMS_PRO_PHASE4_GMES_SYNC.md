# VOMS PRO — PHASE 4: 11-STEP GMES SYNCHRONIZATION RUNBOOK

**Mục tiêu:** Chu trình đồng bộ dữ liệu sản xuất và viễn trắc 7 nhà máy vệ tinh với GMES Enterprise Suite v4.2 PRO.

---

## 1. VÒNG ĐỜI ĐỒNG BỘ 11 BƯỚC (11-STEP SYNCHRONIZATION LIFECYCLE)

| Bước | Mã Bước | Tên Bước | Mô Tả Kỹ Thuật | Tiêu Chí Đạt Chuẩn |
|---|---|---|---|---|
| **1** | `AUTH_HANDSHAKE` | Trigger & Xác thực Token GMES v4.2 | Bắt tay mTLS & Bearer Token qua Mock Adapter v4.2 | Token hợp lệ, độ trễ < 15ms |
| **2** | `EXTRACT_PAYLOAD` | Kéo dữ liệu từ 7 nhà máy vệ tinh | Trích xuất viễn trắc sản lượng, OEE và tồn kho từ KHV, DREAM TECH, HSTEC, KTECH, HOJEONGB, HOJEONG VINA, DAAL | Trích xuất đủ 7/7 nhà máy |
| **3** | `STAGING_INGEST` | Nạp vào vùng đệm Staging Isolation | Ghi tạm dữ liệu vào kho đệm cô lập, ngăn chặn ô nhiễm dữ liệu nguồn | 100% bản ghi được cô lập |
| **4** | `SCHEMA_VALIDATION` | Kiểm tra Schema JSON & Data Types | Đối chiếu JSON Schema định dạng ISO 9001, lọc các trường null hoặc số âm | Không có lỗi sai kiểu dữ liệu |
| **5** | `DEDUPLICATION` | Khử trùng lặp Barcode & Timestamp ID | Loại trừ các lần quét trùng lặp mã vạch trong chu kỳ quét 800ms | 0 bản ghi trùng lặp lọt vào đích |
| **6** | `CONFLICT_DETECTION` | Phát hiện mâu thuẫn dữ liệu chéo | So khớp trạng thái giữa SAP ERP và GMES để phát hiện xung đột số lượng | Đánh dấu bản ghi conflict vào Staging |
| **7** | `TRANSFORMATION` | Chuẩn hóa & Ánh xạ Causal Graph Models | Ánh xạ cấu trúc dữ liệu nhà máy sang Pearl DAG 18 Nodes (N01-N18) | Khớp hoàn toàn mô hình Causal |
| **8** | `STAGING_VERIFY` | Xác minh tính toàn vẹn Checksum SHA-256 | Tính toán mã băm SHA-256 kiểm tra tính toàn vẹn của lô dữ liệu staging | Checksum khớp 100% |
| **9** | `TARGET_COMMIT` | Ghi dữ liệu vào Kho Production Telemetry | Atomic commit bản ghi đã làm sạch vào cơ sở dữ liệu `PLANTS_DB` | Bản ghi được ghi an toàn |
| **10** | `AUDIT_EMISSION` | Phát sự kiện Audit Log & Khóa Hash | Ghi nhận sự kiện `TRIGGER_GMES_11STEP_SYNC` vào sổ cái kiểm toán bất biến | Tạo bản ghi SHA-256 kèm correlation ID |
| **11** | `RECONCILIATION` | Đối soát hậu đồng bộ (Post-Sync Recon) | Đối soát tổng sản lượng thực tế với báo cáo GMES để đảm bảo khớp 100% | Chênh lệch 0 pcs |

---

## 2. XỬ LÝ XUNG ĐỘT STAGING (CONFLICT RESOLUTION)

Khi xuất hiện bản ghi có trạng thái `CONFLICT` (ví dụ: SAP ERP ghi nhận hàng đã lên xe nhưng cảng Hải Phòng Gate 4 ghi nhận chậm chuyến), bản ghi được giữ lại tại Staging. Người vận hành thuộc vai trò `DATA_OPERATOR`, `QC`, hoặc `MANAGEMENT` có quyền xem chi tiết và bấm "Xử lý xung đột" thông qua API `POST /api/v1/automation/gmes-sync/staging/:recordId/resolve` kèm giải trình để commit an toàn.
