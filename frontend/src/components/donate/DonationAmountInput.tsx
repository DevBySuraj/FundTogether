import React from 'react';

const PRESET_AMOUNTS = ['0.001', '0.005', '0.01', '0.05', '0.1'];

interface DonationAmountInputProps {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
}

export const DonationAmountInput: React.FC<DonationAmountInputProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const numVal = parseFloat(value);
  const isValid = !isNaN(numVal) && numVal > 0;

  return (
    <div className="w3-amount-wrap">
      <label className="w3-label">Donation Amount</label>
      <div className="w3-amount-input-row">
        <input
          id="donation-amount-input"
          type="number"
          min="0.0001"
          step="0.001"
          placeholder="0.01"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={`w3-amount-input ${!isValid && value !== '' ? 'w3-amount-input-error' : ''}`}
        />
        <span className="w3-amount-currency">POL</span>
      </div>

      {/* Preset quick-select */}
      <div className="w3-presets">
        {PRESET_AMOUNTS.map((amt) => (
          <button
            key={amt}
            type="button"
            onClick={() => onChange(amt)}
            disabled={disabled}
            className={`w3-preset-btn ${value === amt ? 'w3-preset-btn-active' : ''}`}
          >
            {amt} POL
          </button>
        ))}
      </div>

      {!isValid && value !== '' && (
        <p className="w3-amount-error">Please enter a valid amount greater than 0.</p>
      )}

      {isValid && (
        <p className="w3-amount-hint">
          ≈ {numVal} POL on Polygon Amoy Testnet
        </p>
      )}
    </div>
  );
};
