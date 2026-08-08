import React from 'react';
import type { DonationStep } from '../../types';

const STEPS: { key: DonationStep; label: string; icon: string }[] = [
  { key: 'connecting', label: 'Connect', icon: '🦊' },
  { key: 'entering_amount', label: 'Amount', icon: '💰' },
  { key: 'confirming', label: 'Confirm', icon: '📝' },
  { key: 'mining', label: 'Mining', icon: '⛏' },
  { key: 'success', label: 'Done', icon: '✅' },
];

const STEP_ORDER: DonationStep[] = [
  'idle',
  'connecting',
  'wrong_network',
  'entering_amount',
  'confirming',
  'mining',
  'notifying',
  'success',
  'error',
];

interface TransactionStatusProps {
  step: DonationStep;
  txHash: string | null;
}

export const TransactionStatus: React.FC<TransactionStatusProps> = ({ step, txHash }) => {
  const currentIdx = STEP_ORDER.indexOf(step);

  return (
    <div className="w3-tx-status">
      <div className="w3-tx-steps">
        {STEPS.map((s, i) => {
          const stepIdx = STEP_ORDER.indexOf(s.key);
          const isDone = currentIdx > stepIdx;
          const isActive = currentIdx === stepIdx || (s.key === 'mining' && step === 'notifying');
          return (
            <div
              key={s.key}
              className={`w3-tx-step ${isDone ? 'w3-tx-step-done' : ''} ${isActive ? 'w3-tx-step-active' : ''}`}
            >
              <div className="w3-tx-step-circle">
                {isDone ? '✓' : isActive && step === 'mining' ? (
                  <span className="w3-tx-spin">⟳</span>
                ) : (
                  s.icon
                )}
              </div>
              <span className="w3-tx-step-label">{s.label}</span>
              {i < STEPS.length - 1 && (
                <div className={`w3-tx-connector ${isDone ? 'w3-tx-connector-done' : ''}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Mining progress indicator */}
      {(step === 'mining' || step === 'notifying') && txHash && (
        <div className="w3-tx-mining-info">
          <div className="w3-tx-mining-dots">
            <span />
            <span />
            <span />
          </div>
          <p className="w3-tx-mining-label">
            {step === 'mining' ? 'Waiting for block confirmation…' : 'Notifying backend…'}
          </p>
          <code className="w3-tx-hash-mini">{txHash.slice(0, 10)}…{txHash.slice(-8)}</code>
        </div>
      )}
    </div>
  );
};
