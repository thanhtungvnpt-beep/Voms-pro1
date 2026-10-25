# VOMS PRO PHASE 3 — HUMAN-IN-THE-LOOP (HITL) WORKFLOW SPECIFICATION
**Cơ chế**: Finite State Machine (FSM) & Anti-Self-Approval Enforcement  
**Tiêu chuẩn**: ISO 9001:2015 Clause 8.5, IATF 16949 Clause 8.5.1, EU AI Act Article 14 (Human Oversight)  

---

## 1. MÔ HÌNH MÁY TRẠNG THÁI HỮU HẠN (FINITE STATE MACHINE - 11 STATES)

Mọi đề xuất và hành động của AI phải tuân thủ nghiêm ngặt đồ thị trạng thái FSM:

```
                  ┌─────────┐
                  │   NEW   │
                  └────┬────┘
                       │
                       ▼
                 ┌───────────┐
                 │ ANALYZING │
                 └─────┬─────┘
                       │
       ┌───────────────┴───────────────┐
       ▼                               ▼
┌──────────────┐             ┌────────────────────────┐
│   PROPOSED   │             │ NEEDS_MORE_INFORMATION │
└──────┬───────┘             └───────────┬────────────┘
       ▼                                 │ (Refine evidence)
┌────────────────┐                       │
│ PENDING_REVIEW │ <─────────────────────┘
└──────┬─────────┘
       │
       ├─────────────────────────────────┐
       ▼                                 ▼
┌──────────────┐                  ┌──────────────┐
│   APPROVED   │                  │   REJECTED   │
└──────┬───────┘                  └──────────────┘
       ▼
┌──────────────┐
│  EXECUTING   │
└──────┬───────┘
       │
       ├─────────────────────────────────┐
       ▼                                 ▼
┌──────────────┐                  ┌──────────────┐
│  COMPLETED   │                  │    FAILED    │
└──────────────┘                  └──────────────┘
```

*Trạng thái `CANCELLED` có thể chuyển từ bất kỳ trạng thái nào trước khi thực thi.*

### Ma trận chuyển tiếp hợp lệ (`VALID_FSM_TRANSITIONS`):
- `NEW` ➔ `ANALYZING`, `CANCELLED`
- `ANALYZING` ➔ `PROPOSED`, `NEEDS_MORE_INFORMATION`, `CANCELLED`
- `PROPOSED` ➔ `PENDING_REVIEW`, `CANCELLED`
- `PENDING_REVIEW` ➔ `APPROVED`, `REJECTED`, `NEEDS_MORE_INFORMATION`, `CANCELLED`
- `APPROVED` ➔ `EXECUTING`, `CANCELLED`
- `EXECUTING` ➔ `COMPLETED`, `FAILED`
- `COMPLETED` ➔ (Terminal State)
- `FAILED` ➔ `ANALYZING`, `CANCELLED`
- `REJECTED` ➔ `ANALYZING`, `CANCELLED`
- `NEEDS_MORE_INFORMATION` ➔ `ANALYZING`, `CANCELLED`

Mọi nỗ lực nhảy cóc trạng thái (ví dụ từ `PENDING_REVIEW` sang thẳng `COMPLETED` mà không qua `APPROVED` và `EXECUTING`) bị hệ thống chặn đứng với mã lỗi HTTP `400 INVALID_FSM_TRANSITION`.

---

## 2. CHÍNH SÁCH CHỐNG TỰ PHÊ DUYỆT (STRICT ANTI-SELF-APPROVAL POLICY)

Tuân thủ nguyên tắc "Four-Eyes Principle" (Nguyên tắc Bốn Mắt):
1. **Người tạo không được tự phê duyệt**: Nếu `proposal.requestedBy === req.user.id`, yêu cầu phê duyệt bị từ chối với mã lỗi `403 SELF_APPROVAL_FORBIDDEN`.
2. **AI không được tự phê duyệt**: AI Agent là đối tượng đề xuất (`requestedBy = 'AI_AGENT_AUTONOMOUS'`), tuyệt đối không được cấp quyền approver token. Mọi phê duyệt phải được ký số bởi tài khoản người dùng người thật có đầy đủ vai trò nghiệp vụ.

---

## 3. THAO TÁC HỎI THÊM THÔNG TIN (NEEDS_MORE_INFORMATION)
Khi người vận hành nhận thấy dữ liệu hiện trường chưa đủ độ tin cậy:
- Trạng thái được chuyển về `NEEDS_MORE_INFORMATION`.
- Ghi nhận trường `moreInfoRequest` gồm: người hỏi, thời gian hỏi, câu hỏi chi tiết.
- Khuyến nghị được tạm hoãn cho đến khi có báo cáo xác minh hiện trường bổ sung.
