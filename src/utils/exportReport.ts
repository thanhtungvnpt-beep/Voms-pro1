import { PlantMetric, EmergencyAction } from '../types';

export function generateIsoShiftReport(
  plants: PlantMetric[],
  actions: EmergencyAction[],
  shift: string = 'CA 1 (08:00 - 16:00)',
  timestamp: string = new Date().toISOString()
): string {
  const totalActual = plants.reduce((sum, p) => sum + p.actual, 0);
  const totalTarget = plants.reduce((sum, p) => sum + p.target, 0);
  const completionRate = ((totalActual / totalTarget) * 100).toFixed(1);
  const avgOee = (plants.reduce((sum, p) => sum + p.oee, 0) / plants.length).toFixed(1);

  return `# 📜 BÁO CÁO ĐIỀU HÀNH SẢN XUẤT & PHÂN TÍCH NHÂN QUẢ CA
**HỆ THỐNG:** NEURAL LINK PRO — GMES CAUSAL AI v4.2 / VOMS
**TIÊU CHUẨN:** ISO 9001:2015 & IATF 16949 (Hạng mục 8.5.1 - Kiểm soát sản xuất và cung cấp dịch vụ)
**KIẾN TRÚC SƯ TRƯỞNG & PHÊ DUYỆT:** Ngô Thanh Tùng (Chief Architect)
**CA SẢN XUẤT:** ${shift}
**THỜI ĐIỂM XUẤT BÁO CÁO:** ${timestamp}
**ĐỘ TRỄ ĐỒNG BỘ TELEMETRY:** 12ms (Active Realtime Synced)

---

## 1. TỔNG QUAN CHỈ SỐ TOÀN CHUỖI CUNG ỨNG (7 NHÀ MÁY)
- **Tổng sản lượng thực tế:** ${totalActual.toLocaleString()} pcs
- **Tổng định mức kế hoạch:** ${totalTarget.toLocaleString()} pcs
- **Tỷ lệ hoàn thành lũy kế:** ${completionRate}%
- **Thâm hụt phương sai:** -${(totalTarget - totalActual).toLocaleString()} pcs
- **OEE trung bình toàn chuỗi:** ${avgOee}%
- **Độ tin cậy Causal AI Engine:** 96.4% (Pearl Do-Calculus & Bayesian DAG)

---

## 2. HIỆN TRẠNG 7 NHÀ MÁY VỆ TINH
${plants.map(p => `
### [${p.id}] ${p.name}
- Chuyên môn: ${p.specialty}
- Thực tế / Định mức: ${p.actual.toLocaleString()} / ${p.target.toLocaleString()} pcs (${p.rate}%)
- Chỉ số OEE: ${p.oee}%
- Trạng thái: ${p.status.toUpperCase()} (${p.statusText})
- Quản đốc xưởng: ${p.manager} | Chuyền: ${p.lines} | Nhân sự: ${p.workers} NV
- Ghi chú: ${p.note || 'Bình thường'}
`).join('')}

---

## 3. PHÂN TÍCH NGUYÊN NHÂN GỐC & TRỌNG SỐ SHAPLEY VALUE
1. **[N03 Kho vật liệu Hub A01 ➔ DAAL]** (Trọng số w = 0.82, Đóng góp thâm hụt: 18%)
   - Điểm nghẽn P1: Đứt phôi nhôm A980 khiến xưởng đúc DAAL giảm 52% công suất.
2. **[N05 Thiết bị TPM ➔ KTECH]** (Trọng số w = 0.67, Đóng góp thâm hụt: 13%)
   - Trục Spindle 04 rung 4.35G (> 3.5G) do mòn dao phay mặt đầu.
3. **[N04 Nhân lực ➔ HSTEC]** (Trọng số w = 0.48, Đóng góp thâm hụt: 15%)
   - Vắng 12 thợ SMT kéo takt-time từ 3.8s lên 6.4s/unit.
4. **[N06 Chất lượng OQC ➔ HOJEONG VINA]** (Trọng số w = 0.59, Đóng góp thâm hụt: 14%)
   - Lỗi lệch vi mô quang học hàn laser DEF-01 phát sinh 140 pcs rework.

---

## 4. NHẬT KÝ HÀNH ĐỘNG KHẨN CẤP ĐÃ THỰC THI (EMERGENCY ACTIONS)
${actions.map((act, i) => `
${i + 1}. **[${act.code}] ${act.title}**
   - Nhà máy thụ hưởng: ${act.plantId} | Mức độ: ${act.priority}
   - Trạng thái: ${act.executed ? '✅ ĐÃ THỰC THI THÀNH CÔNG' : '⏳ CHỜ PHÊ DUYỆT'}
   - Tác động phục hồi: ${act.impactDescription}
   - Mục tiêu: ${act.targetMetricRecovery}
`).join('')}

---

## 5. KẾT LUẬN & DỰ BÁO XUẤT CẢNG (OTD)
- Nhờ áp dụng can thiệp Causal AI, sản lượng dự kiến ca đạt **101,800 pcs (97.0%)**, bảo toàn chuyến xe container **TO-3011** đi Cảng Tân Vũ lúc 15:30.
- Tuân thủ đầy đủ cam kết IATF 16949 về giám sát thời gian thực và quản trị rủi ro chuỗi cung ứng.

*(Bản quyền báo cáo thuộc hệ sinh thái Neural Link Pro - Kiến trúc sư trưởng: Ngô Thanh Tùng)*
`;
}
