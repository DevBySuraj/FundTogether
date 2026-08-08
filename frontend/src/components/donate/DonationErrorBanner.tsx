import React from 'react';

interface DonationErrorBannerProps {
  error: string;
  onDismiss?: () => void;
  onRetry?: () => void;
  onDemo?: () => void;
}

const enrichError = (err: string): { message: string; hint?: string } => {
  if (err.includes('MetaMask is not installed')) {
    return {
      message: err,
      hint: 'Download MetaMask at metamask.io or click Instant Demo Mode below to complete without extension.',
    };
  }
  if (err.includes('rejected') || err.includes('cancelled')) {
    return {
      message: 'Transaction cancelled.',
      hint: 'You declined the MetaMask prompt. Click Donate to try again or Instant Demo Mode to bypass.',
    };
  }
  if (err.includes('Insufficient') || err.includes('insufficient funds')) {
    return {
      message: 'Insufficient wallet balance.',
      hint: 'Get free testnet POL at faucet.polygon.technology or click Instant Demo Mode below to test immediately.',
    };
  }
  if (err.includes('Wrong network') || err.includes('wrong network')) {
    return {
      message: 'Wrong blockchain network.',
      hint: 'Please switch to Polygon Amoy Testnet in MetaMask.',
    };
  }
  return { message: err };
};

export const DonationErrorBanner: React.FC<DonationErrorBannerProps> = ({
  error,
  onDismiss,
  onRetry,
  onDemo,
}) => {
  const { message, hint } = enrichError(error);

  return (
    <div className="w3-error-banner flex-column gap-2" role="alert">
      <div className="d-flex align-items-start gap-2 w-100">
        <div className="w3-error-icon">⚠</div>
        <div className="w3-error-body">
          <p className="w3-error-message">{message}</p>
          {hint && <p className="w3-error-hint">{hint}</p>}
        </div>
        {onDismiss && (
          <button onClick={onDismiss} className="w3-error-btn-dismiss" aria-label="Dismiss error">
            ✕
          </button>
        )}
      </div>

      <div className="d-flex align-items-center gap-2 w-100 justify-content-end pt-1 border-top border-1 border-danger">
        {onRetry && (
          <button onClick={onRetry} className="btn brutal-btn btn-sm">
            <i className="bi bi-arrow-counterclockwise"></i> Retry Real Tx
          </button>
        )}
        {onDemo && (
          <button onClick={onDemo} className="btn brutal-btn brutal-btn-lime btn-sm fw-bold">
            ⚡ Instant Demo Mode (Complete Donation)
          </button>
        )}
      </div>
    </div>
  );
};
