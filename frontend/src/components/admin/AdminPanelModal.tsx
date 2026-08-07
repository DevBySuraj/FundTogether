import React, { useEffect, useState } from 'react';
import type { VerificationRecord } from '../../types';
import { adminAPI } from '../../services/api';

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
  const [list, setList] = useState<VerificationRecord[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('PENDING');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [expandedOcrId, setExpandedOcrId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchVerifications();
    }
  }, [isOpen, filterStatus]);

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

  const handleApprove = async (verificationId: string, campaignId?: string) => {
    setActionMessage('Pinning document to IPFS & recording hash on Ethereum blockchain...');
    try {
      await adminAPI.approve(verificationId, campaignId, 'Approved during admin audit');
      setActionMessage('Document approved, IPFS CID pinned, and recorded on-chain successfully!');
      fetchVerifications();
      onRefreshCampaigns();
    } catch (err: any) {
      setActionMessage(`Approval failed: ${err.message}`);
    }
  };

  const handleReject = async (verificationId: string, requestReupload = false) => {
    setActionMessage(requestReupload ? 'Requesting document re-upload...' : 'Rejecting verification...');
    try {
      await adminAPI.reject(verificationId, 'Action taken during admin audit', requestReupload);
      setActionMessage(requestReupload ? 'Requested user re-upload.' : 'Verification rejected.');
      fetchVerifications();
      onRefreshCampaigns();
    } catch (err: any) {
      setActionMessage(`Action failed: ${err.message}`);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog modal-dialog-centered modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content brutal-modal">
          <div className="modal-header">
            <h4 className="modal-title fw-bold">
              <i className="bi bi-shield-lock text-primary"></i> Admin Verification Audit Panel
            </h4>
            <button className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body">
            {actionMessage && (
              <div className="alert alert-info fw-bold d-flex justify-content-between align-items-center mb-3">
                <span>{actionMessage}</span>
                <button onClick={() => setActionMessage(null)} className="btn-close"></button>
              </div>
            )}

            {/* Status Filter Buttons */}
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
              <div className="btn-group" role="group">
                {['PENDING', 'APPROVED', 'REJECTED', 'ALL'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setFilterStatus(st)}
                    className={`btn brutal-btn ${filterStatus === st ? 'brutal-btn-lime' : ''}`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              <button onClick={fetchVerifications} className="btn brutal-btn btn-sm">
                <i className="bi bi-arrow-clockwise"></i> Refresh
              </button>
            </div>

            {/* Verification Queue List */}
            {isLoading ? (
              <div className="text-center py-4">
                <div className="spinner-border text-dark"></div>
                <p className="fw-bold mt-2">Fetching verification queue...</p>
              </div>
            ) : list.length === 0 ? (
              <div className="text-center py-4 text-secondary">
                <i className="bi bi-check-circle-fill text-success fs-1 mb-2"></i>
                <h5 className="fw-bold">No Documents Found</h5>
                <p className="small">No verification items matching status "{filterStatus}".</p>
              </div>
            ) : (
              <div style={{ maxHeight: '480px', overflowY: 'auto' }}>
                {list.map((item) => (
                  <div key={item._id} className="brutal-card p-3 mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="brutal-badge badge-cyan">{item.documentType}</span>
                      <span className="brutal-badge badge-lime">Confidence: {item.confidence}%</span>
                    </div>

                    <p className="small text-secondary mb-2">
                      <strong>Risk:</strong> {item.risk} • <strong>Recommendation:</strong> {item.recommendation}
                    </p>

                    <p className="small fw-bold mb-2 bg-light p-2 border border-dark">
                      {item.summary}
                    </p>

                    {item.extractedText && (
                      <div className="mb-2">
                        <button
                          type="button"
                          className="btn btn-link p-0 text-dark fw-bold small text-decoration-none"
                          onClick={() => setExpandedOcrId(expandedOcrId === item._id ? null : item._id)}
                        >
                          <i className={`bi bi-chevron-${expandedOcrId === item._id ? 'up' : 'down'}`}></i>{' '}
                          {expandedOcrId === item._id ? 'Hide OCR Extracted Text' : 'View OCR Extracted Text'}
                        </button>

                        {expandedOcrId === item._id && (
                          <pre className="bg-light p-2 border border-dark small mt-2 text-wrap" style={{ maxHeight: '140px', overflowY: 'auto' }}>
                            {item.extractedText}
                          </pre>
                        )}
                      </div>
                    )}

                    {item.status === 'PENDING' ? (
                      <div className="d-flex justify-content-end gap-2 mt-3">
                        <button
                          onClick={() => handleReject(item._id, true)}
                          className="btn brutal-btn brutal-btn-yellow btn-sm"
                        >
                          Request Re-upload
                        </button>

                        <button
                          onClick={() => handleReject(item._id, false)}
                          className="btn brutal-btn brutal-btn-magenta btn-sm"
                        >
                          Reject
                        </button>

                        <button
                          onClick={() => handleApprove(item._id, item.campaignId)}
                          className="btn brutal-btn brutal-btn-lime btn-sm"
                        >
                          Approve, Pin IPFS & On-Chain
                        </button>
                      </div>
                    ) : (
                      <span className="brutal-badge badge-lime">Status: {item.status}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
