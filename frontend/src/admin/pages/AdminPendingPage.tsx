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
      setList(res.data || []);
    } catch (err) {
      console.error('Failed to fetch pending campaigns:', err);
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
  const filteredList = list.filter((item) => {
    const title = item.campaignId?.title || item.title || 'Medical Campaign';
    const recipient = item.campaignId?.recipientWallet || item.recipientWallet || '';
    const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) || recipient.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk = riskFilter === 'ALL' || (item.risk || 'Low') === riskFilter;
    return matchesSearch && matchesRisk;
  });

  // Pagination
  const totalPages = Math.ceil(filteredList.length / itemsPerPage) || 1;
  const paginatedList = filteredList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="d-flex flex-column gap-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="alert alert-info admin-card text-white fw-bold d-flex align-items-center justify-content-between mb-0">
          <div className="d-flex align-items-center gap-2">
            <CheckCircle size={18} color="#10b981" />
            <span>{toastMessage}</span>
          </div>
          <button className="btn-close btn-close-white" onClick={() => setToastMessage(null)}></button>
        </div>
      )}

      {/* Control Bar: Search & Filters */}
      <div className="admin-card p-3 d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
        {/* Search */}
        <div className="position-relative flex-fill" style={{ maxWidth: '380px' }}>
          <Search size={18} className="position-absolute" style={{ left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-text-dim)' }} />
          <input
            type="text"
            className="form-control admin-input w-100"
            style={{ paddingLeft: '38px' }}
            placeholder="Search by title or recipient wallet..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filters */}
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <div className="d-flex align-items-center gap-2">
            <Filter size={16} color="var(--admin-text-dim)" />
            <span className="small font-monospace text-white-50 text-uppercase fw-bold">Status:</span>
            <select className="form-select admin-input py-1" style={{ width: '130px' }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          <div className="d-flex align-items-center gap-2">
            <span className="small font-monospace text-white-50 text-uppercase fw-bold">Risk:</span>
            <select className="form-select admin-input py-1" style={{ width: '120px' }} value={riskFilter} onChange={(e) => setRiskFilter(e.target.value)}>
              <option value="ALL">All Risk</option>
              <option value="Low">Low Risk</option>
              <option value="Medium">Medium Risk</option>
              <option value="High">High Risk</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="admin-card overflow-hidden">
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Campaign</th>
                <th>Recipient Wallet</th>
                <th>Submitted Date</th>
                <th>AI Confidence</th>
                <th>Risk Level</th>
                <th>Goal Amount</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="text-center py-5">
                    <div className="spinner-border text-primary me-2"></div>
                    <span className="fw-bold text-white-50">Loading verifications data...</span>
                  </td>
                </tr>
              ) : paginatedList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-5 text-white-50">
                    No verification records found matching current filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedList.map((item) => {
                  const campaignObj = item.campaignId || {};
                  const title = campaignObj.title || item.title || 'Medical Emergency Fundraiser';
                  const campaignId = campaignObj._id || item._id;
                  const wallet = campaignObj.recipientWallet || item.recipientWallet || '0x71c7...976f';
                  const createdDate = new Date(item.createdAt || Date.now()).toLocaleDateString();
                  const confidence = item.confidence || 94;
                  const risk = item.risk || 'Low';
                  const targetAmount = campaignObj.targetAmount || 100000;
                  const status = item.status || campaignObj.status || 'PENDING';

                  return (
                    <tr key={item._id}>
                      <td>
                        <div className="fw-bold text-white mb-1" style={{ maxWidth: '220px' }}>
                          {title}
                        </div>
                        <span className="small font-monospace" style={{ fontSize: '0.72rem', color: 'var(--admin-text-dim)' }}>
                          ID: {campaignId.substring(0, 10)}...
                        </span>
                      </td>

                      <td>
                        <span className="font-monospace small text-info">
                          {wallet.substring(0, 6)}...{wallet.substring(wallet.length - 4)}
                        </span>
                      </td>

                      <td className="small text-white-50">{createdDate}</td>

                      <td>
                        <span className="fw-bold text-success fs-6">{confidence}%</span>
                      </td>

                      <td>
                        <span className={`admin-badge ${risk === 'Low' ? 'admin-badge-success' : risk === 'High' ? 'admin-badge-danger' : 'admin-badge-warning'}`}>
                          {risk}
                        </span>
                      </td>

                      <td className="fw-bold text-white font-monospace">₹{targetAmount.toLocaleString('en-IN')}</td>

                      <td>
                        <span className={`admin-badge ${status === 'APPROVED' || status === 'ACTIVE' ? 'admin-badge-success' : status === 'REJECTED' ? 'admin-badge-danger' : 'admin-badge-warning'}`}>
                          {status}
                        </span>
                      </td>

                      <td className="text-end">
                        <div className="d-flex align-items-center justify-content-end gap-1">
                          <Link
                            to={`/admin/campaign/${campaignId}`}
                            className="admin-btn admin-btn-secondary p-1 px-2"
                            title="View Campaign Details & Documents"
                          >
                            <Eye size={15} />
                            <span className="d-none d-xl-inline">View</span>
                          </Link>

                          <button
                            onClick={() => setModalAction({ type: 'approve', campaignId, title })}
                            className="admin-btn admin-btn-success p-1 px-2"
                            title="Approve Campaign Verification"
                          >
                            <CheckCircle size={15} />
                            <span className="d-none d-xl-inline">Approve</span>
                          </button>

                          <button
                            onClick={() => setModalAction({ type: 'reject', campaignId, title })}
                            className="admin-btn admin-btn-danger p-1 px-2"
                            title="Reject Campaign Verification"
                          >
                            <XCircle size={15} />
                            <span className="d-none d-xl-inline">Reject</span>
                          </button>

                          <button
                            onClick={() => setModalAction({ type: 'reupload', campaignId, title })}
                            className="admin-btn admin-btn-warning p-1 px-2"
                            title="Request Document Resubmission"
                          >
                            <RotateCcw size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-3 d-flex align-items-center justify-content-between border-top border-secondary border-opacity-10">
          <small className="text-white-50" style={{ fontSize: '0.8rem' }}>
            Showing Page {currentPage} of {totalPages} ({filteredList.length} total items)
          </small>
          <div className="d-flex gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="admin-btn admin-btn-secondary py-1 px-3"
            >
              Previous
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="admin-btn admin-btn-secondary py-1 px-3"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {modalAction && (
        <div className="admin-modal-overlay" onClick={() => setModalAction(null)}>
          <div className="admin-modal p-4" onClick={(e) => e.stopPropagation()}>
            <div className="d-flex align-items-center gap-2 mb-3">
              <AlertTriangle
                size={24}
                color={modalAction.type === 'approve' ? '#10b981' : modalAction.type === 'reject' ? '#ef4444' : '#f59e0b'}
              />
              <h5 className="fw-bold text-white mb-0">
                Confirm {modalAction.type.toUpperCase()} Action
              </h5>
            </div>

            <p className="small text-white-50 mb-3">
              Are you sure you want to <strong>{modalAction.type}</strong> campaign:{' '}
              <span className="text-white fw-bold">"{modalAction.title}"</span>?
            </p>

            <div className="mb-4">
              <label className="form-label small text-uppercase fw-bold text-white-50">Audit Notes / Reason</label>
              <textarea
                className="form-control admin-input w-100"
                rows={3}
                placeholder="Enter audit notes or rejection justification..."
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
              />
            </div>

            <div className="d-flex justify-content-end gap-2">
              <button className="admin-btn admin-btn-secondary" onClick={() => setModalAction(null)} disabled={isSubmitting}>
                Cancel
              </button>
              <button
                className={`admin-btn ${modalAction.type === 'approve' ? 'admin-btn-success' : modalAction.type === 'reject' ? 'admin-btn-danger' : 'admin-btn-warning'}`}
                onClick={handleExecuteAction}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-1"></span>
                    Executing...
                  </>
                ) : (
                  `Confirm ${modalAction.type.toUpperCase()}`
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
