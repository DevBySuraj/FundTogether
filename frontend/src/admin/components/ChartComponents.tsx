import React from 'react';

// Pure SVG Donut/Pie Chart
interface PieChartProps {
  data: { label: string; value: number; color: string }[];
}

export const PieChart: React.FC<PieChartProps> = ({ data }) => {
  const total = data.reduce((acc, d) => acc + d.value, 0) || 1;
  let accumulatedAngle = 0;

  return (
    <div className="d-flex flex-column flex-sm-row align-items-center justify-content-around gap-4 py-2">
      <svg width="160" height="160" viewBox="0 0 42 42" className="donut">
        <circle cx="21" cy="21" r="15.91549430918954" fill="#0f172a" stroke="rgba(255,255,255,0.05)" strokeWidth="5"></circle>
        {data.map((item) => {
          const percentage = (item.value / total) * 100;
          const strokeDasharray = `${percentage} ${100 - percentage}`;
          const strokeDashoffset = 100 - accumulatedAngle + 25;
          accumulatedAngle += percentage;

          return (
            <circle
              key={item.label}
              cx="21"
              cy="21"
              r="15.91549430918954"
              fill="transparent"
              stroke={item.color}
              strokeWidth="5"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              style={{ transition: 'all 0.6s ease' }}
            />
          );
        })}
      </svg>

      <div className="d-flex flex-column gap-2" style={{ minWidth: '130px' }}>
        {data.map((item) => (
          <div key={item.label} className="d-flex align-items-center justify-content-between gap-3">
            <div className="d-flex align-items-center gap-2">
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: item.color, display: 'inline-block' }}></span>
              <span className="small text-white-50" style={{ fontSize: '0.82rem' }}>{item.label}</span>
            </div>
            <span className="fw-bold text-white small">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Pure SVG Bar Chart for Monthly Verifications
interface BarChartProps {
  data: { month: string; value: number }[];
}

export const BarChart: React.FC<BarChartProps> = ({ data }) => {
  const maxVal = Math.max(...data.map(d => d.value), 10);

  return (
    <div className="d-flex align-items-end justify-content-between gap-2 pt-4 px-2" style={{ height: '180px' }}>
      {data.map((item) => {
        const heightPct = (item.value / maxVal) * 100;
        return (
          <div key={item.month} className="d-flex flex-column align-items-center flex-fill" style={{ height: '100%' }}>
            <div className="w-100 d-flex align-items-end justify-content-center flex-fill mb-2">
              <div
                title={`${item.month}: ${item.value}`}
                style={{
                  width: '65%',
                  height: `${heightPct}%`,
                  background: 'linear-gradient(180deg, #6366f1 0%, #a855f7 100%)',
                  borderRadius: '6px 6px 0 0',
                  transition: 'height 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                }}
              />
            </div>
            <span className="small text-white-50" style={{ fontSize: '0.75rem', fontWeight: 600 }}>{item.month}</span>
          </div>
        );
      })}
    </div>
  );
};

// Pure SVG Line Chart for Financial Donations Growth
interface LineChartProps {
  points: number[];
}

export const LineChart: React.FC<LineChartProps> = ({ points }) => {
  const maxVal = Math.max(...points, 10);
  const minVal = Math.min(...points, 0);
  const range = maxVal - minVal || 1;

  const width = 400;
  const height = 150;

  const pathD = points.reduce((acc, val, i) => {
    const x = (i / (points.length - 1)) * width;
    const y = height - ((val - minVal) / range) * (height - 30) - 15;
    return i === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  return (
    <div className="w-100 pt-2">
      <svg width="100%" height="150" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id="lineGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={`${pathD} L ${width} ${height} L 0 ${height} Z`} fill="url(#lineGrad)" />
        <path d={pathD} fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
      </svg>
    </div>
  );
};
