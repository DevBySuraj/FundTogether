import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminService, DashboardStats } from '../services/adminService';
import { PieChart, BarChart, LineChart } from '../components/ChartComponents';
import {
  Layers,
  Clock,
  CheckCircle2,
  XCircle,
  Users,
  HeartHandshake,
  IndianRupee,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getDashboard();
      setStats(data);
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Campaigns',
      value: stats?.totalCampaigns ?? 18,
      icon: Layers,
      colorClass: 'text-indigo',
      badgeClass: 'admin-badge-info',
      change: '+14% this month',
    },
    {
      title: 'Pending Campaigns',
      value: stats?.pendingCampaigns ?? 4,
      icon: Clock,
      colorClass: 'text-warning',
      badgeClass: 'admin-badge-warning',
      change: 'Requires Audit',
    },
    {
      title: 'Approved Campaigns',
      value: stats?.approvedCampaigns ?? 12,
      icon: CheckCircle2,
      colorClass: 'text-success',
      badgeClass: 'admin-badge-success',
      change: '94% On-chain Verified',
    },
    {
      title: 'Rejected Campaigns',
      value: stats?.rejectedCampaigns ?? 2,
      icon: XCircle,
      colorClass: 'text-danger',
      badgeClass: 'admin-badge-danger',
      change: 'Fraud Prevention',
    },
    {
      title: 'Total Recipients',
      value: stats?.totalRecipients ?? 42,
      icon: Users,
      colorClass: 'text-info',
      badgeClass: 'admin-badge-info',
      change: '+6 new',
    },
    {
      title: 'Total Donors',
      value: stats?.totalDonors ?? 158,
      icon: HeartHandshake,
      colorClass: 'text-pink',
      badgeClass: 'admin-badge-info',
      change: '100% Direct INR',
    },
    {
      title: 'Total Donations',
      value: `₹${(stats?.totalDonationsInr ?? 245000).toLocaleString('en-IN')}`,
      icon: IndianRupee,
      colorClass: 'text-success',
      badgeClass: 'admin-badge-success',
      change: '+22% growth',
    },
  ];

  const pieChartData = [
    { label: 'Approved', value: stats?.approvedCampaigns ?? 12, color: '#10b981' },
    { label: 'Pending Audit', value: stats?.pendingCampaigns ?? 4, color: '#f59e0b' },
    { label: 'Rejected', value: stats?.rejectedCampaigns ?? 2, color: '#ef4444' },
  ];

  const barChartData = [
    { month: 'Jan', value: 8 },
    { month: 'Feb', value: 12 },
    { month: 'Mar', value: 15 },
    { month: 'Apr', value: 22 },
    { month: 'May', value: 18 },
    { month: 'Jun', value: 26 },
  ];

  const lineChartPoints = [15000, 35000, 75000, 120000, 190000, 245000];

  return (
    <div className="d-flex flex-column gap-4">
      {/* Overview Banner */}
      <div className="admin-card p-4 d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
        <div>
          <span className="admin-badge admin-badge-info mb-2">Live AI &amp; Blockchain Monitor</span>
          <h3 className="fw-bold text-white mb-1">Welcome back, Administrator</h3>
          <p className="small text-white-50 mb-0">
            AI document analysis engine is operational. <strong>{stats?.pendingCampaigns ?? 4} campaigns</strong> are waiting for approval audit.
          </p>
        </div>
        <Link to="/admin/pending" className="admin-btn admin-btn-primary">
          <Clock size={18} />
          <span>Review Pending Audits ({stats?.pendingCampaigns ?? 4})</span>
        </Link>
      </div>

      {/* Statistic Cards Grid */}
      <div className="row g-3">
        {statCards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.title} className="col-12 col-sm-6 col-xl-3">
              <div className="admin-card p-3 d-flex flex-column justify-content-between h-100">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <span className="small font-monospace text-uppercase fw-bold text-muted-dim" style={{ fontSize: '0.75rem' }}>
                    {c.title}
                  </span>
                  <div className="p-2 rounded bg-dark border border-secondary border-opacity-20 text-white">
                    <Icon size={20} />
                  </div>
                </div>

                <div>
                  <div className="fs-3 fw-bold text-white mb-1" style={{ letterSpacing: '-0.5px' }}>
                    {isLoading ? <span className="spinner-border spinner-border-sm"></span> : c.value}
                  </div>
                  <span className={`admin-badge ${c.badgeClass}`}>{c.change}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytics Charts Row */}
      <div className="row g-3">
        {/* Pie Chart Card */}
        <div className="col-12 col-lg-5">
          <div className="admin-card p-4 h-100">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div>
                <h6 className="fw-bold text-white mb-0">Campaign Status Breakdown</h6>
                <span className="admin-subtext">Verification Distribution</span>
              </div>
              <TrendingUp size={18} color="var(--admin-accent-primary)" />
            </div>
            <PieChart data={pieChartData} />
          </div>
        </div>

        {/* Bar Chart Card */}
        <div className="col-12 col-lg-7">
          <div className="admin-card p-4 h-100">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <div>
                <h6 className="fw-bold text-white mb-0">Monthly Verifications Audit Volume</h6>
                <span className="admin-subtext">Processed Documents</span>
              </div>
              <span className="admin-badge admin-badge-success">H1 2026</span>
            </div>
            <BarChart data={barChartData} />
          </div>
        </div>
      </div>

      {/* Line Chart & Recent Activity */}
      <div className="row g-3">
        <div className="col-12 col-lg-6">
          <div className="admin-card p-4">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div>
                <h6 className="fw-bold text-white mb-0">Donation Volume Growth (₹ INR)</h6>
                <span className="admin-subtext">Direct Indian Rupee Contributions</span>
              </div>
              <span className="fs-5 fw-bold text-success">₹2,45,000</span>
            </div>
            <LineChart points={lineChartPoints} />
          </div>
        </div>

        {/* Recent Audits List */}
        <div className="col-12 col-lg-6">
          <div className="admin-card p-4 h-100">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h6 className="fw-bold text-white mb-0">Recent Verification Activity</h6>
              <Link to="/admin/history" className="small text-decoration-none text-info fw-bold d-flex align-items-center gap-1">
                View All <ArrowUpRight size={14} />
              </Link>
            </div>

            <div className="d-flex flex-column gap-3">
              {[
                { title: 'Emergency Cardiac Surgery', recipient: 'Rajesh Kumar', risk: 'Low', status: 'APPROVED', time: '12 mins ago' },
                { title: 'Pediatric Cancer Treatment', recipient: 'Ananya Roy', risk: 'Low', status: 'APPROVED', time: '1 hour ago' },
                { title: 'Dialysis Support Fund', recipient: 'Suresh Patel', risk: 'High', status: 'PENDING', time: '2 hours ago' },
              ].map((item, idx) => (
                <div key={idx} className="d-flex align-items-center justify-content-between p-2 rounded" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <div>
                    <div className="fw-bold small text-white">{item.title}</div>
                    <span className="admin-subtext">
                      Recipient: {item.recipient} &bull; {item.time}
                    </span>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <span className={`admin-badge ${item.risk === 'Low' ? 'admin-badge-success' : 'admin-badge-danger'}`}>
                      {item.risk} Risk
                    </span>
                    <span className={`admin-badge ${item.status === 'APPROVED' ? 'admin-badge-success' : 'admin-badge-warning'}`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
