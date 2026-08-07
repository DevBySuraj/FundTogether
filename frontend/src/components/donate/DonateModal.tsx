import React, { useState } from 'react';
import type { Campaign } from '../../types';

interface DonateModalProps {
  campaign: Campaign | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const DonateModal: React.FC<DonateModalProps> = ({
  campaign,
  onClose,
  onSuccess,
}) => {
  const [amountInr, setAmountInr] = useState<string>('1000');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking' | 'wallet'>('upi');
  
  // Method specific fields
  const [upiId, setUpiId] = useState<string>('donor@okaxis');
  const [cardNumber, setCardNumber] = useState<string>('4111 2222 3333 4444');
  const [cardExpiry, setCardExpiry] = useState<string>('12/28');
  const [cardCvv, setCardCvv] = useState<string>('123');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [txMessage, setTxMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!campaign) return null;

  const quickAmounts = ['500', '1000', '5000', '10000'];

  const formatInr = (amt: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amt);
  };

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setTxMessage(null);

    const numericAmount = parseFloat(amountInr);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setErrorMessage('Please enter a valid donation amount in ₹ INR.');
      return;
    }

    setIsSubmitting(true);

    try {
      setTxMessage(`Processing ${paymentMethod.toUpperCase()} donation of ${formatInr(numericAmount)}...`);
      await new Promise((resolve) => setTimeout(resolve, 1400));

      const txnId = 'TXN-INR-' + Math.floor(100000 + Math.random() * 900000);
      setTxMessage(`Donation of ${formatInr(numericAmount)} via ${paymentMethod.toUpperCase()} successful! Receipt ID: ${txnId}`);
      
      campaign.currentAmount += numericAmount;

      onSuccess();
      setTimeout(() => {
        onClose();
      }, 2200);
    } catch (err: any) {
      console.error('Donation error:', err);
      setErrorMessage(err.message || 'Donation payment failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog modal-dialog-centered modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content brutal-modal">
          {/* Modal Header */}
          <div className="modal-header d-flex justify-content-between align-items-center">
            <h4 className="modal-title fw-black text-uppercase mb-0">
              <i className="bi bi-heart-fill text-danger me-2"></i> Donate (₹ INR)
            </h4>
            <button className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body p-4">
            {/* Campaign Summary Card */}
            <div className="brutal-card p-3 mb-4 bg-light">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <span className="brutal-badge badge-cyan">{campaign.category}</span>
                <span className="small text-secondary fw-bold">Target: {formatInr(campaign.targetAmount)}</span>
              </div>
              <h5 className="fw-bold mb-1">{campaign.title}</h5>
              <p className="text-secondary small mb-0">
                Recipient: <code className="fw-bold text-dark">{campaign.recipientWallet}</code>
              </p>
            </div>

            {errorMessage && (
              <div className="alert alert-danger fw-bold small mb-3">{errorMessage}</div>
            )}

            {txMessage && (
              <div className="alert alert-success fw-bold small mb-3 d-flex align-items-center gap-2">
                <i className="bi bi-check-circle-fill fs-5"></i>
                <span>{txMessage}</span>
              </div>
            )}

            <form onSubmit={handleDonate}>
              {/* Amount Input */}
              <div className="mb-3">
                <label className="form-label fw-bold">Donation Amount (₹ INR)</label>
                <div className="input-group input-group-lg">
                  <span className="input-group-text fw-bold bg-dark text-white">₹</span>
                  <input
                    type="number"
                    min="10"
                    step="10"
                    className="form-control fw-bold"
                    required
                    placeholder="e.g. 1000"
                    value={amountInr}
                    onChange={(e) => setAmountInr(e.target.value)}
                  />
                </div>
              </div>

              {/* Quick Amount Selector Buttons */}
              <div className="d-flex gap-2 mb-4">
                {quickAmounts.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setAmountInr(amt)}
                    className={`btn brutal-btn btn-sm flex-fill ${amountInr === amt ? 'brutal-btn-lime' : ''}`}
                  >
                    ₹ {parseInt(amt).toLocaleString('en-IN')}
                  </button>
                ))}
              </div>

              {/* Payment Method Tabs */}
              <label className="form-label fw-bold mb-2">Select Payment Method</label>
              <div className="row g-2 mb-4">
                <div className="col-6 col-md-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi')}
                    className={`btn brutal-btn w-100 py-2 ${paymentMethod === 'upi' ? 'brutal-btn-lime' : ''}`}
                  >
                    <i className="bi bi-qr-code-scan me-1"></i> UPI
                  </button>
                </div>

                <div className="col-6 col-md-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`btn brutal-btn w-100 py-2 ${paymentMethod === 'card' ? 'brutal-btn-cyan' : ''}`}
                  >
                    <i className="bi bi-credit-card-2-front-fill me-1"></i> Cards
                  </button>
                </div>

                <div className="col-6 col-md-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('netbanking')}
                    className={`btn brutal-btn w-100 py-2 ${paymentMethod === 'netbanking' ? 'brutal-btn-yellow' : ''}`}
                  >
                    <i className="bi bi-bank2 me-1"></i> NetBanking
                  </button>
                </div>

                <div className="col-6 col-md-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('wallet')}
                    className={`btn brutal-btn w-100 py-2 ${paymentMethod === 'wallet' ? 'brutal-btn-magenta' : ''}`}
                  >
                    <i className="bi bi-wallet2 me-1"></i> Web3 Wallet
                  </button>
                </div>
              </div>

              {/* Payment Method Details Box */}
              {paymentMethod === 'upi' && (
                <div className="p-3 border border-3 border-dark bg-light mb-4">
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <span className="brutal-badge badge-lime">Google Pay / PhonePe / Paytm / BHIM</span>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-bold small">Your UPI Virtual Payment Address (VPA)</label>
                    <input
                      type="text"
                      className="form-control font-monospace"
                      placeholder="username@upi"
                      required
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                    />
                  </div>

                  <div className="text-center p-3 bg-white border border-2 border-dark">
                    <i className="bi bi-qr-code fs-1 text-primary"></i>
                    <p className="small text-secondary mb-0 fw-bold">Scan or Pay using any UPI app on your phone</p>
                  </div>
                </div>
              )}

              {paymentMethod === 'card' && (
                <div className="p-3 border border-3 border-dark bg-light mb-4">
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <span className="brutal-badge badge-cyan">Visa / MasterCard / RuPay</span>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-bold small">Card Number</label>
                    <input
                      type="text"
                      className="form-control font-monospace"
                      placeholder="4111 2222 3333 4444"
                      required
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                    />
                  </div>

                  <div className="row">
                    <div className="col-6">
                      <label className="form-label fw-bold small">Expiry Date</label>
                      <input
                        type="text"
                        className="form-control font-monospace"
                        placeholder="MM/YY"
                        required
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label fw-bold small">CVV</label>
                      <input
                        type="password"
                        className="form-control font-monospace"
                        maxLength={4}
                        placeholder="123"
                        required
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'netbanking' && (
                <div className="p-3 border border-3 border-dark bg-light mb-4">
                  <label className="form-label fw-bold small">Select Your Bank</label>
                  <select className="form-select fw-bold mb-2">
                    <option value="HDFC">HDFC Bank</option>
                    <option value="ICICI">ICICI Bank</option>
                    <option value="SBI">State Bank of India (SBI)</option>
                    <option value="AXIS">Axis Bank</option>
                    <option value="KOTAK">Kotak Mahindra Bank</option>
                  </select>
                </div>
              )}

              {paymentMethod === 'wallet' && (
                <div className="p-3 border border-3 border-dark bg-light mb-4 text-center">
                  <i className="bi bi-wallet2 fs-2 text-primary mb-1"></i>
                  <h6 className="fw-bold mb-1">Digital Web3 / Wallet Transfer</h6>
                  <p className="small text-secondary mb-0">Direct wallet transfer logged on immutable IPFS storage.</p>
                </div>
              )}

              {/* Submit Payment Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn brutal-btn brutal-btn-lime w-100 py-3 fs-5 fw-bold text-uppercase"
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Processing {paymentMethod.toUpperCase()} Payment...
                  </>
                ) : (
                  <>
                    <i className="bi bi-shield-lock-fill text-dark me-2"></i> Pay ₹ {parseFloat(amountInr || '0').toLocaleString('en-IN')} via {paymentMethod.toUpperCase()}
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
