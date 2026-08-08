import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../services/adminService';
import { campaignAPI } from '../../services/api';
import { Search, Filter, Eye, CheckCircle, XCircle, RotateCcw, AlertTriangle } from 'lucide-react';

export const AdminPendingPage: React.FC = () => {
  const [list, setList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('PENDING_VERIFICATION');
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
      let rawList = Array.isArray(res)
        ? res
        : Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
        ? res.data.data
        : [];

      // If list is empty, fallback to fetching all campaigns directly
      if (rawList.length === 0) {
        try {
          const allRes = await campaignAPI.getAll('All');
          rawList = allRes.data || [];
        } catch {
          // ignore
        }
      }

      setList(rawList);
    } catch (err) {
      console.error('Failed to fetch pending campaigns:', err);
      try {
        const allRes = await campaignAPI.getAll('All');
        setList(allRes.data || []);
      } catch {
        setList([]);
      }
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

    let matchesStatus = false;
    if (statusFilter === 'PENDING_VERIFICATION') {
      matchesStatus = itemStatus === 'PENDING_VERIFICATION' || itemStatus === 'DRAFT' || itemStatus === 'PENDING';
    } else if (statusFilter === 'APPROVED') {
      matchesStatus = itemStatus === 'APPROVED' || itemStatus === 'ACTIVE';
    } else if (statusFilter === 'ALL') {
      matchesStatus = true;
    } else {
      matchesStatus = itemStatus === statusFilter;
    }

    const itemRisk = item.risk || 'Low';
    const matchesRisk = riskFilter === 'ALL' || itemRisk === riskFilter;

    return matchesSearch && matchesStatus && matchesRisk;
  });

  const totalPages = Math.ceil(filteredList.length / itemsPerPage);
  const paginatedList = filteredList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const formatInr = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            zIndex: 9999,
            background: '#0f172a',
            color: '#34d399',
            border: '1px solid rgba(52, 211, 153, 0.4)',
            padding: '12px 20px',
            borderRadius: '12px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontWeight: 'bold',
            fontSize: '0.9rem',
          }}
        >
          <CheckCircle size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div
        className="admin-card"
        style={{
          padding: '1.5rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span>Pending Verifications Audit</span>
            <span className="admin-badge admin-badge-warning">{filteredList.length} Items Pending</span>
          </h2>
          <p className="admin-subtext" style={{ marginTop: '4px' }}>
            Audit Gemini AI document OCR confidence, verify medical invoices, and approve on-chain campaigns.
          </p>
        </div>
      </div>

      {/* Filter Controls */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        {/* Search */}
        <div style={{ position: 'relative' }}>
          <Search size={16} className="admin-search-icon" />
          <input
            type="text"
            placeholder="Search by title, category, or wallet..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="admin-input"
            style={{ width: '100%', paddingLeft: '38px' }}
          />
        </div>

        {/* Status Filter */}
        <div style={{ position: 'relative' }}>
          <Filter size={16} className="admin-search-icon" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="admin-input"
            style={{ width: '100%', paddingLeft: '38px' }}
          >
            <option value="PENDING_VERIFICATION">Only Pending Verifications</option>
            <option value="APPROVED">Approved &amp; Active Campaigns</option>
            <option value="REJECTED">Rejected Campaigns</option>
            <option value="ALL">Show All Statuses</option>
          </select>
        </div>

        {/* Risk Filter */}
        <div style={{ position: 'relative' }}>
          <AlertTriangle size={16} className="admin-search-icon" />
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="admin-input"
            style={{ width: '100%', paddingLeft: '38px' }}
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
        <div className="admin-card" style={{ padding: '4rem', textAlign: 'center' }}>
          <div className="spinner-border text-light mb-3" role="status"></div>
          <p className="fw-bold text-light">Fetching verification records from TrustChain backend...</p>
        </div>
      ) : filteredList.length === 0 ? (
        <div className="admin-card" style={{ padding: '4rem', textAlign: 'center' }}>
          <CheckCircle size={48} style={{ color: '#10b981', margin: '0 auto 1rem d-block', opacity: 0.8 }} />
          <h3 style={{ color: '#fff', fontWeight: 800, marginBottom: '0.5rem' }}>No Pending Verifications Requiring Audit</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>All submitted campaigns have been audited and approved or rejected by Admin.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
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
              <div key={item._id} className="admin-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  {/* Top Badges */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <span className="admin-badge admin-badge-info">{category}</span>
                    <span className={`admin-badge ${risk === 'Low' ? 'admin-badge-success' : risk === 'Medium' ? 'admin-badge-warning' : 'admin-badge-danger'}`}>
                      {risk} Risk ({confidence}%)
                    </span>
                  </div>

                  {/* Title */}
                  <h4 style={{ color: '#fff', fontWeight: 800, fontSize: '1.1rem', marginBottom: '0.5rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {title}
                  </h4>

                  {/* Summary / Description */}
                  <p style={{ color: '#94a3b8', fontSize: '0.82rem', lineHeight: 1.5, marginBottom: '1rem', height: '3.6em', overflow: 'hidden' }}>
                    {summary}
                  </p>

                  {/* Target Amount */}
                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '1rem' }}>
                    <span className="admin-subtext">TARGET GOAL</span>
                    <strong style={{ color: '#fff', fontSize: '1.1rem' }}>{formatInr(targetAmount)}</strong>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#94a3b8' }}>
                    <span>Status:</span>
                    <strong style={{ color: '#fff' }}>{status}</strong>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <Link to={`/admin/campaign/${campaignId}`} className="admin-btn admin-btn-secondary" style={{ justifyContent: 'center', padding: '0.45rem 0.75rem' }}>
                      <Eye size={14} /> Inspect
                    </Link>

                    <button
                      onClick={() => setModalAction({ type: 'approve', campaignId, title })}
                      className="admin-btn admin-btn-success"
                      style={{ justifyContent: 'center', padding: '0.45rem 0.75rem' }}
                    >
                      <CheckCircle size={14} /> Approve
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <button
                      onClick={() => setModalAction({ type: 'reupload', campaignId, title })}
                      className="admin-btn admin-btn-warning"
                      style={{ justifyContent: 'center', padding: '0.45rem 0.75rem' }}
                    >
                      <RotateCcw size={14} /> Re-upload
                    </button>

                    <button
                      onClick={() => setModalAction({ type: 'reject', campaignId, title })}
                      className="admin-btn admin-btn-danger"
                      style={{ justifyContent: 'center', padding: '0.45rem 0.75rem' }}
                    >
                      <XCircle size={14} /> Reject
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
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', paddingTop: '1rem' }}>
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="admin-btn admin-btn-secondary"
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
          >
            Prev
          </button>
          <span style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: 600, padding: '0 0.5rem' }}>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="admin-btn admin-btn-secondary"
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
          >
            Next
          </button>
        </div>
      )}

      {/* Action Confirmation Modal */}
      {modalAction && (
        <div className="admin-modal-overlay">
          <div className="admin-modal" style={{ padding: '1.75rem' }}>
            <h3 style={{ color: '#fff', fontWeight: 800, marginTop: 0, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              {modalAction.type === 'approve' && <CheckCircle style={{ color: '#10b981' }} size={22} />}
              {modalAction.type === 'reject' && <XCircle style={{ color: '#ef4444' }} size={22} />}
              {modalAction.type === 'reupload' && <RotateCcw style={{ color: '#f59e0b' }} size={22} />}
              <span style={{ textTransform: 'capitalize' }}>{modalAction.type} Campaign Audit</span>
            </h3>

            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1rem' }}>
              Are you sure you want to {modalAction.type} campaign &quot;<strong style={{ color: '#fff' }}>{modalAction.title}</strong>&quot;?
            </p>

            <textarea
              rows={3}
              placeholder="Enter audit notes / reason for audit log..."
              value={actionReason}
              onChange={(e) => setActionReason(e.target.value)}
              className="admin-input"
              style={{ width: '100%', marginBottom: '1.25rem', resize: 'vertical' }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button onClick={() => setModalAction(null)} className="admin-btn admin-btn-secondary" disabled={isSubmitting}>
                Cancel
              </button>
              <button
                onClick={handleExecuteAction}
                disabled={isSubmitting}
                className={`admin-btn ${modalAction.type === 'approve' ? 'admin-btn-success' : modalAction.type === 'reject' ? 'admin-btn-danger' : 'admin-btn-warning'}`}
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
