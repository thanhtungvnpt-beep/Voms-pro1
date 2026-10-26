# VOMS PRO — CÔNG NGHỆ GIỌNG NÓI HIỆN TRƯỜNG (MODULE B)
## VOICE AI: SPEECH RECOGNITION & TEXT-TO-SPEECH TTS ENGINE
**Mã tài liệu:** `VOMS-DOC-P6-M02-006`  
**Phiên bản:** `v6.0.0-PRO`  

---

### 1. KIẾN TRÚC TÍCH HỢP VOICE AI
- **Nhận dạng giọng nói (STT - Speech-to-Text):** Sử dụng `webkitSpeechRecognition` / `SpeechRecognition` chuẩn W3C Web Speech API với hỗ trợ tiếng Việt (`vi-VN`), tiếng Anh (`en-US`), tiếng Hàn (`ko-KR`).
- **Phát âm phản hồi (TTS - Text-to-Speech):** Sử dụng `window.speechSynthesis` đọc nội dung hướng dẫn sửa chữa và các cảnh báo an toàn.
- **Cơ chế Dự phòng (Text Fallback Mode):** Trong môi trường phân xưởng cơ khí có độ ồn vượt quá 85dB hoặc trình duyệt không hỗ trợ Web Speech API, giao diện tự động chuyển đổi sang ô nhập liệu văn bản với gợi ý các câu hỏi kỹ thuật thường gặp (Quick Prompt Chips).

---

### 2. TẬP KHẨU LỆNH CHUẨN ĐƯỢC HUẤN LUYỆN
1. `"Máy phay Makino 01 báo rung động trục chính 4.2mm/s cần kiểm tra dao"` -> Tự động truy xuất `SOP-CNC-SPINDLE-04`.
2. `"Lệch chùm laser máy Trumpf"` -> Tự động gợi ý kiểm tra thấu kính bảo vệ theo `SOP-LASER-CALIB-01`.
3. `"Thiếu phôi nhôm đúc chuyền DAAL"` -> Báo cáo tình hình tiếp nhận phôi từ Hub A01 và kiểm tra nhiệt độ lò nấu.
