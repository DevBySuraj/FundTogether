import React, { useState } from 'react';
import type { AIVerificationResult } from '../../types';

interface AiReportCardProps {
  result: AIVerificationResult;
}

export const AiReportCard: React.FC<AiReportCardProps> = ({ result }) => {
  const [showOcr, setShowOcr] = useState<boolean>(false);

  return (
    <div className="ai-report-box">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="fw-bold mb-0">
          <i className="bi bi-robot text-primary"></i> AI DOCUMENT VERIFICATION REPORT
        </h6>
        <span className="brutal-badge badge-lime">{result.risk || 'Low'} Risk</span>
      </div>

      <div className="row text-center mb-3">
        <div className="col-6">
          <div className="bg-white p-2 border border-2 border-dark">
            <small className="text-secondary fw-bold">CONFIDENCE SCORE</small>
            <div className="fs-3 fw-bold text-success">{result.confidence}%</div>
          </div>
        </div>
        <div className="col-6">
          <div className="bg-white p-2 border border-2 border-dark">
            <small className="text-secondary fw-bold">RECOMMENDATION</small>
            <div className="fs-5 fw-bold text-primary">{result.recommendation}</div>
          </div>
        </div>
      </div>

      <p className="small mb-2">
        <strong>Document Type:</strong> {result.documentType}
      </p>
      <p className="small text-secondary mb-2">{result.summary}</p>

      {result.extractedText && (
        <div className="border-top border-dark pt-2 mt-2">
          <button
            type="button"
            className="btn btn-link p-0 text-dark fw-bold small text-decoration-none"
            onClick={() => setShowOcr(!showOcr)}
          >
            <i className={`bi bi-chevron-${showOcr ? 'up' : 'down'}`}></i>{' '}
            {showOcr ? 'Hide Extracted OCR Text' : 'View Extracted OCR Text'}
          </button>

          {showOcr && (
            <pre className="bg-white p-2 border border-dark small mt-2 text-wrap" style={{ maxHeight: '160px', overflowY: 'auto' }}>
              {result.extractedText}
            </pre>
          )}
        </div>
      )}
    </div>
  );
};
