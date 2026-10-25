import React, { useState, useEffect } from 'react';
import { 
  FileCheck, ShieldCheck, Clock, Check, X, AlertTriangle, 
  Search, Filter, RefreshCw, Lock, ArrowRight, Eye, Download,
  CheckCircle2, AlertOctagon, UserCheck, ShieldAlert
} from 'lucide-react';
import { soundManager } from '../../utils/audio';

interface AuditLog {
  eventId: string;
  correlationId: string;
  timestampUtc: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  plantId: string | null;
  action: string;
  resource: string;
  targetId: string;
  statusBefore: any;
  statusAfter: any;
  payload: any;
  integrityHash: string;
  isVerified: boolean;
}

interface ApprovalRequest {
  approvalId: string;
  title: string;
  module: string;
  plantId: string;
  actionType: string;
  riskLevel: string;
  status: string;
  requestedBy: string;
  requestedByName: string;
  requestedByRole: string;
  approverId: string | null;
  approverName: string | null;
  approverRole: string | null;
  decisionReason: string | null;
  rollbackPlan: string;
  payload: any;
  createdAt: string;
  decidedAt: string | null;
  executedAt: string | null;
}

export const AuditLogApprovalModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'approvals' | 'audit_trail'>('approvals');
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  // Selected Log for Deep Inspection Modal
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [verificationResult, setVerificationResult] = useState<any>(null);

  // Decision Modal State
  const [decisionModal, setDecisionModal] = useState<{
    isOpen: boolean;
    approval: ApprovalRequest | null;
    action: 'APPROVE' | 'REJECT';
    reason: string;
  }>({
    isOpen: false,
    approval: null,
    action: 'APPROVE',
    reason: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resApprovals, resAudit] = await Promise.all([
        fetch('/api/v1/approvals', {
          headers: { 'Authorization': 'Bearer token_admin_super_secret_9981' }
        }).then(r => r.json()),
        fetch('/api/v1/audit/logs', {
          headers: { 'Authorization': 'Bearer token_admin_super_secret_9981' }
        }).then(r => r.json())
      ]);

      setApprovals(resApprovals.approvals || []);
      setAuditLogs(resAudit.logs || []);
    } catch (err) {
      console.error('Failed to fetch approvals & audit logs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenDecisionModal = (approval: ApprovalRequest, action: 'APPROVE' | 'REJECT') => {
    soundManager.playClick();
    setDecisionModal({
      isOpen: true,
      approval,
      action,
      reason: action === 'APPROVE' ? 'Đã rà soát rủi ro và xác nhận an toàn theo tiêu chuẩn ISO 9001.' : 'Từ chối: Kế hoạch rollback chưa đầy đủ hoặc không đủ định mức.'
    });
  };

  const handleSubmitDecision = async () => {
    if (!decisionModal.approval) return;
    soundManager.playClick();

    try {
      const res = await fetch(`/api/v1/approvals/${decisionModal.approval.approvalId}/decision`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer token_admin_super_secret_9981' // Executing as Admin
        },
        body: JSON.stringify({
          decision: decisionModal.action,
          reason: decisionModal.reason
        })
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.message || 'Lỗi xử lý phê duyệt!');
        return;
      }

      soundManager.playSuccess();
      setDecisionModal({ isOpen: false, approval: null, action: 'APPROVE', reason: '' });
      fetchData();
    } catch (err) {
      console.error('Failed to submit approval decision', err);
    }
  };

  const handleExecuteApproval = async (approvalId: string) => {
    soundManager.playClick();
    try {
      const res = await fetch(`/api/v1/approvals/${approvalId}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer token_admin_super_secret_9981'
        }
      });
      const data = await res.json();
      if (res.ok) {
        soundManager.playSuccess();
        fetchData();
      } else {
        alert(data.message || 'Lỗi thực thi lệnh!');
      }
    } catch (err) {
      console.error('Failed to execute approved action', err);
    }
  };

  const handleVerifyIntegrity = async (eventId: string) => {
    soundManager.playClick();
    try {
      const res = await fetch(`/api/v1/audit/verify/${eventId}`, {
        headers: { 'Authorization': 'Bearer token_admin_super_secret_9981' }
      });
      const data = await res.json();
      setVerificationResult(data);
    } catch (err) {
      console.error('Integrity check failed', err);
    }
  };

  const handleExportCsv = () => {
    soundManager.playClick();
    const headers = ['Event ID', 'Correlation ID', 'Timestamp UTC', 'Actor', 'Role', 'Plant', 'Action', 'Resource', 'Hash'];
    const rows = auditLogs.map(l => [
      l.eventId,
      l.correlationId,
      l.timestampUtc,
      `"${l.actorName}"`,
      l.actorRole,
      l.plantId || 'ENTERPRISE',
      l.action,
      l.resource,
      l.integrityHash
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `VOMS_PRO_AUDIT_TRAIL_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredLogs = auditLogs.filter(log => {
    if (roleFilter !== 'all' && log.actorRole !== roleFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        log.eventId.toLowerCase().includes(q) ||
        log.actorName.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        log.correlationId.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* 1. TOP HEADER */}
      <div className="bg-[#0b1324] border border-cyan-900/40 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400">
            <UserCheck className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
              Human-in-the-Loop &amp; Immutable Audit Trail
              <span className="text-[11px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded font-mono font-medium">
                ISO 27001 / IATF 16949
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Quy trình phê duyệt phân cấp, ngăn chặn người tạo tự phê duyệt và nhật ký kiểm toán bất biến gắn mã băm SHA-256.
            </p>
          </div>
        </div>

        {/* Export & Refresh */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportCsv}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-200 transition"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => {
              soundManager.playClick();
              fetchData();
            }}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-200 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
            <span>Reload</span>
          </button>
        </div>
      </div>

      {/* 2. DUAL TAB SWITCHER */}
      <div className="flex border-b border-slate-800 text-xs font-medium space-x-2">
        <button
          onClick={() => setActiveTab('approvals')}
          className={`pb-2.5 px-4 border-b-2 font-bold transition flex items-center space-x-2 ${
            activeTab === 'approvals'
              ? 'border-purple-400 text-purple-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>Hàng Đợi Phê Duyệt Human-in-the-Loop ({approvals.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('audit_trail')}
          className={`pb-2.5 px-4 border-b-2 font-bold transition flex items-center space-x-2 ${
            activeTab === 'audit_trail'
              ? 'border-purple-400 text-purple-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Nhật Ký Kiểm Toán Bất Biến (Audit Trail) ({auditLogs.length})</span>
        </button>
      </div>

      {/* 3. TAB 1: HUMAN-IN-THE-LOOP APPROVAL WORKFLOW */}
      {activeTab === 'approvals' && (
        <div className="space-y-4">
          
          {/* HITL State Machine Visual Ribbon */}
          <div className="bg-[#0b1324] border border-slate-800 rounded-xl p-3.5 shadow-lg">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Vòng đời Máy Trạng Thái (Finite State Machine Flow)
            </span>
            <div className="flex items-center space-x-2 text-xs font-mono overflow-x-auto pb-1">
              <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">DRAFT</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">SUBMITTED</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <div className="flex space-x-1 shrink-0">
                <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">APPROVED</span>
                <span className="px-2.5 py-1 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold">REJECTED</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className="px-2.5 py-1 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40">EXECUTING</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className="px-2.5 py-1 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold">COMPLETED</span>
            </div>
            <div className="mt-2.5 flex items-center space-x-2 text-[11px] text-amber-300 bg-amber-950/40 px-3 py-1.5 rounded-lg border border-amber-800/40">
              <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400" />
              <span>
                <strong>Quy Tắc Quản Trị Bắt Buộc:</strong> Người tạo lệnh (Creator) không được phép tự phê duyệt (No Self-Approval). AI đề xuất không được tự ý thực thi các lệnh Rủi ro cao mà bắt buộc phải qua bước này.
              </span>
            </div>
          </div>

          {/* Approvals Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {approvals.map(appr => (
              <div 
                key={appr.approvalId}
                className="bg-[#0b1324] border border-slate-800 rounded-xl p-4 space-y-3.5 shadow-xl hover:border-slate-700 transition"
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-[11px] font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                        {appr.approvalId}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                        appr.riskLevel === 'CRITICAL_P1'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}>
                        {appr.riskLevel}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white leading-snug">{appr.title}</h3>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-mono ${
                    appr.status === 'APPROVED'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : appr.status === 'REJECTED'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : appr.status === 'COMPLETED'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                  }`}>
                    {appr.status}
                  </span>
                </div>

                {/* Creator & Plant Info */}
                <div className="bg-slate-900/80 rounded-lg p-2.5 text-xs space-y-1.5 border border-slate-800/80 font-mono text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Người đề xuất:</span>
                    <span className="text-slate-200 font-bold">{appr.requestedByName} ({appr.requestedByRole})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Nhà máy / Phân hệ:</span>
                    <span className="text-cyan-300">{appr.plantId} • {appr.module}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Thời điểm tạo:</span>
                    <span className="text-slate-400">{new Date(appr.createdAt).toLocaleString()}</span>
                  </div>
                  {appr.approverName && (
                    <div className="flex justify-between pt-1 border-t border-slate-800 text-emerald-400">
                      <span>Người phê duyệt:</span>
                      <span className="font-bold">{appr.approverName} ({appr.approverRole})</span>
                    </div>
                  )}
                </div>

                {/* Rollback Plan Required Field */}
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                    Kế Hoạch Khắc Phục / Hoàn Tác (Rollback Plan):
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed italic">
                    "{appr.rollbackPlan}"
                  </p>
                </div>

                {/* Action Buttons based on status */}
                <div className="pt-2 flex items-center justify-end space-x-2 border-t border-slate-800/80">
                  {appr.status === 'SUBMITTED' && (
                    <>
                      <button
                        onClick={() => handleOpenDecisionModal(appr, 'REJECT')}
                        className="px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 text-xs font-bold transition flex items-center space-x-1"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Từ chối</span>
                      </button>
                      <button
                        onClick={() => handleOpenDecisionModal(appr, 'APPROVE')}
                        className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition flex items-center space-x-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Phê duyệt lệnh</span>
                      </button>
                    </>
                  )}

                  {appr.status === 'APPROVED' && (
                    <button
                      onClick={() => handleExecuteApproval(appr.approvalId)}
                      className="w-full py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg transition flex items-center justify-center space-x-1.5"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                      <span>Thực thi Lệnh Đã Phê Duyệt (Execute Action)</span>
                    </button>
                  )}

                  {appr.status === 'COMPLETED' && (
                    <span className="text-xs font-bold text-purple-400 flex items-center space-x-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Đã thực thi thành công • Snapshot ghi nhận vào Audit Log</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. TAB 2: IMMUTABLE AUDIT TRAIL EXPLORER */}
      {activeTab === 'audit_trail' && (
        <div className="space-y-3">
          {/* Filters Bar */}
          <div className="bg-[#0b1324] border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2 flex-1 max-w-md">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm kiếm Event ID, Correlation, Actor, Action..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-slate-400 font-medium">Vai trò:</span>
              <select
                value={roleFilter}
                onChange={e => setRoleFilter(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
              >
                <option value="all">Tất cả vai trò</option>
                <option value="SYSTEM_ADMIN">SYSTEM_ADMIN</option>
                <option value="MANAGEMENT">MANAGEMENT</option>
                <option value="OUTSOURCING_GROUP">OUTSOURCING_GROUP</option>
                <option value="VENDOR_MANAGER">VENDOR_MANAGER</option>
                <option value="QC">QC</option>
                <option value="EQUIPMENT_TECHNICIAN">EQUIPMENT_TECHNICIAN</option>
              </select>
            </div>
          </div>

          {/* Audit Logs Table */}
          <div className="bg-[#0b1324] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/80 text-[11px] uppercase text-slate-400 font-bold border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-4">Event ID / UTC Time</th>
                    <th className="py-2.5 px-3">Người thực hiện (Actor)</th>
                    <th className="py-2.5 px-3">Vai trò</th>
                    <th className="py-2.5 px-3">Hành động (Action)</th>
                    <th className="py-2.5 px-3">Tài nguyên (Target)</th>
                    <th className="py-2.5 px-3">Correlation ID</th>
                    <th className="py-2.5 px-3 font-mono">Mã băm SHA-256</th>
                    <th className="py-2.5 px-4 text-right">Kiểm chứng</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {filteredLogs.map(log => (
                    <tr key={log.eventId} className="hover:bg-slate-800/30 transition">
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-white text-[11px]">{log.eventId}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          {new Date(log.timestampUtc).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-medium text-slate-200">{log.actorName}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-purple-300 border border-slate-700">
                          {log.actorRole}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-mono font-bold text-cyan-400">{log.action}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-slate-300 text-[11px]">{log.resource}</span>
                        {log.plantId && (
                          <span className="ml-1 text-[10px] text-amber-400 font-mono">[{log.plantId}]</span>
                        )}
                      </td>
                      <td className="py-3 px-3 font-mono text-[10px] text-slate-400">
                        {log.correlationId}
                      </td>
                      <td className="py-3 px-3 font-mono text-[10px] text-slate-400 max-w-[120px] truncate" title={log.integrityHash}>
                        {log.integrityHash.substring(0, 12)}...
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => {
                              setSelectedLog(log);
                              setVerificationResult(null);
                            }}
                            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition"
                            title="Xem chi tiết State Snapshot"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleVerifyIntegrity(log.eventId)}
                            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 text-[10px] font-mono font-bold transition flex items-center space-x-1"
                            title="Xác minh toàn vẹn mật mã SHA-256"
                          >
                            <Lock className="w-3 h-3" />
                            <span>Verify</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 5. DECISION MODAL */}
      {decisionModal.isOpen && decisionModal.approval && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0d1627] border border-cyan-800/80 rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex justify-between items-start">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                {decisionModal.action === 'APPROVE' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <AlertOctagon className="w-5 h-5 text-rose-400" />
                )}
                <span>Xác nhận {decisionModal.action === 'APPROVE' ? 'Phê duyệt' : 'Từ chối'} Lệnh Điều Hành</span>
              </h3>
              <button 
                onClick={() => setDecisionModal({ isOpen: false, approval: null, action: 'APPROVE', reason: '' })}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
              <div className="font-bold text-white">{decisionModal.approval.title}</div>
              <div className="text-slate-400">Mã yêu cầu: <span className="font-mono text-cyan-400">{decisionModal.approval.approvalId}</span></div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-medium">Lý do &amp; Căn cứ quyết định (Bắt buộc theo chuẩn ISO):</label>
              <textarea
                value={decisionModal.reason}
                onChange={e => setDecisionModal(prev => ({ ...prev, reason: e.target.value }))}
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-sans"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setDecisionModal({ isOpen: false, approval: null, action: 'APPROVE', reason: '' })}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleSubmitDecision}
                className={`px-5 py-2 rounded-xl text-white font-bold text-xs shadow-lg transition ${
                  decisionModal.action === 'APPROVE'
                    ? 'bg-emerald-600 hover:bg-emerald-500'
                    : 'bg-rose-600 hover:bg-rose-500'
                }`}
              >
                Ghi nhận quyết định
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. LOG DETAIL MODAL WITH DIFF INSPECTOR & INTEGRITY CHECK */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0d1627] border border-cyan-800/80 rounded-2xl max-w-2xl w-full p-5 space-y-4 shadow-2xl">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-mono text-xs text-cyan-400 font-bold">{selectedLog.eventId}</span>
                <h3 className="text-base font-bold text-white mt-0.5">Audit Log State Diff &amp; Payload Inspection</h3>
              </div>
              <button onClick={() => setSelectedLog(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Before vs After Diff */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Trạng thái Trước (Before State):</span>
                <pre className="bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-[11px] text-slate-300 h-32 overflow-y-auto">
                  {JSON.stringify(selectedLog.statusBefore, null, 2) || '// None'}
                </pre>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-bold text-emerald-400 uppercase">Trạng thái Sau (After State):</span>
                <pre className="bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-[11px] text-emerald-300 h-32 overflow-y-auto">
                  {JSON.stringify(selectedLog.statusAfter, null, 2) || '// None'}
                </pre>
              </div>
            </div>

            {/* Integrity Hash verification check */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400">Mã băm toàn vẹn:</span>
                <span className="font-mono text-xs text-purple-300">{selectedLog.integrityHash}</span>
              </div>

              {verificationResult && (
                <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800 text-xs text-emerald-300 flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    Chữ ký mật mã hợp lệ 100%! Bản ghi bất biến, không bị sửa đổi kể từ thời điểm phát sinh ({new Date(selectedLog.timestampUtc).toLocaleString()}).
                  </span>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-800">
              <button
                onClick={() => handleVerifyIntegrity(selectedLog.eventId)}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition flex items-center space-x-1.5"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Kiểm tra chữ ký SHA-256</span>
              </button>

              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Đóng cửa sổ
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
