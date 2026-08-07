import React, { useEffect, useState } from 'react';
import { adminService } from '../services/adminService';
import { Search, History, CheckCircle, ExternalLink } from 'lucide-react';

export const AdminHistoryPage: React.FC = () => {
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getHistory();
      setHistory(data);
    } catch (err) {
      console.error('Failed to load verification history:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredHistory = history.filter((item) => {
    const title = item.campaignId?.title || item.title || 'Campaign';
    const reviewer = item.reviewedBy || 'Admin';
    return title.toLowerCase().includes(searchTerm.toLowerCase()) || reviewer.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="d-flex flex-column gap-4">
      {/* Header Bar */}
      <div className="admin-card p-3 d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
        <div className="d-flex align-items-center gap-2">
          <History size={20} color="var(--admin-accent-primary)" />
          <span className="fw-bold text-white">Verification Audit Log &amp; On-Chain History</span>
        </div>

        <div className="position-relative" style={{ minWidth: '280px' }}>
          <Search size={16} className="position-absolute" style={{ left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-text-dim)' }} />
          <input
            type="text"
            className="form-control admin-input w-100"
            style={{ paddingLeft: '36px' }}
            placeholder="Search log history..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="admin-card overflow-hidden">
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Campaign</th>
                <th>Recipient / Wallet</th>
                <th>Audit Status</th>
                <th>Reviewed By</th>
                <th>Verification Date</th>
                <th>IPFS &amp; On-Chain Hash</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-5 text-white-50">
                    <div className="spinner-border text-primary me-2"></div>
                    Loading audit history...
                  </td>
                </tr>
              ) : filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-5 text-white-50">
                    No verification log entries found matching search query.
                  </td>
                </tr>
              ) : (
                filteredHistory.map((item, idx) => {
                  const title = item.campaignId?.title || item.title || `Campaign Audit #${idx + 101}`;
                  const wallet = item.campaignId?.recipientWallet || item.reviewedBy || '0x71c7...976f';
                  const date = new Date(item.updatedAt || item.createdAt || Date.now()).toLocaleString();
                  const txHash = item.onChainTxHash || item.txHash;
                  const ipfsCid = item.ipfsCid;

                  return (
                    <tr key={item._id || idx}>
                      <td>
                        <div className="fw-bold text-white mb-1">{title}</div>
                        <small className="font-monospace text-white-50" style={{ fontSize: '0.72rem' }}>
                          ID: {(item._id || 'id').substring(0, 10)}...
                        </small>
                      </td>

                      <td>
                        <span className="font-monospace small text-info">{wallet}</span>
                      </td>

                      <td>
                        <span className={`admin-badge ${item.status === 'APPROVED' ? 'admin-badge-success' : item.status === 'REJECTED' ? 'admin-badge-danger' : 'admin-badge-warning'}`}>
                          {item.status || 'APPROVED'}
                        </span>
                      </td>

                      <td className="small text-white-50">{item.reviewedBy || 'Platform Administrator'}</td>

                      <td className="small text-white-50">{date}</td>

                      <td>
                        {txHash ? (
                          <div className="d-flex flex-column gap-1">
                            <span className="font-monospace small text-success d-flex align-items-center gap-1">
                              <CheckCircle size={13} /> Tx: {txHash.substring(0, 10)}...
                            </span>
                            {ipfsCid && (
                              <a
                                href={`https://gateway.pinata.cloud/ipfs/${ipfsCid}`}
                                target="_blank"
                                rel="noreferrer"
                                className="small text-info text-decoration-none d-flex align-items-center gap-1"
                              >
                                IPFS CID <ExternalLink size={12} />
                              </a>
                            )}
                          </div>
                        ) : (
                          <span className="small text-white-50 font-monospace">Internal Audit Record</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
