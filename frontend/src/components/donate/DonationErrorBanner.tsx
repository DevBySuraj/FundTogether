import React from 'react';

interface DonationErrorBannerProps {
  error: string;
  onDismiss?: () => void;
  onRetry?: () => void;
}

// Map common error patterns to friendly messages with help links
const enrichError = (err: string): { message: string; hint?: string } => {
  if (err.includes('MetaMask is not installed')) {
    return {
      message: err,
      hint: 'Download MetaMask at metamask.io to donate with crypto.',
    };
  }
  if (err.includes('rejected') || err.includes('cancelled')) {
    return {
      message: 'Transaction cancelled.',
      hint: 'You declined the MetaMask prompt. Click Donate to try again.',
    };
  }
  if (err.includes('Insufficient') || err.includes('insufficient funds')) {
    return {
      message: 'Insufficient wallet balance.',
      hint: 'Add more POL to your wallet on Polygon Amoy Testnet to proceed.',
    };
  }
  if (err.includes('Wrong network') || err.includes('wrong network')) {
    return {
      message: 'Wrong blockchain network.',
      hint: 'Please switch to Polygon Amoy Testnet in MetaMask.',
    };
  }
  if (err.includes('timeout')) {
    return {
      message: 'Transaction confirmation timed out.',
      hint: 'The transaction may still be pending. Check PolygonScan before retrying.',
    };
  }
  if (err.includes('reverted') || err.includes('CALL_EXCEPTION')) {
    return {
      message: 'Smart contract transaction reverted.',
      hint: 'The donation contract rejected this transaction. Contact support if this persists.',
    };
  }
  return { message: err };
};

export const DonationErrorBanner: React.FC<DonationErrorBannerProps> = ({
  error,
  onDismiss,
  onRetry,
}) => {
  const { message, hint } = enrichError(error);

  return (
    <div className="w3-error-banner" role="alert">
      <div className="w3-error-icon">⚠</div>
      <div className="w3-error-body">
        <p className="w3-error-message">{message}</p>
        {hint && <p className="w3-error-hint">{hint}</p>}
      </div>
      <div className="w3-error-actions">
        {onRetry && (
          <button onClick={onRetry} className="w3-error-btn-retry">
            Retry
          </button>
        )}
        {onDismiss && (
          <button onClick={onDismiss} className="w3-error-btn-dismiss" aria-label="Dismiss error">
            ✕
          </button>
        )}
      </div>
    </div>
  );
};
