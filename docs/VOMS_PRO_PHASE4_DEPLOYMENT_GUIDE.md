# VOMS PRO — PHASE 4: PRODUCTION DEPLOYMENT & OPERATION RUNBOOK

**Môi trường:** Node.js 20+ / TypeScript / Express / Vite  
**Cổng tiêu chuẩn:** Port 3000  

---

## 1. KHỞI CHẠY HỆ THỐNG (STARTUP RUNBOOK)

### Khởi chạy môi trường Phát triển / Local:
```bash
npm run dev
# Máy chủ khởi động tại: http://0.0.0.0:3000
# Endpoint REST API: http://localhost:3000/api/v1/automation/...
```

### Xây dựng bản dựng và triển khai Production:
```bash
npm run build
npm run preview # hoặc node server.ts
```

---

## 2. CHẠY BỘ KIỂM THỬ TOÀN DIỆN (AUTOMATED TEST VERIFICATION)

Để kiểm tra toàn diện cả 3 giai đoạn (Phase 1, Phase 3, Phase 4) nhằm xác minh 0 lỗi và 0 hồi quy:

```bash
# 1. Chạy bộ kiểm thử tự động Phase 4 (22 kịch bản / 24 assertions)
npx tsx tests/phase4_automation_tests.ts

# 2. Chạy bộ kiểm thử tự động Phase 3 AI Control Tower (28 assertions)
npx tsx tests/phase3_control_tower_tests.ts

# 3. Chạy bộ kiểm thử tự động Phase 1 Trust Foundation (20 assertions)
npx tsx tests/phase1_audit_tests.ts
```

Tất cả các lệnh trên phải trả về exit code `0` với tỷ lệ đạt chuẩn **100% PASS**.

---

## 3. CHECKLIST KIỂM TOÁN AN TOÀN TRƯỚC VẬN HÀNH (SAFETY PRE-FLIGHT CHECKLIST)

- [x] Không lưu trữ bí mật (API Keys / Passwords) trong mã nguồn Client.
- [x] Cơ chế Anti-Self-Approval và Dual Approval hoạt động ở tầng Server Middleware.
- [x] Mọi yêu cầu biến đổi đều được gán `x-correlation-id` và `x-idempotency-key`.
- [x] Các điểm kết nối GMES/RPA được gắn cờ `disclaimer` trung thực rõ ràng.
- [x] Cơ chế Kill Switch ngắt nguồn robot RPA tức thời sẵn sàng trong trường hợp khẩn cấp.
- [x] Hàng đợi Dead Letter Queue (DLQ) ghi nhận và cô lập đầy đủ mọi lỗi nghiệp vụ bất định.
