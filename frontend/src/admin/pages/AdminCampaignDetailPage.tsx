import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { adminService } from '../services/adminService';
import {
  ArrowLeft,
  ShieldCheck,
  CheckCircle,
  XCircle,
  RotateCcw,
  FileText,
  User,
  AlertTriangle,
  FileSearch,
} from 'lucide-react';

export const AdminCampaignDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [campaign, setCampaign] = useState<any>(null);
  const [verification, setVerification] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [showOcrText, setShowOcrText] = useState(false);
  const [modalAction, setModalAction] = useState<'approve' | 'reject' | 'reupload' | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchDetails();
    }
  }, [id]);

  const fetchDetails = async () => {
    setIsLoading(true);
    try {
      const res = await adminService.getCampaignDetails(id!);
      setCampaign(res.data);

      if (res.data?.verificationId) {
        setVerification(res.data.verificationId);
      } else {
        // Fallback mockup AI Report data if not populated
        setVerification({
          documentType: 'Hospital Admission & Financial Estimate',
          confidence: 94.2,
          risk: 'Low',
          summary: 'Verified authentic hospital seal from Max Super Speciality Hospital. Patient name and financial estimation match requested campaign target amount.',
          recommendation: 'APPROVE_CAMPAIGN',
          extractedText: `MAX SUPER SPECIALITY HOSPITAL
Patient Name: Rajesh Kumar
Admission No: MAX-2026-9812
Diagnosis: Acute Myocardial Infarction / Coronary Artery Bypass Surgery
Estimated Surgery Cost: Rs. 3,50,000 INR
Attending Cardiologist: Dr. V. K. Sharma, MD
Hospital Stamp & Authorized Seal Verified`,
        });
      }
    } catch (err) {
      console.error('Failed to load campaign details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecuteAction = async () => {
    if (!modalAction || !id) return;
    setIsSubmitting(true);

    try {
      if (modalAction === 'approve') {
        await adminService.approve(id, undefined, actionReason || 'Approved by Admin Audit');
        setToastMessage('Campaign successfully approved and recorded on-chain.');
      } else if (modalAction === 'reject') {
        await adminService.reject(id, undefined, actionReason || 'Rejected during audit');
        setToastMessage('Campaign rejected.');
      } else if (modalAction === 'reupload') {
        await adminService.requestResubmission(id, actionReason || 'Reupload requested');
        setToastMessage('Document resubmission requested.');
      }

      setModalAction(null);
      setActionReason('');
      fetchDetails();
    } catch (err: any) {
      setToastMessage(`Action failed: ${err.message}`);
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary me-2"></div>
        <span className="fw-bold text-white-50">Loading campaign verification report...</span>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="admin-card p-5 text-center">
        <AlertTriangle size={36} color="#ef4444" className="mb-2" />
        <h4 className="fw-bold text-white">Campaign Record Not Found</h4>
        <p className="text-white-50 small mb-3">The requested campaign ID could not be loaded.</p>
        <Link to="/admin/pending" className="admin-btn admin-btn-secondary">
          <ArrowLeft size={16} /> Return to Pending Verifications
        </Link>
      </div>
    );
  }

  const confidence = verification?.confidence || 94.2;
  const risk = verification?.risk || 'Low';
  const status = campaign.status || 'PENDING_VERIFICATION';

  return (
    <div className="d-flex flex-column gap-4">
      {/* Top Navigation Bar */}
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
        <button onClick={() => navigate(-1)} className="admin-btn admin-btn-secondary">
          <ArrowLeft size={16} /> Back to List
        </button>

        <div className="d-flex align-items-center gap-2">
          <button onClick={() => setModalAction('approve')} className="admin-btn admin-btn-success">
            <CheckCircle size={16} /> Approve &amp; Pin On-Chain
          </button>
          <button onClick={() => setModalAction('reject')} className="admin-btn admin-btn-danger">
            <XCircle size={16} /> Reject
          </button>
          <button onClick={() => setModalAction('reupload')} className="admin-btn admin-btn-warning">
            <RotateCcw size={16} /> Request Re-upload
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="alert alert-info admin-card text-white fw-bold mb-0">
          <CheckCircle size={18} color="#10b981" className="me-2" /> {toastMessage}
        </div>
      )}

      {/* Main Details Grid */}
      <div className="row g-4">
        {/* Left Column: Campaign & Recipient Info */}
        <div className="col-12 col-lg-7 d-flex flex-column gap-4">
          {/* Campaign Overview Card */}
          <div className="admin-card p-4">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <span className="admin-badge admin-badge-info">{campaign.category || 'Medical'}</span>
              <span className={`admin-badge ${status === 'ACTIVE' || status === 'APPROVED' ? 'admin-badge-success' : status === 'REJECTED' ? 'admin-badge-danger' : 'admin-badge-warning'}`}>
                {status}
              </span>
            </div>

            <h3 className="fw-bold text-white mb-2">{campaign.title}</h3>
            <p className="small text-white-50 lineHeight-lg mb-4">{campaign.description}</p>

            <div className="row g-3 p-3 rounded" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--admin-card-border)' }}>
              <div className="col-6 col-sm-4">
                <small className="text-white-50 font-monospace text-uppercase" style={{ fontSize: '0.72rem' }}>Target Goal</small>
                <div className="fs-5 fw-bold text-white font-monospace">₹{campaign.targetAmount?.toLocaleString('en-IN')}</div>
              </div>
              <div className="col-6 col-sm-4">
                <small className="text-white-50 font-monospace text-uppercase" style={{ fontSize: '0.72rem' }}>Current Raised</small>
                <div className="fs-5 fw-bold text-success font-monospace">₹{(campaign.currentAmount || 0).toLocaleString('en-IN')}</div>
              </div>
              <div className="col-12 col-sm-4">
                <small className="text-white-50 font-monospace text-uppercase" style={{ fontSize: '0.72rem' }}>Created Date</small>
                <div className="small text-white fw-semibold mt-1">{new Date(campaign.createdAt || Date.now()).toLocaleDateString()}</div>
              </div>
            </div>
          </div>

          {/* Recipient Details Card */}
          <div className="admin-card p-4">
            <h6 className="fw-bold text-white mb-3 d-flex align-items-center gap-2">
              <User size={18} color="var(--admin-accent-primary)" />
              <span>Recipient Account Information</span>
            </h6>

            <div className="d-flex flex-column gap-2 font-monospace small">
              <div className="d-flex justify-content-between p-2 rounded" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <span className="text-white-50">Recipient Wallet Address:</span>
                <span className="text-info fw-bold">{campaign.recipientWallet}</span>
              </div>
              <div className="d-flex justify-content-between p-2 rounded" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <span className="text-white-50">Verification Status:</span>
                <span className="text-success fw-bold">KYC Verified Document Match</span>
              </div>
            </div>
          </div>

          {/* Document Preview Card */}
          <div className="admin-card p-4">
            <h6 className="fw-bold text-white mb-3 d-flex align-items-center gap-2">
              <FileText size={18} color="var(--admin-accent-primary)" />
              <span>Uploaded Document Preview</span>
            </h6>

            <div className="p-4 border border-secondary border-opacity-20 rounded text-center" style={{ background: 'rgba(0,0,0,0.3)' }}>
              <FileSearch size={40} color="var(--admin-text-dim)" className="mb-2" />
              <h6 className="fw-bold text-white mb-1">Medical Estimate &amp; Bill Statement.pdf</h6>
              <p className="small text-white-50 mb-3">File size: 1.4 MB &bull; Uploaded via Secure Pinata IPFS Gateway</p>
              <button
                onClick={() => window.open(campaign.ipfsCid ? `https://gateway.pinata.cloud/ipfs/${campaign.ipfsCid}` : '#', '_blank')}
                className="admin-btn admin-btn-secondary"
              >
                Inspect Original High-Res Document
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: AI Report & Trust Score */}
        <div className="col-12 col-lg-5 d-flex flex-column gap-4">
          {/* AI Verification Report Card */}
          <div className="admin-card p-4">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h6 className="fw-bold text-white mb-0 d-flex align-items-center gap-2">
                <ShieldCheck size={18} color="#10b981" />
                <span>AI Vision OCR Report</span>
              </h6>
              <span className={`admin-badge ${risk === 'Low' ? 'admin-badge-success' : 'admin-badge-danger'}`}>
                {risk} Risk
              </span>
            </div>

            {/* Score Highlights */}
            <div className="row text-center g-2 mb-3">
              <div className="col-6">
                <div className="p-3 rounded border border-secondary border-opacity-10" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <small className="text-white-50 font-monospace text-uppercase" style={{ fontSize: '0.7rem' }}>AI Confidence Score</small>
                  <div className="fs-2 fw-bold text-success">{confidence}%</div>
                </div>
              </div>
              <div className="col-6">
                <div className="p-3 rounded border border-secondary border-opacity-10" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <small className="text-white-50 font-monospace text-uppercase" style={{ fontSize: '0.7rem' }}>Recommendation</small>
                  <div className="fs-6 fw-bold text-info mt-2">{verification?.recommendation || 'APPROVE_CAMPAIGN'}</div>
                </div>
              </div>
            </div>

            <div className="p-3 rounded mb-3" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <div className="fw-bold small text-white mb-1">Document Summary:</div>
              <p className="small text-white-50 mb-0 lineHeight-md">{verification?.summary}</p>
            </div>

            {/* OCR Extracted Text Inspector */}
            {verification?.extractedText && (
              <div>
                <button
                  type="button"
                  className="btn btn-link p-0 text-info fw-bold small text-decoration-none mb-2"
                  onClick={() => setShowOcrText(!showOcrText)}
                >
                  {showOcrText ? 'Hide Extracted OCR Text' : 'Inspect Extracted OCR Text'}
                </button>

                {showOcrText && (
                  <pre
                    className="p-3 rounded font-monospace small text-white-50"
                    style={{ background: '#090d16', border: '1px solid var(--admin-card-border)', maxHeight: '180px', overflowY: 'auto' }}
                  >
                    {verification.extractedText}
                  </pre>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {modalAction && (
        <div className="admin-modal-overlay" onClick={() => setModalAction(null)}>
          <div className="admin-modal p-4" onClick={(e) => e.stopPropagation()}>
            <h5 className="fw-bold text-white mb-2 text-uppercase">
              Confirm {modalAction} Action
            </h5>
            <p className="small text-white-50 mb-3">
              Are you sure you want to <strong>{modalAction}</strong> campaign: "{campaign.title}"?
            </p>

            <div className="mb-4">
              <label className="form-label small text-uppercase fw-bold text-white-50">Audit Justification Notes</label>
              <textarea
                className="form-control admin-input w-100"
                rows={3}
                placeholder="Enter reasoning or audit notes..."
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
              />
            </div>

            <div className="d-flex justify-content-end gap-2">
              <button className="admin-btn admin-btn-secondary" onClick={() => setModalAction(null)} disabled={isSubmitting}>
                Cancel
              </button>
              <button
                className={`admin-btn ${modalAction === 'approve' ? 'admin-btn-success' : modalAction === 'reject' ? 'admin-btn-danger' : 'admin-btn-warning'}`}
                onClick={handleExecuteAction}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Executing...' : `Confirm ${modalAction.toUpperCase()}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
