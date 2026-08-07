import React, { useEffect, useState } from 'react';
import type { TrustReport } from '../../types';
import { campaignAPI } from '../../services/api';

interface TrustReportModalProps {
  campaignId: string | null;
  onClose: () => void;
}

export const TrustReportModal: React.FC<TrustReportModalProps> = ({ campaignId, onClose }) => {
  const [report, setReport] = useState<TrustReport | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (campaignId) {
      fetchReport(campaignId);
    }
  }, [campaignId]);

  const fetchReport = async (id: string) => {
    setIsLoading(true);
    try {
      const res = await campaignAPI.getTrustReport(id);
      setReport(res.data);
    } catch (err) {
      console.error('Failed to fetch trust report:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!campaignId) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog modal-dialog-centered modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content brutal-modal">
          <div className="modal-header">
            <h4 className="modal-title fw-bold">
              <i className="bi bi-award text-success"></i> Transparency Trust Report
            </h4>
            <button className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            {isLoading ? (
              <div className="text-center py-4">
                <div className="spinner-border text-dark"></div>
                <p className="fw-bold mt-2">Calculating dynamic Trust Score & Audit Report...</p>
              </div>
            ) : report ? (
              <div>
                <div className="text-center bg-light p-4 border border-3 border-dark mb-4">
                  <h6 className="text-secondary fw-bold mb-1">CAMPAIGN TRUST SCORE</h6>
                  <div className="display-3 fw-black text-success">{report.trustScore} / 100</div>
                  <span className="brutal-badge badge-lime mt-2">{report.verificationStatus}</span>
                </div>

                {report.aiVerificationDetails && (
                  <div className="brutal-card p-3 mb-3 bg-light">
                    <h6 className="fw-bold"><i className="bi bi-robot"></i> AI Document Analysis</h6>
                    <p className="small text-secondary mb-2">{report.aiVerificationDetails.summary}</p>
                    <div className="d-flex gap-2 flex-wrap">
                      <span className="brutal-badge badge-cyan">Confidence: {report.aiVerificationDetails.confidence}%</span>
                      <span className="brutal-badge badge-lime">Risk: {report.aiVerificationDetails.risk}</span>
                      <span className="brutal-badge badge-yellow">Recommendation: {report.aiVerificationDetails.recommendation}</span>
                    </div>
                  </div>
                )}

                <div className="mb-3">
                  <label className="form-label fw-bold small text-secondary">DOCUMENT SHA-256 FINGERPRINT</label>
                  <div className="p-2 bg-light border border-2 border-dark fw-bold small text-break">
                    {report.documentHash || 'Pending Fingerprint'}
                  </div>
                </div>

                {report.ipfsUrl && (
                  <div className="mb-3 d-flex justify-content-between align-items-center p-3 border border-2 border-dark bg-light">
                    <div>
                      <div className="fw-bold small text-secondary">PINATA IPFS CID</div>
                      <div className="fw-bold small">{report.ipfsCid}</div>
                    </div>
                    <a href={report.ipfsUrl} target="_blank" rel="noreferrer" className="btn brutal-btn brutal-btn-cyan btn-sm">
                      View IPFS File <i className="bi bi-box-arrow-up-right"></i>
                    </a>
                  </div>
                )}

                <button onClick={onClose} className="btn brutal-btn w-100 mt-3">
                  Close Trust Report
                </button>
              </div>
            ) : (
              <div className="alert alert-danger">Failed to load Trust Report.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
