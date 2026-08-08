import React, { useEffect, useState, useCallback } from 'react';
import { useWeb3 } from '../../context/Web3Context';
import { walletActivityAPI } from '../../services/api';
import type {
  WalletActivityRecord,
  WalletStatCard,
  WalletTransactionDetails,
  UserRole,
} from '../../types';

export const WalletActivityPage: React.FC = () => {
  const { user, account } = useWeb3();
  const role: UserRole = (user?.role || 'donor') as UserRole;

  // Data states
  const [records, setRecords] = useState<WalletActivityRecord[]>([]);
  const [statCards, setStatCards] = useState<WalletStatCard[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [search, setSearch] = useState<string>('');
  const [category, setCategory] = useState<string>('All');
  const [status, setStatus] = useState<string>('All');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalRecords, setTotalRecords] = useState<number>(0);

  // Single Transaction Modal State
  const [selectedTxHash, setSelectedTxHash] = useState<string | null>(null);
  const [txDetails, setTxDetails] = useState<WalletTransactionDetails | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState<boolean>(false);

  // Full Master Report Modal State
  const [isMasterReportOpen, setIsMasterReportOpen] = useState<boolean>(false);

  // Fetch Activity Data
  const fetchActivity = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await walletActivityAPI.getActivity({
        search: search.trim(),
        category: category !== 'All' ? category : undefined,
        status: status !== 'All' ? status : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        page,
        limit: 10,
      });

      const data = response.data || {};
      setRecords(data.records || []);
      setStatCards(data.statistics?.cards || []);
      if (data.meta) {
        setTotalPages(data.meta.totalPages || 1);
        setTotalRecords(data.meta.totalRecords || 0);
      }
    } catch (err: any) {
      console.error('Failed to fetch wallet activity:', err);
      setError(err.message || 'Failed to load wallet activity from server.');
    } finally {
      setIsLoading(false);
    }
  }, [search, category, status, startDate, endDate, page]);

  useEffect(() => {
    fetchActivity();
  }, [fetchActivity]);

  // Fetch Single Transaction Details Modal
  const handleOpenDetails = async (txHash: string) => {
    setSelectedTxHash(txHash);
    setIsLoadingDetails(true);
    setTxDetails(null);

    try {
      const res = await walletActivityAPI.getTransactionDetails(txHash);
      setTxDetails(res.data);
    } catch (err: any) {
      console.error('Failed to fetch transaction details:', err);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleClearFilters = () => {
    setSearch('');
    setCategory('All');
    setStatus('All');
    setStartDate('');
    setEndDate('');
    setPage(1);

    // Wipes displayed records from the screen on Clear
    setRecords([]);
    setTotalRecords(0);
    setTotalPages(1);
  };

  // Export CSV Helper
  const handleDownloadCSV = () => {
    if (records.length === 0) return;
    const headers = ['Timestamp', 'TxHash', 'Campaign', 'Category', 'DonorWallet', 'RecipientWallet', 'AmountPOL', 'BlockNumber', 'Status', 'IPFSCID'];
    const rows = records.map((r) => [
      new Date(r.timestamp).toISOString(),
      r.txHash,
      `"${(r.campaignTitle || '').replace(/"/g, '""')}"`,
      r.category,
      r.rawDonorWallet || r.donorWallet,
      r.recipientWallet,
      r.amountEth,
      r.blockNumber,
      r.status,
      r.ipfsCid || 'N/A',
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `TrustChain_Master_Audit_Report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getRoleHeaderInfo = () => {
    switch (role) {
      case 'recipient':
      case 'user':
        return {
          title: 'Recipient Wallet Activity',
          subtitle: 'Track incoming donations, campaign progress, and recipient wallet verifications.',
          badge: 'Recipient Mode',
          badgeColor: 'badge-lime',
          icon: 'bi-person-workspace',
        };
      case 'donor':
        return {
          title: 'Donor Wallet Activity',
          subtitle: 'View your contribution history, verified campaign transactions, and on-chain records.',
          badge: 'Donor Mode',
          badgeColor: 'badge-cyan',
          icon: 'bi-heart-fill',
        };
      case 'admin':
        return {
          title: 'Admin Blockchain Overview',
          subtitle: 'Platform-wide transaction monitor, smart contract execution logs, and verification audits.',
          badge: 'Admin Mode',
          badgeColor: 'badge-yellow',
          icon: 'bi-shield-lock-fill',
        };
      case 'authority':
        return {
          title: 'Authority Audit Log',
          subtitle: 'On-chain verification hashes, IPFS CIDs, and compliance audit trail.',
          badge: 'Authority Mode',
          badgeColor: 'badge-magenta',
          icon: 'bi-file-lock-fill',
        };
      case 'hospital':
        return {
          title: 'Hospital Support Portal',
          subtitle: 'Patient medical campaigns, donation progress, and institutional verification records.',
          badge: 'Hospital Mode',
          badgeColor: 'badge-lime',
          icon: 'bi-hospital-fill',
        };
      case 'investigator':
        return {
          title: 'Investigator Forensic Audit',
          subtitle: 'Complete block numbers, smart contract event logs, document hashes, and timeline analysis.',
          badge: 'Investigator Mode',
          badgeColor: 'badge-cyan',
          icon: 'bi-search-heart',
        };
      case 'reviewer':
        return {
          title: 'Reviewer Verification Portal',
          subtitle: 'Pending campaign verifications, wallet verification statuses, and trust score timelines.',
          badge: 'Reviewer Mode',
          badgeColor: 'badge-yellow',
          icon: 'bi-check2-square',
        };
      default:
        return {
          title: 'Wallet Activity Log',
          subtitle: 'Blockchain transaction history and wallet status.',
          badge: 'Wallet Activity',
          badgeColor: 'badge-cyan',
          icon: 'bi-wallet2',
        };
    }
  };

  const roleInfo = getRoleHeaderInfo();

  // Compute Total Master Volume
  const masterVolume = records.reduce((sum, r) => sum + (r.amountNum || 0), 0);

  return (
    <div className="container py-4">
      {/* ── Page Header Banner ───────────────────────────────────────── */}
      <div className="brutal-card p-4 mb-4 bg-white">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-2">
              <span className={`brutal-badge ${roleInfo.badgeColor} fs-6`}>
                <i className={`bi ${roleInfo.icon} me-1`}></i>
                {roleInfo.badge}
              </span>
              <span className="brutal-badge badge-cyan fs-6">Polygon Amoy Testnet</span>
            </div>
            <h2 className="fw-black text-uppercase mb-1">
              🪙 Wallet Activity &amp; Blockchain Audit
            </h2>
            <p className="text-secondary fw-bold small mb-0">{roleInfo.subtitle}</p>
          </div>

          <div className="d-flex flex-column align-items-end gap-2">
            <button
              onClick={() => setIsMasterReportOpen(true)}
              className="btn brutal-btn brutal-btn-lime fw-black"
              title="Generate Consolidated Master Audit Report for All Transactions"
            >
              <i className="bi bi-file-earmark-bar-graph-fill me-1"></i> 📊 Master Audit Report
            </button>
            <code className="fw-bold text-dark small">
              {account ? `${account.substring(0, 6)}...${account.substring(account.length - 4)}` : user?.email || 'Authenticated Session'}
            </code>
          </div>
        </div>
      </div>

      {/* ── Summary Statistics Cards Grid ───────────────────────────────── */}
      <div className="row g-3 mb-4">
        {statCards.map((card) => (
          <div key={card.key} className="col-12 col-sm-6 col-lg-3">
            <div className={`brutal-card p-3 bg-white h-100 brutal-hover-${card.color}`}>
              <div className="d-flex justify-content-between align-items-start mb-2">
                <span className="small text-secondary fw-bold text-uppercase">{card.label}</span>
                <i className={`bi ${card.icon} fs-4 text-${card.color === 'lime' ? 'success' : card.color === 'cyan' ? 'info' : card.color === 'yellow' ? 'warning' : 'danger'}`}></i>
              </div>
              <h3 className="fw-black mb-0">{card.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* ── Search & Filters Bar ───────────────────────────────────────── */}
      <div className="brutal-card p-3 mb-4 bg-light">
        <div className="row g-2 align-items-center">
          {/* Search Input */}
          <div className="col-12 col-md-4">
            <div className="input-group">
              <span className="input-group-text bg-dark text-white fw-bold">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control fw-bold"
                placeholder="Search Tx Hash, Wallet, Campaign..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="col-6 col-md-2">
            <select
              className="form-select fw-bold"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="All">All Categories</option>
              <option value="Medical">Medical</option>
              <option value="Education">Education</option>
              <option value="Emergency">Emergency</option>
              <option value="General">General</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="col-6 col-md-2">
            <select
              className="form-select fw-bold"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="VERIFIED">Verified</option>
              <option value="PENDING">Pending</option>
            </select>
          </div>

          {/* Start Date */}
          <div className="col-6 col-md-2">
            <input
              type="date"
              className="form-control fw-bold"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              title="Start Date"
            />
          </div>

          {/* Clear Log & Reload Buttons */}
          <div className="col-12 col-md-2 d-flex gap-1">
            <button
              type="button"
              onClick={handleClearFilters}
              className="btn brutal-btn brutal-btn-yellow w-50 fw-bold px-1"
              title="Clear displayed transaction records from screen"
            >
              <i className="bi bi-trash3-fill me-1"></i> Clear
            </button>
            <button
              type="button"
              onClick={fetchActivity}
              className="btn brutal-btn brutal-btn-lime w-50 fw-bold px-1"
              title="Reload latest records from server"
            >
              <i className="bi bi-arrow-clockwise me-1"></i> Reload
            </button>
          </div>
        </div>
      </div>

      {/* ── Transaction Table Section ──────────────────────────────────── */}
      <div className="brutal-card p-0 bg-white overflow-hidden mb-4">
        <div className="p-3 border-bottom border-2 border-dark d-flex justify-content-between align-items-center bg-light">
          <h5 className="fw-black text-uppercase mb-0">
            <i className="bi bi-list-task me-2"></i>
            Blockchain Transaction Log ({totalRecords})
          </h5>
          <div className="d-flex align-items-center gap-2">
            <button
              onClick={() => setIsMasterReportOpen(true)}
              className="btn brutal-btn brutal-btn-yellow btn-sm fw-bold"
            >
              📊 Export Master Report
            </button>
            <span className="small text-secondary fw-bold">Page {page} of {totalPages}</span>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-dark" role="status"></div>
            <p className="fw-bold mt-2">Loading blockchain records...</p>
          </div>
        ) : error ? (
          <div className="p-4 text-center">
            <i className="bi bi-exclamation-triangle-fill text-danger fs-1 mb-2"></i>
            <h5 className="fw-bold">{error}</h5>
            <button onClick={fetchActivity} className="btn brutal-btn mt-2">Retry</button>
          </div>
        ) : records.length === 0 ? (
          <div className="p-5 text-center">
            <i className="bi bi-inbox-fill text-secondary fs-1 mb-2"></i>
            <h5 className="fw-bold mb-1">No Wallet Activity Records Found</h5>
            <p className="text-secondary small mb-2">
              Click Reload to fetch current platform transactions from MongoDB Atlas.
            </p>
            <button onClick={fetchActivity} className="btn brutal-btn brutal-btn-lime btn-sm fw-bold">
              <i className="bi bi-arrow-clockwise me-1"></i> Reload Activity Log
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-dark text-uppercase small">
                <tr>
                  <th scope="col">Timestamp</th>
                  <th scope="col">Campaign / Entity</th>
                  <th scope="col">From / To Wallet</th>
                  {role !== 'authority' && <th scope="col">Amount</th>}
                  <th scope="col">Block / Network</th>
                  <th scope="col">Status</th>
                  <th scope="col" className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map((rec) => (
                  <tr key={rec.id || rec.txHash}>
                    <td>
                      <small className="fw-bold text-dark d-block">
                        {new Date(rec.timestamp).toLocaleDateString()}
                      </small>
                      <small className="text-secondary font-monospace" style={{ fontSize: '0.75rem' }}>
                        {new Date(rec.timestamp).toLocaleTimeString()}
                      </small>
                    </td>

                    <td>
                      <span className="fw-bold text-dark d-block">{rec.campaignTitle}</span>
                      <span className="brutal-badge badge-cyan" style={{ fontSize: '0.65rem' }}>
                        {rec.category}
                      </span>
                    </td>

                    <td>
                      <div className="small">
                        <span className="text-secondary">From: </span>
                        <code className="fw-bold text-dark">{rec.donorWallet}</code>
                      </div>
                      <div className="small">
                        <span className="text-secondary">To: </span>
                        <code className="fw-bold text-dark">
                          {rec.recipientWallet ? `${rec.recipientWallet.substring(0, 6)}...${rec.recipientWallet.substring(rec.recipientWallet.length - 4)}` : 'Recipient Wallet'}
                        </code>
                      </div>
                    </td>

                    {role !== 'authority' && (
                      <td>
                        <span className="fw-black text-primary fs-6">{rec.amountDisplay}</span>
                      </td>
                    )}

                    <td>
                      <small className="fw-bold d-block">#{rec.blockNumber}</small>
                      <small className="text-secondary" style={{ fontSize: '0.75rem' }}>{rec.network}</small>
                    </td>

                    <td>
                      <span className="brutal-badge badge-lime">
                        <i className="bi bi-check-circle-fill me-1"></i>
                        {rec.status}
                      </span>
                    </td>

                    <td className="text-end">
                      <div className="d-flex gap-1 justify-content-end">
                        <button
                          onClick={() => handleOpenDetails(rec.txHash)}
                          className="btn brutal-btn brutal-btn-lime btn-sm"
                          title="View Complete Details"
                        >
                          <i className="bi bi-eye-fill"></i> Details
                        </button>
                        <a
                          href={rec.explorerUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="btn brutal-btn brutal-btn-cyan btn-sm"
                          title="View on PolygonScan"
                        >
                          <i className="bi bi-box-arrow-up-right"></i>
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-3 border-top border-2 border-dark d-flex justify-content-between align-items-center bg-light">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="btn brutal-btn btn-sm"
            >
              <i className="bi bi-arrow-left"></i> Previous
            </button>
            <span className="fw-bold small">
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="btn brutal-btn btn-sm"
            >
              Next <i className="bi bi-arrow-right"></i>
            </button>
          </div>
        )}
      </div>

      {/* ── Single Transaction Details Modal ────────────────────────────── */}
      {selectedTxHash && (
        <div className="modal-overlay" onClick={() => setSelectedTxHash(null)}>
          <div className="modal-dialog modal-dialog-centered modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content brutal-modal p-0">
              <div className="modal-header d-flex justify-content-between align-items-center bg-dark text-white p-3">
                <h5 className="modal-title fw-black text-uppercase mb-0 text-white">
                  <i className="bi bi-shield-check text-warning me-2"></i>
                  Blockchain Transaction Details
                </h5>
                <button className="btn-close btn-close-white" onClick={() => setSelectedTxHash(null)}></button>
              </div>

              <div className="modal-body p-4">
                {isLoadingDetails || !txDetails ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-dark" role="status"></div>
                    <p className="fw-bold mt-2">Fetching transaction record from Polygon Amoy...</p>
                  </div>
                ) : (
                  <div>
                    {/* Status Pill */}
                    <div className="d-flex justify-content-between align-items-center p-3 brutal-card bg-light mb-4">
                      <div>
                        <span className="text-secondary small fw-bold d-block">TRANSACTION STATUS</span>
                        <span className="brutal-badge badge-lime fs-6">
                          <i className="bi bi-check-circle-fill me-1"></i> {txDetails.status}
                        </span>
                      </div>
                      <div className="text-end">
                        <span className="text-secondary small fw-bold d-block">CONFIRMATIONS</span>
                        <span className="fw-black fs-5 text-dark">{txDetails.confirmationCount}+ Blocks</span>
                      </div>
                    </div>

                    {/* Transaction Details Table */}
                    <div className="table-responsive brutal-card p-3 bg-white mb-4">
                      <table className="table table-borderless align-middle mb-0 small">
                        <tbody>
                          <tr>
                            <td className="fw-bold text-secondary text-uppercase" style={{ width: '180px' }}>
                              Transaction Hash
                            </td>
                            <td>
                              <code className="fw-bold text-primary text-break">{txDetails.transactionHash}</code>
                            </td>
                          </tr>
                          <tr>
                            <td className="fw-bold text-secondary text-uppercase">From Wallet</td>
                            <td>
                              <code className="fw-bold text-dark">{txDetails.fromWallet}</code>
                            </td>
                          </tr>
                          <tr>
                            <td className="fw-bold text-secondary text-uppercase">To Wallet</td>
                            <td>
                              <code className="fw-bold text-dark">{txDetails.toWallet}</code>
                            </td>
                          </tr>
                          {role !== 'authority' && (
                            <tr>
                              <td className="fw-bold text-secondary text-uppercase">Donation Amount</td>
                              <td>
                                <span className="fw-black fs-5 text-success">{txDetails.amountDisplay}</span>
                              </td>
                            </tr>
                          )}
                          <tr>
                            <td className="fw-bold text-secondary text-uppercase">Block Number</td>
                            <td className="fw-bold">#{txDetails.blockNumber}</td>
                          </tr>
                          <tr>
                            <td className="fw-bold text-secondary text-uppercase">Gas Used</td>
                            <td className="fw-bold font-monospace">{txDetails.gasUsed}</td>
                          </tr>
                          <tr>
                            <td className="fw-bold text-secondary text-uppercase">Network</td>
                            <td className="fw-bold">{txDetails.network}</td>
                          </tr>
                          <tr>
                            <td className="fw-bold text-secondary text-uppercase">Timestamp</td>
                            <td className="fw-bold">{new Date(txDetails.timestamp).toLocaleString()}</td>
                          </tr>
                          <tr>
                            <td className="fw-bold text-secondary text-uppercase">Smart Contract</td>
                            <td>
                              <code className="fw-bold text-dark">{txDetails.smartContractAddress}</code>
                            </td>
                          </tr>
                          <tr>
                            <td className="fw-bold text-secondary text-uppercase">IPFS CID</td>
                            <td>
                              <code className="fw-bold text-secondary">{txDetails.campaign?.ipfsCid || 'QmT78zK...ipfsHash'}</code>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Modal Actions */}
                    <div className="d-flex justify-content-end gap-2 flex-wrap">
                      <button className="btn brutal-btn" onClick={() => setSelectedTxHash(null)}>
                        Close
                      </button>
                      <button
                        className="btn brutal-btn brutal-btn-yellow fw-bold"
                        onClick={() => window.print()}
                      >
                        <i className="bi bi-printer me-1"></i> Print Audit Report
                      </button>
                      <a
                        href={txDetails.explorerUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn brutal-btn brutal-btn-cyan fw-bold"
                      >
                        <i className="bi bi-box-arrow-up-right me-1"></i> View on PolygonScan
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── CONSOLIDATED MASTER TRANSACTIONS AUDIT REPORT MODAL ─────────── */}
      {isMasterReportOpen && (
        <div className="modal-overlay" onClick={() => setIsMasterReportOpen(false)}>
          <div className="modal-dialog modal-dialog-centered modal-xl" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content brutal-modal p-0">
              {/* Header */}
              <div className="modal-header d-flex justify-content-between align-items-center bg-dark text-white p-3">
                <div className="d-flex align-items-center gap-2">
                  <span className="fs-4">📊</span>
                  <div>
                    <h4 className="modal-title fw-black text-uppercase mb-0 text-white">
                      FundTogether Master Transaction Audit Report
                    </h4>
                    <small className="text-warning fw-bold">
                      Cryptographic On-Chain Audit &amp; Platform Ledger Summary
                    </small>
                  </div>
                </div>
                <button className="btn-close btn-close-white" onClick={() => setIsMasterReportOpen(false)}></button>
              </div>

              {/* Body */}
              <div className="modal-body p-4 bg-white">
                {/* Summary Banner Box */}
                <div className="brutal-card p-3 bg-light mb-4">
                  <div className="row g-3 text-center">
                    <div className="col-6 col-md-3">
                      <small className="text-secondary fw-bold text-uppercase d-block">Report Scope</small>
                      <span className="fw-black fs-5 text-dark text-uppercase">{role} Scope</span>
                    </div>
                    <div className="col-6 col-md-3">
                      <small className="text-secondary fw-bold text-uppercase d-block">Total Logged Tx</small>
                      <span className="fw-black fs-5 text-primary">{records.length} Records</span>
                    </div>
                    <div className="col-6 col-md-3">
                      <small className="text-secondary fw-bold text-uppercase d-block">Total Volume</small>
                      <span className="fw-black fs-5 text-success">{masterVolume.toFixed(4)} POL</span>
                    </div>
                    <div className="col-6 col-md-3">
                      <small className="text-secondary fw-bold text-uppercase d-block">Network Node</small>
                      <span className="fw-black fs-6 text-dark">Polygon Amoy (80002)</span>
                    </div>
                  </div>
                </div>

                {/* Master Audit Log Table */}
                <div className="table-responsive brutal-card p-0 mb-4">
                  <table className="table table-striped table-hover align-middle mb-0 small">
                    <thead className="table-dark text-uppercase">
                      <tr>
                        <th>#</th>
                        <th>Timestamp</th>
                        <th>Tx Hash</th>
                        <th>Campaign Title</th>
                        <th>Donor Wallet</th>
                        <th>Recipient Wallet</th>
                        <th>Amount</th>
                        <th>Block</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {records.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="text-center py-4 fw-bold text-secondary">
                            No active records in current view.
                          </td>
                        </tr>
                      ) : (
                        records.map((r, index) => (
                          <tr key={r.id || r.txHash}>
                            <td className="fw-bold">{index + 1}</td>
                            <td>{new Date(r.timestamp).toLocaleString()}</td>
                            <td>
                              <code className="fw-bold text-primary">{r.txHash.substring(0, 10)}...</code>
                            </td>
                            <td className="fw-bold text-dark">{r.campaignTitle}</td>
                            <td>
                              <code>{r.donorWallet}</code>
                            </td>
                            <td>
                              <code>{r.recipientWallet ? `${r.recipientWallet.substring(0, 6)}...` : 'N/A'}</code>
                            </td>
                            <td className="fw-black text-success">{r.amountDisplay}</td>
                            <td className="fw-bold font-monospace">#{r.blockNumber}</td>
                            <td>
                              <span className="brutal-badge badge-lime">{r.status}</span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Cryptographic Compliance Seal */}
                <div className="p-3 border border-2 border-dark bg-light d-flex justify-content-between align-items-center flex-wrap gap-2">
                  <div className="d-flex align-items-center gap-2">
                    <i className="bi bi-shield-lock-fill text-success fs-3"></i>
                    <div>
                      <small className="fw-black text-uppercase d-block text-dark">
                        TrustChain Cryptographic Compliance Verification
                      </small>
                      <small className="text-secondary">
                        All transaction records are verified on Polygon Amoy blockchain &amp; indexed in MongoDB Atlas.
                      </small>
                    </div>
                  </div>
                  <span className="font-monospace small fw-bold text-secondary">
                    Generated: {new Date().toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Footer */}
              <div className="modal-footer bg-light p-3 d-flex justify-content-between align-items-center">
                <span className="small text-secondary fw-bold">
                  FundTogether · Decentralized Transparency &amp; Audit Engine
                </span>
                <div className="d-flex gap-2">
                  <button className="btn brutal-btn" onClick={() => setIsMasterReportOpen(false)}>
                    Close
                  </button>
                  <button
                    className="btn brutal-btn brutal-btn-yellow fw-bold"
                    onClick={handleDownloadCSV}
                    disabled={records.length === 0}
                  >
                    <i className="bi bi-download me-1"></i> Download CSV Log
                  </button>
                  <button
                    className="btn brutal-btn brutal-btn-lime fw-black"
                    onClick={() => window.print()}
                  >
                    <i className="bi bi-printer me-1"></i> Print Master Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
