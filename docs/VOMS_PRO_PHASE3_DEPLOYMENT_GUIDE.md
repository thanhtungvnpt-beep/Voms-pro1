# VOMS PRO PHASE 3 — PRODUCTION DEPLOYMENT & OPERATION GUIDE
**Môi trường**: Enterprise On-Premise / Hybrid Cloud / Docker Container  
**Phiên bản**: v3.0.0-PRO-ENTERPRISE  
**Cấu hình**: Node.js v20+ / TSX / Express / Vite / PostgreSQL Drizzle ORM  

---

## 1. YÊU CẦU PHẦN CỨNG & HẠ TẦNG TỐI THIỂU

- **CPU**: 4 vCPU (Khuyến nghị 8 vCPU cho phân tích Causal DAG quy mô lớn).
- **RAM**: 8 GB (Khuyến nghị 16 GB để đệm telemetry 7 nhà máy).
- **Ổ cứng**: 50 GB SSD NVMe (Lưu trữ nhật ký kiểm toán SHA-256 bất biến).
- **Mạng**: Băng thông nội bộ tối thiểu 1 Gbps, độ trễ giữa các nhà máy vệ tinh < 25ms.

---

## 2. BIẾN MÔI TRƯỜNG BẮT BUỘC (`.env`)

```env
# Server Runtime
PORT=3000
NODE_ENV=production

# Database (PostgreSQL Cloud SQL / On-Premise)
DATABASE_URL=postgresql://voms_admin:SecurePass9981@localhost:5432/voms_production

# AI Engine & Gemini API
GEMINI_API_KEY=your_gemini_api_key_here

# Security & Audit Salt
AUDIT_INTEGRITY_SALT=9f8e7d6c5b4a3210987654321fedcba0
JWT_SIGNING_SECRET=voms_pro_enterprise_jwt_secret_key_2026

# Guardrails
ENFORCE_HITL_GATING=true
ENABLE_DUAL_APPROVAL_LEVEL_4=true
```

---

## 3. CÁC BƯỚC KHỞI ĐỘNG HỆ THỐNG

### Bước 1: Cài đặt thư viện phụ thuộc
```bash
npm install
```

### Bước 2: Kiểm tra cú pháp & biên dịch mã nguồn
```bash
npm run build
npm run lint
```

### Bước 3: Chạy bộ kiểm thử tự động xác minh trước khi vận hành
```bash
# Kiểm thử nền tảng tin cậy Phase 1 (20 tests)
npx tsx tests/phase1_audit_tests.ts

# Kiểm thử AI Control Tower & HITL Gateway Phase 3 (28 tests)
npx tsx tests/phase3_control_tower_tests.ts
```

### Bước 4: Khởi chạy máy chủ sản xuất
```bash
npm run start
```
*Hệ thống sẽ lắng nghe tại cổng `http://localhost:3000`.*

---

## 4. QUY TRÌNH XỬ LÝ SỰ CỐ KHẨN CẤP (EMERGENCY RUNBOOK)

1. **Khi phát hiện AI đưa ra khuyến nghị bất thường**:
   - Chuyển vai trò sang `SYSTEM_ADMIN` hoặc `MANAGEMENT`.
   - Bấm nút **"Từ chối" (Reject)** hoặc **"Hỏi thêm thông tin" (Request Info)** trên giao diện đề xuất.
   - Trạng thái sẽ lập tức bị khóa, ngăn cản mọi hành vi gửi tín hiệu xuống thiết bị.
2. **Khi phát hiện cảnh báo quá hạn SLA**:
   - Hệ thống tự động nâng cấp mức cảnh báo (e.g. P2 lên P1) và gửi thông báo trực tiếp đến Trưởng ban Thuê ngoài (`OUTSOURCING_GROUP`).
   - Vào tab **"Trung tâm cảnh báo"**, bấm nút **"Tiếp nhận" (Acknowledge)** để phân bổ nhân sự kiểm tra hiện trường.
