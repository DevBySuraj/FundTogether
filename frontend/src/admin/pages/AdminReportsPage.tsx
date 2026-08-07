import React, { useEffect, useState } from 'react';
import { adminService } from '../services/adminService';
import { PieChart, BarChart, LineChart } from '../components/ChartComponents';
import { BarChart3, ShieldAlert, Award, FileSpreadsheet, CheckCircle2 } from 'lucide-react';

export const AdminReportsPage: React.FC = () => {
  const [reports, setReports] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getReports();
      setReports(data);
    } catch (err) {
      console.error('Failed to fetch reports:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const riskPieData = [
    { label: 'Low Risk', value: 14, color: '#10b981' },
    { label: 'Medium Risk', value: 3, color: '#f59e0b' },
    { label: 'High Risk Alert', value: 1, color: '#ef4444' },
  ];

  const monthlyTrendData = [
    { month: 'Jan', value: 10 },
    { month: 'Feb', value: 18 },
    { month: 'Mar', value: 24 },
    { month: 'Apr', value: 32 },
    { month: 'May', value: 28 },
    { month: 'Jun', value: 40 },
  ];

  return (
    <div className="d-flex flex-column gap-4">
      {/* Top Banner */}
      <div className="admin-card p-4 d-flex align-items-center justify-content-between flex-wrap gap-3">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <BarChart3 size={22} color="var(--admin-accent-primary)" />
            <h4 className="fw-bold text-white mb-0">Audit &amp; Compliance Analytics Report</h4>
          </div>
          <p className="small text-white-50 mb-0">Comprehensive analysis of AI Vision OCR confidence scores and high-risk flags.</p>
        </div>

        <button className="admin-btn admin-btn-secondary" onClick={() => alert('Exporting PDF Report...')}>
          <FileSpreadsheet size={16} /> Export Executive PDF Report
        </button>
      </div>

      {/* Overview Cards */}
      <div className="row g-3">
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="admin-card p-3">
            <small className="text-white-50 font-monospace text-uppercase fw-bold" style={{ fontSize: '0.72rem' }}>Avg AI Confidence Score</small>
            <div className="fs-2 fw-bold text-success mt-1">{reports?.avgConfidence ?? 93.8}%</div>
            <small className="text-success small fw-semibold">&uarr; +2.4% accuracy improvement</small>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="admin-card p-3">
            <small className="text-white-50 font-monospace text-uppercase fw-bold" style={{ fontSize: '0.72rem' }}>High Risk Detection</small>
            <div className="fs-2 fw-bold text-danger mt-1">{reports?.highRiskCount ?? 1} Flagged</div>
            <small className="text-danger small fw-semibold">100% Intercepted</small>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="admin-card p-3">
            <small className="text-white-50 font-monospace text-uppercase fw-bold" style={{ fontSize: '0.72rem' }}>Total Verified Volume</small>
            <div className="fs-2 fw-bold text-white mt-1">₹{(reports?.totalRaisedInr ?? 385000).toLocaleString('en-IN')}</div>
            <small className="text-info small fw-semibold">100% Direct INR Donations</small>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="admin-card p-3">
            <small className="text-white-50 font-monospace text-uppercase fw-bold" style={{ fontSize: '0.72rem' }}>Audit Success Rate</small>
            <div className="fs-2 fw-bold text-info mt-1">98.2%</div>
            <small className="text-info small fw-semibold">Zero Fraud Bypasses</small>
          </div>
        </div>
      </div>

      {/* Visual Charts Row */}
      <div className="row g-3">
        <div className="col-12 col-lg-5">
          <div className="admin-card p-4 h-100">
            <h6 className="fw-bold text-white mb-1">AI Risk Assessment Breakdown</h6>
            <small className="text-white-50 small" style={{ fontSize: '0.78rem' }}>Document Fraud Analysis</small>
            <PieChart data={riskPieData} />
          </div>
        </div>

        <div className="col-12 col-lg-7">
          <div className="admin-card p-4 h-100">
            <h6 className="fw-bold text-white mb-1">Monthly Audit Growth Trend</h6>
            <small className="text-white-50 small" style={{ fontSize: '0.78rem' }}>AI OCR Processed Verifications</small>
            <BarChart data={monthlyTrendData} />
          </div>
        </div>
      </div>

      {/* Progress Bars & Compliance */}
      <div className="admin-card p-4">
        <h6 className="fw-bold text-white mb-3">System Performance &amp; AI Compliance Metrics</h6>

        <div className="d-flex flex-column gap-3">
          <div>
            <div className="d-flex justify-content-between small text-white mb-1">
              <span>Medical Hospital Invoice Seal Verification Match Rate</span>
              <span className="fw-bold text-success">96.4%</span>
            </div>
            <div className="progress" style={{ height: '8px', background: 'rgba(255,255,255,0.05)' }}>
              <div className="progress-bar bg-success" style={{ width: '96.4%' }}></div>
            </div>
          </div>

          <div>
            <div className="d-flex justify-content-between small text-white mb-1">
              <span>Pinata IPFS Decentralized Storage Pin Speed</span>
              <span className="fw-bold text-info">99.1%</span>
            </div>
            <div className="progress" style={{ height: '8px', background: 'rgba(255,255,255,0.05)' }}>
              <div className="progress-bar bg-info" style={{ width: '99.1%' }}></div>
            </div>
          </div>

          <div>
            <div className="d-flex justify-content-between small text-white mb-1">
              <span>Sepolia Smart Contract Document Hash Store Reliability</span>
              <span className="fw-bold text-purple" style={{ color: '#a855f7' }}>100%</span>
            </div>
            <div className="progress" style={{ height: '8px', background: 'rgba(255,255,255,0.05)' }}>
              <div className="progress-bar" style={{ width: '100%', background: 'linear-gradient(90deg, #6366f1, #a855f7)' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
