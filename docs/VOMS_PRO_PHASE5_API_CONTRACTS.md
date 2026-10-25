# VOMS PRO PHASE 5 — API CONTRACTS & ENDPOINT SPECIFICATIONS

**Phiên bản API:** v1 (Phase 5 Operational Intelligence)  
**Tiền tố đường dẫn:** `/api/v1/phase5` (đồng thời alias tại `/api/v1/operational-intelligence`)  
**Xác thực:** Bearer JWT Token tại header `Authorization: Bearer <TOKEN>`  

---

## 1. NHÓM QUẢN LÝ VÒNG ĐỜI & KÍCH HOẠT (LIFECYCLE)

### 1.1 `GET /api/v1/phase5/lifecycle/status`
- **Mô tả:** Lấy thông tin trạng thái vòng đời, tóm tắt kết quả preflight, số lượng module hoạt động và các snapshot.
- **Thẩm quyền:** Tất cả vai trò đã xác thực.
- **Mã phản hồi:** `200 OK`.

### 1.2 `POST /api/v1/phase5/lifecycle/preflight`
- **Mô tả:** Chạy 8 bài kiểm tra tiền triển khai thực tế.
- **Thẩm quyền:** Tất cả vai trò đã xác thực.
- **Mã phản hồi:** `200 OK`.

### 1.3 `POST /api/v1/phase5/lifecycle/activate`
- **Mô tả:** Kích hoạt Phase 5, chuyển trạng thái sang `RUNNING`.
- **Thẩm quyền:** `SYSTEM_ADMIN` hoặc `MANAGEMENT` (Từ chối 403 đối với vai trò khác).
- **Body:** `{ modules?: Record<string, boolean> }`
- **Mã phản hồi:** `200 OK` hoặc `400 Bad Request` nếu preflight chưa đạt.

### 1.4 `POST /api/v1/phase5/lifecycle/pause`
- **Mô tả:** Tạm dừng Phase 5. Không ảnh hưởng Phase 1–4.
- **Thẩm quyền:** `SYSTEM_ADMIN` hoặc `MANAGEMENT`.
- **Mã phản hồi:** `200 OK`.

### 1.5 `POST /api/v1/phase5/lifecycle/resume`
- **Mô tả:** Tiếp tục vận hành sau khi tạm dừng.
- **Thẩm quyền:** `SYSTEM_ADMIN` hoặc `MANAGEMENT`.
- **Mã phản hồi:** `200 OK`.

### 1.6 `POST /api/v1/phase5/lifecycle/rollback`
- **Mô tả:** Quay lui hệ thống về baseline Phase 4 ổn định. Bảo toàn audit log.
- **Thẩm quyền:** `SYSTEM_ADMIN`.
- **Mã phản hồi:** `200 OK`.

---

## 2. NHÓM KPI ENGINE (MODULE A)

### 2.1 `GET /api/v1/phase5/kpis`
- **Query params:** `group?: 'EQUIPMENT' | 'PRODUCTION_PLAN' | 'QUALITY' | 'VENDOR_PERFORMANCE' | 'DATA_TRUST' | 'INCIDENT_CAPA'`
- **Mã phản hồi:** `200 OK`.

### 2.2 `POST /api/v1/phase5/kpis/evaluate`
- **Mô tả:** Kích hoạt động cơ tính toán lại các chỉ số KPI với chữ ký nguồn gốc SHA-256.
- **Mã phản hồi:** `200 OK`.

---

## 3. NHÓM PHÁT HIỆN BẤT THƯỜNG & CẢNH BÁO SỚM (MODULE C & D)

### 3.1 `GET /api/v1/phase5/anomalies`
- **Mô tả:** Danh sách các bất thường kèm mức độ nghiêm trọng, điểm tin cậy và khuyến nghị.

### 3.2 `POST /api/v1/phase5/anomalies/detect`
- **Mô tả:** Chạy quét bất thường tức thời.

### 3.3 `GET /api/v1/phase5/early-warnings`
- **Mô tả:** Danh sách cảnh báo sớm kèm đồng hồ SLA và cấp độ leo thang.

---

## 4. NHÓM NGUYÊN NHÂN GỐC RỄ & CAPA (MODULE E & F)

### 4.1 `GET /api/v1/phase5/rca` & `GET /api/v1/phase5/rca/:id`
- **Mô tả:** Danh sách và chi tiết hồ sơ phân tích 5 Whys và Ishikawa 6M.

### 4.2 `POST /api/v1/phase5/rca/create`
- **Mô tả:** Khởi tạo hồ sơ RCA mới.

### 4.3 `POST /api/v1/phase5/rca/:id/verify`
- **Mô tả:** Xác thực bằng chứng nguyên nhân gốc rễ.

### 4.4 `GET /api/v1/phase5/capa`
- **Mô tả:** Danh sách hành động khắc phục/phòng ngừa.

### 4.5 `POST /api/v1/phase5/capa/create`
- **Mô tả:** Tạo đề xuất CAPA.

### 4.6 `POST /api/v1/phase5/capa/:id/transition`
- **Mô tả:** Chuyển trạng thái CAPA. Áp dụng Anti-Self-Approval và Dual-Approval 2 cấp.

---

## 5. NHÓM NGHIỆM THU KHÉP KÍN & 7 NHÀ MÁY (MODULE G, H, I)

### 5.1 `GET /api/v1/phase5/closed-loop`
- **Mô tả:** Danh sách chứng chỉ nghiệm thu cải tiến.

### 5.2 `POST /api/v1/phase5/closed-loop/verify`
- **Mô tả:** Nghiệm thu hiệu quả cải tiến định lượng (Baseline vs Post, p-value).

### 5.3 `GET /api/v1/phase5/vendor-benchmarks`
- **Mô tả:** Bảng xếp hạng và ma trận năng lực 7 nhà máy vệ tinh.

### 5.4 `POST /api/v1/phase5/ai/synthesize-decision`
- **Mô tả:** Tổng hợp quyết định AI có khoảng tin cậy 95% và căn cứ xác thực.
