import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../../context/Web3Context';
import { campaignAPI, verificationAPI } from '../../services/api';
import { AiReportCard } from '../verification/AiReportCard';
import type { AIVerificationResult } from '../../types';

interface CreateCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateCampaignModal: React.FC<CreateCampaignModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { account, connectWallet } = useWeb3();

  const defaultWallet = account || 'user@upi';

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [category, setCategory] = useState('Medical');
  const [recipientWallet, setRecipientWallet] = useState(defaultWallet);
  const [file, setFile] = useState<File | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiResult, setAiResult] = useState<AIVerificationResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Reset form whenever modal opens or closes
  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen, account]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setTargetAmount('');
    setCategory('Medical');
    setRecipientWallet(account || 'user@upi');
    setFile(null);
    setAiResult(null);
    setErrorMessage(null);
    setIsSubmitting(false);
  };

  const handleCloseAndReset = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const removeFile = () => {
    setFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!file) {
      setErrorMessage('Verification document (invoice/hospital bill/ID) is required for AI audit.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (!account) {
        await connectWallet();
      }

      const activeWallet = account || recipientWallet || 'user@upi';

      // 1. Create Campaign draft
      const campaignRes = await campaignAPI.create({
        title,
        description,
        targetAmount: parseFloat(targetAmount),
        category,
        recipientWallet: activeWallet,
      });

      const campaignId = campaignRes.data._id;

      // 2. Upload Document to Gemini AI Verification pipeline
      const uploadRes = await verificationAPI.uploadDocument(file, campaignId);
      const aiData: AIVerificationResult = uploadRes.data.aiResult;

      setAiResult(aiData);
      onSuccess();
    } catch (err: any) {
      console.error('Failed to create campaign or verify document:', err);
      setErrorMessage(err.response?.data?.message || err.message || 'Failed to submit campaign.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={handleCloseAndReset}>
      <div className="modal-dialog modal-dialog-centered modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content brutal-modal">
          {/* Header */}
          <div className="modal-header d-flex justify-content-between align-items-center">
            <div>
              <h4 className="modal-title fw-black text-uppercase mb-0">
                <i className="bi bi-shield-check text-success me-2"></i> Start Verified Campaign
              </h4>
              <small className="text-secondary fw-bold">Step-by-step campaign setup with AI-powered document verification</small>
            </div>
            <button className="btn-close" onClick={handleCloseAndReset}></button>
          </div>

          <div className="modal-body p-4">
            {errorMessage && (
              <div className="alert alert-danger fw-bold d-flex align-items-center gap-2 mb-4">
                <i className="bi bi-exclamation-triangle-fill fs-5"></i> {errorMessage}
              </div>
            )}

            {aiResult ? (
              <div>
                <div className="alert alert-success fw-bold d-flex align-items-center gap-2 mb-3">
                  <i className="bi bi-check-circle-fill fs-4 text-success"></i>
                  <span>CAMPAIGN SUBMITTED & VERIFIED BY AI DOCUMENT ANALYSIS ENGINE</span>
                </div>

                <AiReportCard result={aiResult} />

                <button
                  onClick={handleCloseAndReset}
                  className="btn brutal-btn brutal-btn-lime w-100 mt-4 py-3 fw-bold fs-6 text-uppercase"
                >
                  <i className="bi bi-check-lg me-1"></i> Done & View Campaign Gallery
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {/* Step Indicators */}
                <div className="d-flex gap-2 mb-4">
                  <span className="brutal-badge badge-cyan flex-fill justify-content-center py-2 fs-6">
                    1. Campaign Info
                  </span>
                  <span className="brutal-badge badge-yellow flex-fill justify-content-center py-2 fs-6">
                    2. Document Proof
                  </span>
                  <span className="brutal-badge badge-lime flex-fill justify-content-center py-2 fs-6">
                    3. AI Verification
                  </span>
                </div>

                {/* Title */}
                <div className="mb-3">
                  <label className="form-label fw-bold">
                    Campaign Title <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-lg"
                    required
                    placeholder="e.g. Pediatric Medical Fundraiser for Jane"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                {/* Target Amount (₹ INR) & Category */}
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label fw-bold">
                      Target Goal Amount (₹ INR) <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text fw-bold bg-dark text-white">₹</span>
                      <input
                        type="number"
                        step="500"
                        min="500"
                        className="form-control"
                        required
                        placeholder="e.g. 150000"
                        value={targetAmount}
                        onChange={(e) => setTargetAmount(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-bold">
                      Category <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      <option value="Medical">Medical</option>
                      <option value="Education">Education</option>
                      <option value="Emergency">Emergency</option>
                      <option value="General">General</option>
                    </select>
                  </div>
                </div>

                {/* Recipient UPI / Bank Wallet Address */}
                <div className="mb-3">
                  <label className="form-label fw-bold">
                    Recipient UPI ID / Wallet Address <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control font-monospace"
                    required
                    placeholder="e.g. name@upi or 0x..."
                    value={recipientWallet}
                    onChange={(e) => setRecipientWallet(e.target.value)}
                  />
                  <div className="form-text small fw-bold text-success">
                    <i className="bi bi-shield-check me-1"></i> Direct recipient destination for verified campaign donations.
                  </div>
                </div>

                {/* Description */}
                <div className="mb-4">
                  <label className="form-label fw-bold">
                    Campaign Story & Description <span className="text-danger">*</span>
                  </label>
                  <textarea
                    className="form-control"
                    rows={3}
                    required
                    placeholder="Describe why funds are urgently needed and how donations will be utilized..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                {/* Document File Dropzone */}
                <div className="border border-4 border-dark p-4 text-center bg-light mb-4">
                  {file ? (
                    <div>
                      <i className="bi bi-file-earmark-check-fill fs-1 text-success mb-2"></i>
                      <h6 className="fw-bold text-success mb-1">Attached Verification File:</h6>
                      <p className="fw-bold font-monospace text-dark mb-2">{file.name} ({(file.size / 1024).toFixed(1)} KB)</p>
                      <button
                        type="button"
                        onClick={removeFile}
                        className="btn brutal-btn brutal-btn-magenta btn-sm"
                      >
                        <i className="bi bi-trash-fill me-1"></i> Remove File
                      </button>
                    </div>
                  ) : (
                    <div>
                      <i className="bi bi-cloud-arrow-up-fill fs-1 text-primary mb-2"></i>
                      <h5 className="fw-bold mb-1">Upload Verification Proof (Image or PDF)</h5>
                      <p className="text-secondary small mb-3">
                        Attach a clear hospital bill, medical receipt, NGO registration, or identity proof.
                      </p>
                      <input
                        type="file"
                        id="react-doc-file-input"
                        className="d-none"
                        accept="image/*,application/pdf"
                        onChange={handleFileChange}
                      />
                      <label htmlFor="react-doc-file-input" className="btn brutal-btn brutal-btn-cyan cursor-pointer">
                        <i className="bi bi-paperclip me-1"></i> Browse Verification File
                      </label>
                    </div>
                  )}
                </div>

                {/* Submit Actions */}
                {isSubmitting && (
                  <div className="alert alert-info fw-bold mb-3 text-center">
                    <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                    Running AI document inspection & saving campaign...
                  </div>
                )}

                <div className="d-flex justify-content-end gap-3 mt-4">
                  <button type="button" className="btn brutal-btn" onClick={handleCloseAndReset} disabled={isSubmitting}>
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn hero-btn hero-btn-lime"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Running AI Verification...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-shield-check me-2"></i> Submit & Verify Document
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
