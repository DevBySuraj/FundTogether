import React, { useEffect, useState } from 'react';
import type { VerificationRecord } from '../../types';
import { adminAPI } from '../../services/api';
import { useWeb3 } from '../../context/Web3Context';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshCampaigns: () => void;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  onRefreshCampaigns,
}) => {
  const { user } = useWeb3();
  const isAdmin = user?.role === 'admin';

  const [list, setList] = useState<VerificationRecord[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('PENDING');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [expandedOcrId, setExpandedOcrId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && isAdmin) {
      fetchVerifications();
    }
  }, [isOpen, filterStatus, isAdmin]);

  const fetchVerifications = async () => {
    setIsLoading(true);
    try {
      const res = await adminAPI.getPending(filterStatus);
      setList(res.data || []);
    } catch (err) {
      console.error('Failed to fetch verifications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  if (!isAdmin) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
          <div className="modal-content brutal-modal p-4 text-center" style={{ maxWidth: '460px' }}>
            <i className="bi bi-shield-lock-fill text-danger fs-1 mb-2"></i>
            <h4 className="fw-bold mb-2">Access Restricted</h4>
            <p className="text-secondary small mb-3">
              You must be authenticated as a <strong>Platform Administrator</strong> to view the Admin Audit Dashboard.
            </p>
            <button onClick={onClose} className="btn brutal-btn brutal-btn-magenta w-100 py-2 fw-bold">
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleApprove = async (verificationId: string, campaignId?: string) => {
    setActionMessage('Pinning document to IPFS & recording hash on Ethereum blockchain...');
    try {
      await adminAPI.approve(verificationId, campaignId, 'Approved during admin audit');
      setActionMessage('Approved & Recorded on-chain successfully!');
      setTimeout(() => setActionMessage(null), 3000);
      fetchVerifications();
      onRefreshCampaigns();
    } catch (err: any) {
      setActionMessage(`Error: ${err.message || 'Approval failed'}`);
    }
  };

  const handleReject = async (verificationId: string) => {
    setActionMessage('Rejecting campaign verification...');
    try {
      await adminAPI.reject(verificationId, 'Rejected during admin audit');
      setActionMessage('Verification rejected.');
      setTimeout(() => setActionMessage(null), 3000);
      fetchVerifications();
      onRefreshCampaigns();
    } catch (err: any) {
      setActionMessage(`Error: ${err.message || 'Rejection failed'}`);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog modal-dialog-centered modal-xl" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content brutal-modal">
          {/* Header */}
          <div className="modal-header d-flex justify-content-between align-items-center">
            <div>
              <h4 className="modal-title fw-black text-uppercase mb-0">
                <i className="bi bi-shield-check text-primary me-2"></i> Admin Verification Audit Dashboard
              </h4>
              <small className="text-secondary fw-bold">Review AI confidence scores, inspect extracted OCR text, and approve on-chain publishing</small>
            </div>
            <button className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body p-4">
            {/* Filter Tabs */}
            <div className="d-flex gap-2 mb-4">
              {['PENDING', 'APPROVED', 'REJECTED', 'ALL'].map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`btn brutal-btn btn-sm ${filterStatus === st ? 'brutal-btn-yellow' : ''}`}
                >
                  {st} VERIFICATIONS
                </button>
              ))}
            </div>

            {actionMessage && (
              <div className="alert alert-info fw-bold small mb-3">
                <i className="bi bi-info-circle-fill me-2"></i> {actionMessage}
              </div>
            )}

            {/* List */}
            {isLoading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-dark" role="status"></div>
                <p className="fw-bold mt-2">Fetching verification records from server...</p>
              </div>
            ) : list.length === 0 ? (
              <div className="text-center py-5 bg-light border border-2 border-dark">
                <i className="bi bi-inbox fs-1 text-secondary"></i>
                <h5 className="fw-bold mt-2">No {filterStatus} verifications found.</h5>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-bordered align-middle">
                  <thead className="table-dark text-uppercase small">
                    <tr>
                      <th>Document</th>
                      <th>AI Confidence</th>
                      <th>Fraud Risk</th>
                      <th>AI Summary</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.map((item) => (
                      <tr key={item._id}>
                        <td>
                          <div className="fw-bold">{item.documentType || 'Medical Statement'}</div>
                          <small className="font-monospace text-secondary">{item._id.substring(0, 8)}...</small>
                        </td>

                        <td>
                          <span className="fw-bold text-success fs-5">{item.confidence}%</span>
                        </td>

                        <td>
                          <span className={`brutal-badge ${item.risk === 'Low' ? 'badge-lime' : item.risk === 'High' ? 'badge-magenta' : 'badge-yellow'}`}>
                            {item.risk || 'Low'}
                          </span>
                        </td>

                        <td style={{ maxWidth: '280px' }}>
                          <p className="small mb-1 text-secondary">{item.summary}</p>
                          {item.extractedText && (
                            <div>
                              <button
                                className="btn btn-link btn-sm p-0 text-dark fw-bold text-decoration-none"
                                onClick={() => setExpandedOcrId(expandedOcrId === item._id ? null : item._id)}
                              >
                                {expandedOcrId === item._id ? 'Hide OCR' : 'Inspect OCR Text'}
                              </button>
                              {expandedOcrId === item._id && (
                                <pre className="bg-light p-2 border border-dark small mt-1 font-monospace" style={{ maxHeight: '120px', overflowY: 'auto' }}>
                                  {item.extractedText}
                                </pre>
                              )}
                            </div>
                          )}
                        </td>

                        <td>
                          <span className={`brutal-badge ${item.status === 'APPROVED' ? 'badge-lime' : item.status === 'REJECTED' ? 'badge-magenta' : 'badge-cyan'}`}>
                            {item.status}
                          </span>
                        </td>

                        <td>
                          {item.status === 'PENDING' ? (
                            <div className="d-flex gap-2">
                              <button
                                onClick={() => handleApprove(item._id, item.campaignId)}
                                className="btn brutal-btn brutal-btn-lime btn-sm fw-bold"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleReject(item._id)}
                                className="btn brutal-btn brutal-btn-magenta btn-sm fw-bold"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="small text-secondary font-monospace">
                              {item.onChainTxHash ? `Tx: ${item.onChainTxHash.substring(0, 6)}...` : 'Reviewed'}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
