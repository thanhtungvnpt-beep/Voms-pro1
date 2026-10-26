import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, Smartphone, Mic, MicOff, Volume2, Camera, Upload, 
  CheckCircle2, AlertTriangle, AlertCircle, Clock, ShieldCheck, 
  FileText, Search, ExternalLink, ChevronRight, RefreshCw, Send,
  Cpu, Wrench, Layers, Users, Zap, Eye, Check, X, ArrowUpRight,
  ShieldAlert, Lock, Radio, Sparkles
} from 'lucide-react';
import { soundManager } from '../../utils/audio';

// Trilingual dictionary
const I18N = {
  vi: {
    title: 'PHASE 6: TRỢ LÝ HIỆN TRƯỜNG & TRÍ TUỆ DI ĐỘNG',
    subtitle: 'Voice AI · Vision AI · Kho Tri Thức Kỹ Thuật · Thao Tác Di Động · Học Hỏi Khép Kín',
    tabs: {
      assistant: 'Trợ lý AI & SOP',
      workOrders: 'Phiếu Công Việc',
      visionAi: 'Giám Sát Vision AI',
      knowledgeHub: 'Kho Tri Thức',
      learningEscalation: 'Học Hỏi & Chuyên Gia'
    },
    safetyLoto: 'QUY CHUẨN AN TOÀN LOTO (LOCKOUT / TAGOUT) BẮT BUỘC',
    voiceListening: 'Đang lắng nghe khẩu lệnh hiện trường...',
    voicePrompt: 'Nhấn mic để đặt câu hỏi bằng giọng nói (hoặc gõ văn bản bên dưới)',
    createTicket: 'Tạo Phiếu Sự Cố Mới',
    escalateExpert: 'Chuyển Cấp Chuyên Gia (Level 4)',
    verifiedSop: 'Quy trình đã ký duyệt',
    slaCountdown: 'Hạn phản hồi SLA'
  },
  en: {
    title: 'PHASE 6: AI FIELD ASSISTANT & MOBILE INTELLIGENCE',
    subtitle: 'Voice AI · Vision AI · Technical Knowledge Hub · Mobile Operations · Continuous Learning',
    tabs: {
      assistant: 'AI Assistant & SOPs',
      workOrders: 'Work Orders',
      visionAi: 'Vision AI Inspector',
      knowledgeHub: 'Knowledge Hub',
      learningEscalation: 'Learning & Escalation'
    },
    safetyLoto: 'MANDATORY LOCKOUT / TAGOUT (LOTO) SAFETY PROTOCOL',
    voiceListening: 'Listening for field voice commands...',
    voicePrompt: 'Press mic to speak question (or type below)',
    createTicket: 'Create Incident Ticket',
    escalateExpert: 'Escalate to Expert (Level 4)',
    verifiedSop: 'Verified SOP Document',
    slaCountdown: 'SLA Response Deadline'
  },
  kr: {
    title: '6단계: AI 현장 어시스턴트 및 모바일 지능화',
    subtitle: '음성 AI · 비전 AI · 기술 지식 허브 · 모바일 현장 운용 · 폐루프 연속 학습',
    tabs: {
      assistant: 'AI 어시스턴트 & SOP',
      workOrders: '작업 지시서',
      visionAi: '비전 AI 검사기',
      knowledgeHub: '기술 지식 허브',
      learningEscalation: '연속 학습 및 전문가'
    },
    safetyLoto: '필수 안전 잠금 및 태그(LOTO) 프로토콜',
    voiceListening: '현장 음성 명령을 수신 중입니다...',
    voicePrompt: '마이크를 눌러 음성으로 질문하거나 아래에 입력하세요',
    createTicket: '신규 사고 티켓 생성',
    escalateExpert: '전문가 단계 에스컬레이션',
    verifiedSop: '승인된 표준작업절차서',
    slaCountdown: 'SLA 응답 마감 시한'
  }
};

export const MobileFieldAssistantModule: React.FC = () => {
  const [lang, setLang] = useState<'vi' | 'en' | 'kr'>('vi');
  const t = I18N[lang];

  // Active Tab
  const [activeTab, setActiveTab] = useState<'assistant' | 'workOrders' | 'visionAi' | 'knowledgeHub' | 'learningEscalation'>('assistant');
  const [selectedPlant, setSelectedPlant] = useState<string>('ALL');

  // Loading & Data States
  const [loading, setLoading] = useState<boolean>(false);
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [knowledgeArticles, setKnowledgeArticles] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [escalations, setEscalations] = useState<any[]>([]);
  const [lifecycleStatus, setLifecycleStatus] = useState<any>(null);

  // Chat & Voice States
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'assistant'; text: string; timestamp: string; sopRef?: string }>>([
    {
      sender: 'assistant',
      text: 'Xin chào! Tôi là Trợ lý Hiện trường VOMS PRO. Tôi có thể hỗ trợ bạn tra cứu quy trình thay dao CNC (KTECH), hiệu chuẩn Laser Trumpf (HOJEONG VINA), xử lý nồi phôi nhôm (DAAL) và tạo phiếu công việc khẩn cấp.',
      timestamp: '08:00',
      sopRef: 'SOP-CNC-SPINDLE-04'
    }
  ]);
  const [inputQuery, setInputQuery] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Vision AI States
  const [visionImage, setVisionImage] = useState<string>('https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=600&auto=format&fit=crop&q=70');
  const [visionLoading, setVisionLoading] = useState<boolean>(false);
  const [visionResult, setVisionResult] = useState<any>(null);

  // Knowledge Search State
  const [knowledgeSearchQuery, setKnowledgeSearchQuery] = useState<string>('');
  const [selectedArticle, setSelectedArticle] = useState<any>(null);

  // Create Work Order Modal State
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [newOrderForm, setNewOrderForm] = useState({
    plantId: 'DAAL',
    equipmentCode: 'CAST-INGOT-01',
    equipmentName: 'Lò đúc phôi nhôm cao áp A980',
    title: '',
    severity: 'HIGH',
    description: ''
  });

  // Auth token helper
  const getAuthToken = () => {
    return localStorage.getItem('voms_active_token') || 'token_admin_super_secret_9981';
  };

  // Load backend data
  const loadData = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      const headers = { 'Authorization': `Bearer ${token}` };

      const [resWo, resKnow, resLearn, resEsc, resStatus] = await Promise.all([
        fetch('/api/v1/phase6/work-orders', { headers }),
        fetch('/api/v1/phase6/knowledge', { headers }),
        fetch('/api/v1/phase6/learning/lessons', { headers }),
        fetch('/api/v1/phase6/escalation/tickets', { headers }),
        fetch('/api/v1/phase6/lifecycle/status', { headers })
      ]);

      if (resWo.ok) {
        const d = await resWo.json();
        setWorkOrders(d.workOrders || []);
      }
      if (resKnow.ok) {
        const d = await resKnow.json();
        setKnowledgeArticles(d.articles || []);
      }
      if (resLearn.ok) {
        const d = await resLearn.json();
        setLessons(d.lessons || []);
      }
      if (resEsc.ok) {
        const d = await resEsc.json();
        setEscalations(d.tickets || []);
      }
      if (resStatus.ok) {
        setLifecycleStatus(await resStatus.json());
      }
    } catch (err) {
      console.error('Failed to load Phase 6 field data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Web Speech API Voice Recognition
  const toggleVoiceRecognition = () => {
    soundManager.playClick();
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Trình duyệt hiện tại không hỗ trợ Web Speech API. Vui lòng nhập văn bản hoặc dùng Chrome/Edge.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = lang === 'kr' ? 'ko-KR' : lang === 'en' ? 'en-US' : 'vi-VN';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      setIsListening(true);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputQuery(transcript);
        setIsListening(false);
        handleSendQuery(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      setIsListening(false);
    }
  };

  // Text-to-speech readback
  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    soundManager.playClick();
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'kr' ? 'ko-KR' : lang === 'en' ? 'en-US' : 'vi-VN';
    utterance.rate = 1.0;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  // Chat Query Submission
  const handleSendQuery = async (queryText?: string) => {
    const q = queryText || inputQuery;
    if (!q.trim()) return;

    soundManager.playClick();
    const userMsg = {
      sender: 'user' as const,
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);
    setInputQuery('');

    try {
      const token = getAuthToken();
      const res = await fetch('/api/v1/phase6/voice/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ queryText: q, user: 'Kỹ thuật viên Hiện trường' })
      });

      const data = await res.json();
      const botMsg = {
        sender: 'assistant' as const,
        text: data.spokenReply || 'Đã nhận yêu cầu. Đang tra cứu quy trình chuẩn...',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sopRef: q.toLowerCase().includes('laser') ? 'SOP-LASER-CALIB-01' : q.toLowerCase().includes('phôi') ? 'SOP-INGOT-CAST-02' : 'SOP-CNC-SPINDLE-04'
      };

      setChatMessages(prev => [...prev, botMsg]);
      soundManager.playSuccess();
    } catch (err) {
      console.error('Field Assistant error', err);
    }
  };

  // Trigger Vision AI Inspection
  const handleRunVisionAnalysis = async () => {
    soundManager.playClick();
    setVisionLoading(true);
    try {
      const token = getAuthToken();
      const res = await fetch('/api/v1/phase6/vision/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ imageUrl: visionImage, equipmentCode: 'CNC-SPINDLE-04' })
      });

      const data = await res.json();
      if (res.ok) {
        soundManager.playSuccess();
        setVisionResult(data.result);
      }
    } catch (err) {
      soundManager.playAlert();
    } finally {
      setVisionLoading(false);
    }
  };

  // Submit New Work Order
  const handleCreateWorkOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    soundManager.playClick();
    try {
      const token = getAuthToken();
      const res = await fetch('/api/v1/phase6/work-orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newOrderForm)
      });

      if (res.ok) {
        soundManager.playSuccess();
        setShowCreateModal(false);
        setNewOrderForm({
          plantId: 'DAAL',
          equipmentCode: 'CAST-INGOT-01',
          equipmentName: 'Lò đúc phôi nhôm cao áp A980',
          title: '',
          severity: 'HIGH',
          description: ''
        });
        loadData();
      }
    } catch (err) {
      soundManager.playAlert();
    }
  };

  // Update Work Order Status
  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    soundManager.playClick();
    try {
      const token = getAuthToken();
      const res = await fetch(`/api/v1/phase6/work-orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      if (res.ok) {
        soundManager.playSuccess();
        loadData();
      }
    } catch (err) {
      soundManager.playAlert();
    }
  };

  // Request Expert Escalation
  const handleEscalateToExpert = async (order: any) => {
    soundManager.playClick();
    try {
      const token = getAuthToken();
      const res = await fetch('/api/v1/phase6/escalation/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          workOrderId: order.id,
          plantId: order.plantId,
          equipmentCode: order.equipmentCode,
          urgency: 'URGENT',
          assignedExpertGroup: 'MECHANICAL_SPINDLE',
          chatTranscriptSnippet: `Yêu cầu can thiệp khẩn cấp sự cố ${order.title}`
        })
      });

      if (res.ok) {
        soundManager.playSuccess();
        alert('Đã chuyển cấp sự cố tới Chuyên gia Cấp 4 (SLA 30 phút).');
        loadData();
      }
    } catch (err) {
      soundManager.playAlert();
    }
  };

  // Filtered lists
  const filteredWorkOrders = selectedPlant === 'ALL'
    ? workOrders
    : workOrders.filter(w => w.plantId === selectedPlant);

  return (
    <div className="space-y-4">
      {/* Top Banner & Control Ribbon */}
      <div className="bg-gradient-to-r from-blue-950/70 via-slate-900 to-slate-900 border border-blue-500/40 rounded-2xl p-5 shadow-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-4 font-mono">
        <div className="space-y-1">
          <div className="flex items-center space-x-2.5">
            <span className="text-[10px] font-bold text-blue-400 bg-blue-500/20 px-2 py-0.5 rounded border border-blue-500/30">
              PHASE 6 DEPLOYMENT
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
              lifecycleStatus?.lifecycleState === 'RUNNING' 
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
            }`}>
              TRẠNG THÁI: {lifecycleStatus?.lifecycleState || 'RUNNING'}
            </span>
            <span className="text-[10px] text-slate-400">
              ● Đồng bộ: <span className="text-emerald-400">ONLINE (0 queued)</span>
            </span>
          </div>
          <h1 className="text-lg md:text-xl font-black text-white tracking-wide">
            {t.title}
          </h1>
          <p className="text-xs text-slate-400">
            {t.subtitle}
          </p>
        </div>

        {/* Trilingual Selector & Quick Plant Filter */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Plant Dropdown */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-500 text-[10px] px-2 uppercase">Nhà máy:</span>
            <select
              value={selectedPlant}
              onChange={(e) => { soundManager.playClick(); setSelectedPlant(e.target.value); }}
              className="bg-slate-900 border border-slate-700 text-white rounded-lg px-2 py-1 outline-none text-xs focus:border-blue-500"
            >
              <option value="ALL">Tất cả 7 Nhà máy</option>
              <option value="DAAL">DAAL (Đà Nẵng)</option>
              <option value="KTECH">KTECH (Bắc Giang)</option>
              <option value="HOJEONG_VINA">HOJEONG VINA (Thái Nguyên)</option>
              <option value="HSTEC">HSTEC (Vĩnh Phúc)</option>
              <option value="KHV">KHV (Bắc Ninh)</option>
              <option value="DREAM_TECH">DREAM TECH (Hải Phòng)</option>
              <option value="HOJEONGB">HOJEONGB (Gumi HQ)</option>
            </select>
          </div>

          {/* Language Switcher */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-bold">
            <button
              onClick={() => { soundManager.playClick(); setLang('vi'); }}
              className={`px-2 py-1 rounded transition ${lang === 'vi' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              VI
            </button>
            <button
              onClick={() => { soundManager.playClick(); setLang('en'); }}
              className={`px-2 py-1 rounded transition ${lang === 'en' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              EN
            </button>
            <button
              onClick={() => { soundManager.playClick(); setLang('kr'); }}
              className={`px-2 py-1 rounded transition ${lang === 'kr' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              KR
            </button>
          </div>
        </div>
      </div>

      {/* Safety Mandatory Banner */}
      <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center space-x-2 text-amber-300 font-bold">
          <ShieldAlert className="w-4 h-4 text-amber-400 animate-pulse flex-shrink-0" />
          <span>{t.safetyLoto}:</span>
          <span className="font-normal text-slate-300">
            Ngắt nguồn điện, xả áp suất thủy lực và gắn thẻ tên trước khi thao tác cơ khí máy móc.
          </span>
        </div>
        <span className="text-[10px] text-amber-400 font-bold bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30 shrink-0 ml-2">
          ISO 45001 / IATF 16949
        </span>
      </div>

      {/* Main 5 Navigation Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 font-mono text-xs font-bold">
        {[
          { key: 'assistant', label: t.tabs.assistant, icon: Bot, badge: 'VOICE AI' },
          { key: 'workOrders', label: t.tabs.workOrders, icon: Smartphone, badge: `${workOrders.length}` },
          { key: 'visionAi', label: t.tabs.visionAi, icon: Camera, badge: 'VISION' },
          { key: 'knowledgeHub', label: t.tabs.knowledgeHub, icon: FileText, badge: `${knowledgeArticles.length}` },
          { key: 'learningEscalation', label: t.tabs.learningEscalation, icon: Sparkles, badge: 'SLA' },
        ].map((tb) => {
          const Icon = tb.icon;
          const isActive = activeTab === tb.key;
          return (
            <button
              key={tb.key}
              onClick={() => {
                soundManager.playClick();
                setActiveTab(tb.key as any);
              }}
              className={`p-3 rounded-xl border flex items-center justify-between transition ${
                isActive
                  ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg shadow-blue-500/10'
                  : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-500'}`} />
                <span>{tb.label}</span>
              </div>
              <span className={`text-[9px] px-1.5 py-0.2 rounded ${
                isActive ? 'bg-blue-500/30 text-blue-300' : 'bg-slate-800 text-slate-400'
              }`}>
                {tb.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: AI FIELD ASSISTANT & SOP GUIDANCE (CHAT & VOICE)                  */}
      {/* ========================================================================= */}
      {activeTab === 'assistant' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left: Chat & Voice Interface (7 cols) */}
          <div className="lg:col-span-7 bg-[#0d1321] rounded-2xl border border-slate-800 p-4 flex flex-col justify-between h-[540px] shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2 font-mono">
                <Bot className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold text-white uppercase">TRỢ LÝ THAO TÁC HIỆN TRƯỜNG</h3>
              </div>
              <div className="flex items-center space-x-2">
                {isSpeaking && (
                  <span className="text-[10px] text-cyan-400 font-mono flex items-center space-x-1 animate-pulse">
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Đang đọc hướng dẫn...</span>
                  </span>
                )}
                <span className="text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-1.5 py-0.5 rounded font-mono font-bold">
                  GEMINI EDGE READY
                </span>
              </div>
            </div>

            {/* Chat Message Scroll Area */}
            <div className="flex-1 overflow-y-auto space-y-3 py-3 pr-2 font-mono text-xs">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div className={`p-3 rounded-2xl max-w-[85%] leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none shadow'
                  }`}>
                    <p>{msg.text}</p>
                    {msg.sopRef && (
                      <div className="mt-2 pt-1.5 border-t border-slate-800 flex items-center justify-between text-[10px] text-cyan-400 font-bold">
                        <span>Trích dẫn: {msg.sopRef}</span>
                        <button
                          onClick={() => speakText(msg.text)}
                          className="hover:text-white flex items-center space-x-1"
                          title="Đọc bằng giọng nói"
                        >
                          <Volume2 className="w-3 h-3" />
                          <span>Nghe lại</span>
                        </button>
                      </div>
                    )}
                  </div>
                  <span className="text-[9px] text-slate-500 mt-1 px-1">{msg.timestamp}</span>
                </div>
              ))}
            </div>

            {/* Voice Input Indicator */}
            {isListening && (
              <div className="p-2 rounded-xl bg-blue-950/60 border border-blue-500/50 mb-2 flex items-center space-x-2 text-xs font-mono text-cyan-300 animate-pulse">
                <Mic className="w-4 h-4 text-cyan-400 animate-bounce" />
                <span>{t.voiceListening}</span>
              </div>
            )}

            {/* Input Bar */}
            <div className="pt-2 border-t border-slate-800 flex items-center space-x-2 font-mono">
              <button
                onClick={toggleVoiceRecognition}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition shadow-lg ${
                  isListening
                    ? 'bg-red-600 text-white animate-pulse'
                    : 'bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700'
                }`}
                title="Bật/Tắt Voice AI"
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendQuery()}
                placeholder={t.voicePrompt}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-cyan-500"
              />

              <button
                onClick={() => handleSendQuery()}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs flex items-center space-x-1.5 transition active:scale-95 shadow-lg shadow-cyan-600/20"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Gửi</span>
              </button>
            </div>
          </div>

          {/* Right: Step-by-Step SOP Checklist & Quick Escalation (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Active SOP Interactive Checklist */}
            <div className="bg-[#0d1321] rounded-2xl border border-slate-800 p-4 font-mono text-xs space-y-3 shadow-xl">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <h3 className="font-bold text-white uppercase">SOP-CNC-SPINDLE-04</h3>
                </div>
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/20 px-1.5 py-0.5 rounded border border-emerald-500/30">
                  {t.verifiedSop}
                </span>
              </div>

              <div className="space-y-2">
                {[
                  { step: 1, text: 'Ngắt điện tủ điều khiển trung tâm & gắn thẻ khóa LOTO', done: true },
                  { step: 2, text: 'Tháo collet ER32 bằng cờ lê định lực 45Nm & kiểm tra dao cũ', done: true },
                  { step: 3, text: 'Vệ sinh hốc gá dao bằng cồn công nghiệp 99% & sấy khô khí nén', done: true },
                  { step: 4, text: 'Gá dao mới TiAlN-4F-D12, siết lực 40Nm & đo độ đảo trục <= 0.005mm', done: false },
                  { step: 5, text: 'Chạy không tải 3,000 RPM trong 3 phút, kiểm tra rung <= 1.8G', done: false }
                ].map((s) => (
                  <label
                    key={s.step}
                    className={`flex items-start space-x-2.5 p-2 rounded-xl border transition cursor-pointer ${
                      s.done
                        ? 'bg-emerald-950/20 border-emerald-500/30 text-slate-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      defaultChecked={s.done}
                      className="mt-0.5 rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-0"
                    />
                    <div>
                      <span className="font-bold text-white mr-1.5">Bước {s.step}:</span>
                      <span>{s.text}</span>
                    </div>
                  </label>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-[11px]">
                <span className="text-slate-400">Tiến độ SOP:</span>
                <span className="font-bold text-emerald-400 font-mono">3 / 5 Bước (60%)</span>
              </div>
            </div>

            {/* Quick Escalation & Ticket Launcher */}
            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 font-mono text-xs space-y-3 shadow-xl">
              <h3 className="font-bold text-white uppercase flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                <span>VẤN ĐỀ VƯỢT THẨM QUYỀN HIỆN TRƯỜNG</span>
              </h3>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Nếu sự cố vượt quá danh mục thao tác được cấp phép hoặc tiềm ẩn rủi ro hỏng hóc máy móc trị giá lớn, hãy kích hoạt chuyển cấp.
              </p>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold flex items-center justify-center space-x-1.5 transition active:scale-95"
                >
                  <Smartphone className="w-3.5 h-3.5 text-blue-400" />
                  <span>{t.createTicket}</span>
                </button>

                <button
                  onClick={() => handleEscalateToExpert(workOrders[0] || { id: 'WO-2026-0891', plantId: 'DAAL', equipmentCode: 'CAST-INGOT-01', title: 'Nghẹt vòi rót phôi nhôm' })}
                  className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold flex items-center justify-center space-x-1.5 transition active:scale-95 shadow-lg shadow-red-600/20"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>{t.escalateExpert}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: DIGITAL WORK ORDERS & INCIDENTS (MODULE E)                         */}
      {/* ========================================================================= */}
      {activeTab === 'workOrders' && (
        <div className="space-y-4 font-mono text-xs">
          {/* Header Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center space-x-2">
              <Smartphone className="w-4 h-4 text-blue-400" />
              <span className="font-bold text-white uppercase">DANH SÁCH PHIẾU SỰ CỐ & CÔNG VIỆC HIỆN TRƯỜNG</span>
              <span className="text-[10px] text-slate-400">({filteredWorkOrders.length} phiếu)</span>
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center space-x-1.5 self-start sm:self-auto transition"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{t.createTicket}</span>
            </button>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {filteredWorkOrders.map((wo) => {
              const isCrit = wo.severity === 'CRITICAL';
              const isHigh = wo.severity === 'HIGH';
              const isResolved = wo.status === 'RESOLVED';

              return (
                <div
                  key={wo.id}
                  className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 transition ${
                    isResolved
                      ? 'bg-slate-950/40 border-slate-800 opacity-70'
                      : isCrit
                      ? 'bg-red-950/25 border-red-500/50 shadow-lg shadow-red-500/10'
                      : isHigh
                      ? 'bg-amber-950/20 border-amber-500/40'
                      : 'bg-slate-900/80 border-slate-800'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {wo.code}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        isCrit ? 'bg-red-500/20 text-red-300 border-red-500/40 animate-pulse' :
                        isHigh ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                        'bg-blue-500/20 text-blue-300 border-blue-500/40'
                      }`}>
                        {wo.severity}
                      </span>
                    </div>

                    <h4 className="font-bold text-white text-sm">{wo.title}</h4>
                    <p className="text-[11px] text-slate-400 leading-snug">{wo.description}</p>

                    <div className="text-[10px] text-slate-400 space-y-1 pt-1 border-t border-slate-800/80">
                      <div>Nhà máy: <span className="text-slate-200 font-bold">{wo.plantName}</span></div>
                      <div>Thiết bị: <span className="text-cyan-400">{wo.equipmentCode}</span></div>
                      <div>Phụ trách: <span className="text-slate-200">{wo.assignedTo}</span></div>
                    </div>
                  </div>

                  {/* Footer Action Matrix */}
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      wo.status === 'RESOLVED' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' :
                      wo.status === 'IN_PROGRESS' ? 'bg-blue-950 text-blue-300 border border-blue-500/40' :
                      'bg-slate-800 text-slate-400'
                    }`}>
                      {wo.status}
                    </span>

                    {wo.status !== 'RESOLVED' ? (
                      <div className="flex items-center space-x-1.5">
                        <button
                          onClick={() => handleEscalateToExpert(wo)}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-400 text-[10px] font-bold"
                          title="Chuyển chuyên gia"
                        >
                          Cấp 4
                        </button>
                        <button
                          onClick={() => handleUpdateOrderStatus(wo.id, 'RESOLVED')}
                          className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold flex items-center space-x-1"
                        >
                          <Check className="w-3 h-3" />
                          <span>Xong</span>
                        </button>
                      </div>
                    ) : (
                      <span className="text-[10px] text-emerald-400 flex items-center space-x-1 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Đã xác minh</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: VISION AI DEFECT INSPECTOR (MODULE C)                             */}
      {/* ========================================================================= */}
      {activeTab === 'visionAi' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 font-mono text-xs">
          {/* Left: Image Feed & Bounding Box Canvas (7 cols) */}
          <div className="lg:col-span-7 bg-[#0d1321] rounded-2xl border border-slate-800 p-4 space-y-3 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Camera className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-white uppercase">KHUNG HÌNH THỊ GIÁC VISION AI HIỆN TRƯỜNG</h3>
              </div>
              <span className="text-[10px] text-cyan-400 font-bold bg-cyan-500/20 px-2 py-0.5 rounded border border-cyan-500/30">
                INDUSTRIAL OCR & DEFECT DETECTOR
              </span>
            </div>

            {/* Image Canvas with Overlay Bounding Box */}
            <div className="relative w-full h-[320px] rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center">
              <img
                src={visionImage}
                alt="Equipment Inspection"
                className="w-full h-full object-cover"
              />

              {/* Bounding box overlay if result available */}
              {visionResult && visionResult.detectedDefects?.length > 0 && (
                <div
                  className="absolute border-2 border-red-500 bg-red-500/20 rounded shadow-lg animate-pulse"
                  style={{
                    left: '25%',
                    top: '30%',
                    width: '50%',
                    height: '45%'
                  }}
                >
                  <span className="absolute -top-6 left-0 bg-red-600 text-white text-[9px] px-1.5 py-0.5 rounded font-bold shadow">
                    DEFECT: Mòn dao phay (96%)
                  </span>
                </div>
              )}

              {visionLoading && (
                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center space-y-2">
                  <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
                  <span className="text-cyan-300 font-bold text-xs">Mô hình Vision AI đang quét chùm tia quang học...</span>
                </div>
              )}
            </div>

            {/* Quick Presets & Image Selector */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <div className="flex items-center space-x-1.5 text-[10px]">
                <span className="text-slate-500">Mẫu kiểm tra:</span>
                <button
                  onClick={() => setVisionImage('https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=600&auto=format&fit=crop&q=70')}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Trục Spindle CNC
                </button>
                <button
                  onClick={() => setVisionImage('https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=600&auto=format&fit=crop&q=70')}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Đầu Laser Trumpf
                </button>
                <button
                  onClick={() => setVisionImage('https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?w=600&auto=format&fit=crop&q=70')}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Nồi phôi đúc DAAL
                </button>
              </div>

              <button
                onClick={handleRunVisionAnalysis}
                disabled={visionLoading}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs flex items-center space-x-1.5 transition active:scale-95 shadow-lg shadow-cyan-600/20 disabled:opacity-50"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Chạy Phân Tích Vision AI</span>
              </button>
            </div>
          </div>

          {/* Right: Vision Telemetry & Defect Diagnostic Card (5 cols) */}
          <div className="lg:col-span-5 bg-[#0d1321] rounded-2xl border border-slate-800 p-4 space-y-3 shadow-xl">
            <h3 className="font-bold text-white uppercase pb-2 border-b border-slate-800 flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>KẾT QUẢ GIÁM ĐỊNH QUANG HỌC</span>
            </h3>

            {visionResult ? (
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-red-950/30 border border-red-500/40 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-red-300 text-xs">HƯ HỎNG BỀ MẶT PHÁT HIỆN</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-500 text-white">
                      ĐỘ TIN CẬY 96%
                    </span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-snug">
                    {visionResult.detectedDefects[0]?.label}: {visionResult.detectedDefects[0]?.description}
                  </p>
                </div>

                <div className="space-y-1.5 text-[11px]">
                  <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-800">
                    <span className="text-slate-400">Thiết bị nhận dạng:</span>
                    <span className="font-bold text-cyan-400">{visionResult.detectedEquipmentCode}</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-800">
                    <span className="text-slate-400">Quy trình SOP đề xuất:</span>
                    <span className="font-bold text-emerald-400">{visionResult.recommendedSopId}</span>
                  </div>
                  <div className="p-2 rounded bg-amber-950/20 border border-amber-500/30 text-amber-300 text-[10px]">
                    {visionResult.safetyWarning}
                  </div>
                </div>

                <button
                  onClick={() => {
                    soundManager.playSuccess();
                    setActiveTab('assistant');
                  }}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition active:scale-95"
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span>Mở Trợ Lý Hướng Dẫn Sửa Chữa Ngay</span>
                </button>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500 space-y-2">
                <Camera className="w-8 h-8 mx-auto text-slate-600" />
                <p>Chưa chạy phân tích hình ảnh. Vui lòng nhấn nút "Chạy Phân Tích Vision AI".</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: KNOWLEDGE HUB (MODULE F)                                          */}
      {/* ========================================================================= */}
      {activeTab === 'knowledgeHub' && (
        <div className="space-y-4 font-mono text-xs">
          {/* Search Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              <span className="font-bold text-white uppercase">KHO TRI THỨC KỸ THUẬT & QUY TRÌNH CHUẨN (SOP)</span>
            </div>

            <div className="relative w-full sm:w-80">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                value={knowledgeSearchQuery}
                onChange={(e) => setKnowledgeSearchQuery(e.target.value)}
                placeholder="Tìm theo mã lỗi, thiết bị hoặc quy trình..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Articles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {knowledgeArticles
              .filter(a => !knowledgeSearchQuery || a.title.toLowerCase().includes(knowledgeSearchQuery.toLowerCase()) || a.code.toLowerCase().includes(knowledgeSearchQuery.toLowerCase()))
              .map((art) => (
                <div
                  key={art.id}
                  onClick={() => setSelectedArticle(art)}
                  className="p-4 rounded-xl bg-[#0d1321] border border-slate-800 hover:border-cyan-500/50 cursor-pointer transition space-y-3 flex flex-col justify-between hover:scale-[1.01]"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-500/30">
                        {art.category}
                      </span>
                      <span className="text-[10px] text-emerald-400 font-bold flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{art.version}</span>
                      </span>
                    </div>

                    <h4 className="font-bold text-white text-sm">{art.title}</h4>
                    <p className="text-[11px] text-slate-400 leading-snug">{art.summary}</p>

                    <div className="text-[10px] text-slate-500 space-y-0.5 pt-1 border-t border-slate-800/80">
                      <div>Mã quy trình: <span className="text-slate-300 font-bold">{art.code}</span></div>
                      <div>Áp dụng: <span className="text-cyan-400">{art.applicablePlants.join(', ')}</span></div>
                      <div>Ký duyệt: <span className="text-slate-300">{art.approvedBy}</span></div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px]">
                    <span className="text-slate-400">Đã áp dụng {art.usageCount} lần</span>
                    <span className="text-cyan-400 font-bold flex items-center space-x-1">
                      <span>Xem chi tiết</span>
                      <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
          </div>

          {/* Detailed Article Modal Viewer */}
          {selectedArticle && (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
              <div className="bg-[#0d1321] border border-slate-700 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/20 px-2 py-0.5 rounded border border-cyan-500/30">
                      {selectedArticle.code}
                    </span>
                    <h3 className="font-bold text-white text-base mt-1">{selectedArticle.title}</h3>
                  </div>
                  <button
                    onClick={() => setSelectedArticle(null)}
                    className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 text-xs">
                  <p className="text-slate-300 leading-relaxed">{selectedArticle.summary}</p>

                  <div className="space-y-2">
                    <h4 className="font-bold text-cyan-400 uppercase text-[11px]">CÁC BƯỚC THAO TÁC TIÊU CHUẨN:</h4>
                    {selectedArticle.steps?.map((st: any) => (
                      <div key={st.step} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                        <div className="font-bold text-white">Bước {st.step}: {st.action}</div>
                        {st.safetyNote && (
                          <div className="text-amber-400 text-[10px] flex items-center space-x-1">
                            <ShieldAlert className="w-3 h-3" />
                            <span>Lưu ý: {st.safetyNote}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400 flex justify-between">
                    <span>Biên soạn: {selectedArticle.author}</span>
                    <span>Phê duyệt: {selectedArticle.approvedBy} ({selectedArticle.effectiveDate})</span>
                  </div>
                </div>

                <div className="flex justify-end pt-2 border-t border-slate-800">
                  <button
                    onClick={() => setSelectedArticle(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: CONTINUOUS LEARNING & EXPERT ESCALATION (MODULE G, H)              */}
      {/* ========================================================================= */}
      {activeTab === 'learningEscalation' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 font-mono text-xs">
          {/* Left: Continuous Learning Pipeline (6 cols) */}
          <div className="lg:col-span-6 bg-[#0d1321] rounded-2xl border border-slate-800 p-4 space-y-3 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-white uppercase">HỌC HỎI LIÊN TỤC & ĐỀ XUẤT TRI THỨC</h3>
              </div>
              <span className="text-[10px] text-amber-400 font-bold bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30">
                CLOSED-LOOP LEARNING
              </span>
            </div>

            <div className="space-y-2.5">
              {lessons.map((ls) => (
                <div key={ls.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-white">{ls.id} ({ls.plantId})</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${
                      ls.status === 'APPROVED_PUBLISHED'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    }`}>
                      {ls.status}
                    </span>
                  </div>

                  <div>
                    <div className="text-slate-300 font-bold">{ls.symptom}</div>
                    <div className="text-slate-400 text-[11px] mt-0.5">↳ Nguyên nhân: {ls.rootCauseVerified}</div>
                    <div className="text-cyan-400 text-[11px] mt-0.5">↳ Khuyến nghị: {ls.preventionGuideline}</div>
                  </div>

                  <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
                    <span>Đề xuất: {ls.proposedBy}</span>
                    <span>{ls.publishedArticleCode ? `Đã xuất bản: ${ls.publishedArticleCode}` : 'Chờ phê duyệt Cấp 4'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Expert Escalation & SLA Timers (6 cols) */}
          <div className="lg:col-span-6 bg-[#0d1321] rounded-2xl border border-slate-800 p-4 space-y-3 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-red-400" />
                <h3 className="font-bold text-white uppercase">HÀNG ĐỢI CHUYÊN GIA CẤP 4 (SLA 30 PHÚT)</h3>
              </div>
              <span className="text-[10px] text-red-400 font-bold bg-red-500/20 px-2 py-0.5 rounded border border-red-500/30">
                LEVEL 4 EXPERT
              </span>
            </div>

            <div className="space-y-2.5">
              {escalations.map((esc) => (
                <div key={esc.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-white">{esc.id}</span>
                      <span className="text-[10px] text-cyan-400">({esc.plantId} - {esc.equipmentCode})</span>
                    </div>
                    <span className="text-[10px] font-bold text-red-400 flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{t.slaCountdown}: 18m 42s</span>
                    </span>
                  </div>

                  <div className="p-2 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
                    "{esc.chatTranscriptSnippet}"
                  </div>

                  {esc.expertFeedback && (
                    <div className="p-2 rounded bg-emerald-950/20 border border-emerald-500/30 text-emerald-300 text-[10px]">
                      Chỉ đạo Chuyên gia: {esc.expertFeedback}
                    </div>
                  )}

                  <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                    <span>Người yêu cầu: {esc.requesterName}</span>
                    <span className="text-cyan-400 font-bold">{esc.assignedExpertName || 'Đang kết nối chuyên gia...'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CREATE DIGITAL WORK ORDER                                          */}
      {/* ========================================================================= */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-150 font-mono">
          <div className="bg-[#0d1321] border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base flex items-center space-x-2">
                <Smartphone className="w-4 h-4 text-blue-400" />
                <span>TẠO PHIẾU SỰ CỐ & CÔNG VIỆC HIỆN TRƯỜNG</span>
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateWorkOrder} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Nhà máy phát hiện:</label>
                <select
                  value={newOrderForm.plantId}
                  onChange={(e) => setNewOrderForm({ ...newOrderForm, plantId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-blue-500"
                >
                  <option value="DAAL">DAAL (Đà Nẵng)</option>
                  <option value="KTECH">KTECH (Bắc Giang)</option>
                  <option value="HOJEONG_VINA">HOJEONG VINA (Thái Nguyên)</option>
                  <option value="HSTEC">HSTEC (Vĩnh Phúc)</option>
                  <option value="KHV">KHV (Bắc Ninh)</option>
                  <option value="DREAM_TECH">DREAM TECH (Hải Phòng)</option>
                  <option value="HOJEONGB">HOJEONGB (Gumi HQ)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Mã thiết bị sự cố:</label>
                <input
                  type="text"
                  value={newOrderForm.equipmentCode}
                  onChange={(e) => setNewOrderForm({ ...newOrderForm, equipmentCode: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Tiêu đề sự cố:</label>
                <input
                  type="text"
                  value={newOrderForm.title}
                  onChange={(e) => setNewOrderForm({ ...newOrderForm, title: e.target.value })}
                  placeholder="Ví dụ: Rung trục chính Spindle 04 vượt 4.2G"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Mức độ nghiêm trọng:</label>
                <select
                  value={newOrderForm.severity}
                  onChange={(e) => setNewOrderForm({ ...newOrderForm, severity: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-blue-500"
                >
                  <option value="CRITICAL">NGUY CẤP (Dừng dây chuyền)</option>
                  <option value="HIGH">CAO (Nguy cơ hỏng sản phẩm)</option>
                  <option value="MEDIUM">TRUNG BÌNH (Cần bảo dưỡng)</option>
                  <option value="LOW">THẤP (Theo dõi thêm)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Mô tả chi tiết triệu chứng:</label>
                <textarea
                  value={newOrderForm.description}
                  onChange={(e) => setNewOrderForm({ ...newOrderForm, description: e.target.value })}
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold"
                >
                  Xác nhận Tạo Phiếu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
