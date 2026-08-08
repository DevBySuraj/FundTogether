import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../services/adminService';
import { Search, Filter, Eye, CheckCircle, XCircle, RotateCcw, AlertTriangle } from 'lucide-react';

export const AdminPendingPage: React.FC = () => {
  const [list, setList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Confirmation Modal state
  const [modalAction, setModalAction] = useState<{
    type: 'approve' | 'reject' | 'reupload';
    campaignId: string;
    title: string;
  } | null>(null);

  const [actionReason, setActionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchPending();
  }, [statusFilter, riskFilter]);

  const fetchPending = async () => {
    setIsLoading(true);
    try {
      const res = await adminService.getPending(statusFilter, riskFilter);
      const rawList = Array.isArray(res) ? res : Array.isArray(res.data) ? res.data : Array.isArray(res.data?.data) ? res.data.data : [];
      setList(rawList);
    } catch (err) {
      console.error('Failed to fetch pending campaigns:', err);
      setList([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecuteAction = async () => {
    if (!modalAction) return;
    setIsSubmitting(true);

    try {
      if (modalAction.type === 'approve') {
        await adminService.approve(modalAction.campaignId, undefined, actionReason || 'Approved by Admin');
        setToastMessage(`Campaign "${modalAction.title}" successfully approved and pinned on-chain.`);
      } else if (modalAction.type === 'reject') {
        await adminService.reject(modalAction.campaignId, undefined, actionReason || 'Rejected during audit');
        setToastMessage(`Campaign "${modalAction.title}" rejected.`);
      } else if (modalAction.type === 'reupload') {
        await adminService.requestResubmission(modalAction.campaignId, actionReason || 'Document resubmission requested');
        setToastMessage(`Resubmission request sent for "${modalAction.title}".`);
      }

      setModalAction(null);
      setActionReason('');
      fetchPending();
    } catch (err: any) {
      setToastMessage(`Error: ${err.message || 'Action failed'}`);
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  // Search & Filtered list
  const filteredList = (Array.isArray(list) ? list : []).filter((item) => {
    const itemTitle = item.title || item.campaignId?.title || '';
    const itemCategory = item.category || item.campaignId?.category || '';
    const itemWallet = item.recipientWallet || item.campaignId?.recipientWallet || '';

    const matchesSearch =
      itemTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      itemCategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
      itemWallet.toLowerCase().includes(searchTerm.toLowerCase());

    const itemStatus = item.status || 'PENDING_VERIFICATION';
    const matchesStatus = statusFilter === 'ALL' || itemStatus === statusFilter;

    const itemRisk = item.risk || 'Low';
    const matchesRisk = riskFilter === 'ALL' || itemRisk === riskFilter;

    return matchesSearch && matchesStatus && matchesRisk;
  });

  const totalPages = Math.ceil(filteredList.length / itemsPerPage);
  const paginatedList = filteredList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-emerald-400 border border-emerald-500/50 px-4 py-3 rounded-xl shadow-2xl flex items-center space-x-3 text-sm font-semibold animate-bounce">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 backdrop-blur-xl p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>Pending Verifications Audit</span>
            <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold px-2.5 py-1 rounded-full">
              {filteredList.length} Items
            </span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Audit Gemini AI document OCR confidence, verify medical invoices, and approve on-chain campaigns.
          </p>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="grid grid-[#0f172a] md:grid-cols-4 gap-4">
        {/* Search */}
        <div className="relative md:col-span-2">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search by title, category, or wallet..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Status Filter */}
        <div className="relative">
          <Filter className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 text-slate-300 text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-blue-500 appearance-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="DRAFT">DRAFT</option>
            <option value="PENDING_VERIFICATION">PENDING VERIFICATION</option>
            <option value="APPROVED">APPROVED / ACTIVE</option>
            <option value="REJECTED">REJECTED</option>
          </select>
        </div>

        {/* Risk Filter */}
        <div className="relative">
          <AlertTriangle className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 text-slate-300 text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-blue-500 appearance-none"
          >
            <option value="ALL">All Risk Levels</option>
            <option value="Low">Low Risk (&gt;90% Confidence)</option>
            <option value="Medium">Medium Risk (75%-90%)</option>
            <option value="High">High Risk (&lt;75%)</option>
          </select>
        </div>
      </div>

      {/* Main List Grid */}
      {isLoading ? (
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-12 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-400 font-medium">Fetching verification records from TrustChain backend...</p>
        </div>
      ) : filteredList.length === 0 ? (
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-12 text-center">
          <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3 opacity-80" />
          <h3 className="text-lg font-bold text-white mb-1">No Pending Verifications Match Filters</h3>
          <p className="text-slate-400 text-sm">All campaigns have been processed or no submissions fit the selected criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedList.map((item) => {
            const campaignId = item.campaignId?._id || item.campaignId || item._id;
            const title = item.title || item.campaignId?.title || 'Medical Fundraiser Audit';
            const category = item.category || item.campaignId?.category || 'Medical';
            const confidence = item.confidence || 94;
            const risk = item.risk || 'Low';
            const summary = item.summary || item.description || 'Medical document invoice submitted for AI verification.';
            const targetAmount = item.targetAmount || item.campaignId?.targetAmount || 100000;
            const status = item.status || item.campaignId?.status || 'PENDING_VERIFICATION';

            return (
              <div
                key={item._id}
                className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 hover:border-slate-700 transition-all rounded-2xl p-6 flex flex-col justify-between shadow-xl"
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="text-xs font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-lg">
                      {category}
                    </span>

                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${
                        risk === 'Low'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : risk === 'Medium'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}
                    >
                      {risk} Risk ({confidence}%)
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-white mb-2 line-clamp-1">{title}</h3>

                  {/* Summary / Description */}
                  <p className="text-slate-400 text-xs line-clamp-3 mb-4 leading-relaxed">{summary}</p>

                  {/* Target Amount */}
                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 mb-4">
                    <div className="text-slate-500 text-[11px] font-semibold tracking-wider uppercase">Target Goal</div>
                    <div className="text-white font-extrabold text-base">₹ {targetAmount.toLocaleString('en-IN')} INR</div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span>Status:</span>
                    <span className="font-bold text-white">{status}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      to={`/admin/campaign/${campaignId}`}
                      className="inline-flex items-center justify-center space-x-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold py-2 px-3 rounded-xl transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect OCR</span>
                    </Link>

                    <button
                      onClick={() =>
                        setModalAction({
                          type: 'approve',
                          campaignId,
                          title,
                        })
                      }
                      className="inline-flex items-center justify-center space-x-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2 px-3 rounded-xl transition-colors shadow-lg shadow-emerald-600/20"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() =>
                        setModalAction({
                          type: 'reupload',
                          campaignId,
                          title,
                        })
                      }
                      className="inline-flex items-center justify-center space-x-1 bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 border border-amber-500/30 text-xs font-bold py-2 px-3 rounded-xl transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Re-upload</span>
                    </button>

                    <button
                      onClick={() =>
                        setModalAction({
                          type: 'reject',
                          campaignId,
                          title,
                        })
                      }
                      className="inline-flex items-center justify-center space-x-1 bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 text-xs font-bold py-2 px-3 rounded-xl transition-colors"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 pt-4">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 disabled:opacity-40"
          >
            Prev
          </button>
          <span className="text-xs text-slate-400 font-semibold px-2">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}

      {/* Action Confirmation Modal */}
      {modalAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
              {modalAction.type === 'approve' && <CheckCircle className="w-5 h-5 text-emerald-400" />}
              {modalAction.type === 'reject' && <XCircle className="w-5 h-5 text-rose-400" />}
              {modalAction.type === 'reupload' && <RotateCcw className="w-5 h-5 text-amber-400" />}
              <span className="capitalize">{modalAction.type} Campaign Audit</span>
            </h3>

            <p className="text-sm text-slate-300">
              Are you sure you want to {modalAction.type} campaign &quot;<strong>{modalAction.title}</strong>&quot;?
            </p>

            <textarea
              rows={3}
              placeholder="Enter audit notes / reason for audit log..."
              value={actionReason}
              onChange={(e) => setActionReason(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-3 focus:outline-none focus:border-blue-500"
            />

            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setModalAction(null)}
                className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteAction}
                disabled={isSubmitting}
                className={`px-4 py-2 text-xs font-bold text-white rounded-xl transition-all ${
                  modalAction.type === 'approve'
                    ? 'bg-emerald-600 hover:bg-emerald-500'
                    : modalAction.type === 'reject'
                    ? 'bg-rose-600 hover:bg-rose-500'
                    : 'bg-amber-600 hover:bg-amber-500'
                }`}
              >
                {isSubmitting ? 'Processing...' : 'Confirm Action'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
