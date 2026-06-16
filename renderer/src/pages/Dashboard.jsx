import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, User, TrendingUp, Star,
  BarChart2, Clock, ChevronRight, Plus,
} from 'lucide-react';

// ─── Helpers ────────────────────────────────────────────────────────────────
function getGreeting() {
  const h = new Date().getHours();
  if (h >= 5  && h < 12) return 'Good morning';
  if (h >= 12 && h < 17) return 'Good afternoon';
  if (h >= 17 && h < 22) return 'Good evening';
  return 'Good night';
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

function getScoreColor(score) {
  if (score >= 80) return 'var(--success-text)';
  if (score >= 60) return 'var(--info-text)';
  if (score >= 40) return 'var(--warning-text)';
  return 'var(--danger-text)';
}

// ─── Sub-components ──────────────────────────────────────────────────────────
function StatCard({ value, label, color }) {
  return (
    <div className="dash-stat-card">
      <div className="dash-stat-value" style={{ color }}>{value}</div>
      <div className="dash-stat-label">{label}</div>
    </div>
  );
}

function ScreeningCard({ report, onOpen }) {
  const top = report.allRankings?.[0];
  return (
    <button className="dash-recent-card" onClick={onOpen}>
      <div className="dash-recent-card-left">
        <div className="dash-recent-card-title">
          {report.name || 'Untitled Screening'}
        </div>
        <div className="dash-recent-card-meta">
          {report.stats?.successfulAnalyses ?? 0} candidates ·{' '}
          avg {report.stats?.averageScore ?? 0}% ·{' '}
          {formatDate(report.date)}
        </div>
      </div>
      <div className="dash-recent-card-right">
        {top && (
          <span
            className="dash-recent-score"
            style={{ color: getScoreColor(top.overallScore || 0) }}
          >
            #{top.rank} {top.overallScore}%
          </span>
        )}
        <ChevronRight size={14} className="dash-recent-arrow" />
      </div>
    </button>
  );
}

function CandidateRow({ report, onOpen }) {
  const score = report.result?.overallScore ?? 0;
  return (
    <button className="dash-candidate-row" onClick={onOpen}>
      {report.result?.profile?.avatar_url && (
        <img
          src={report.result.profile.avatar_url}
          alt={report.username}
          className="dash-candidate-avatar"
        />
      )}
      <div className="dash-candidate-info">
        <span className="dash-candidate-name">
          {report.result?.profile?.name || report.username}
        </span>
        <span className="dash-candidate-meta">@{report.username} · {formatDate(report.date)}</span>
      </div>
      <span className="dash-candidate-score" style={{ color: getScoreColor(score) }}>
        {score}%
      </span>
    </button>
  );
}

// ─── Empty State ─────────────────────────────────────────────────────────────
function EmptyDashboard({ userData, onBulk, onSingle }) {
  const name = userData?.name?.split(' ')[0] || userData?.login || 'there';
  return (
    <div className="dash-empty">
      <div className="dash-empty-icon">
        <Users size={32} />
      </div>
      <h2 className="dash-empty-title">Welcome, {name}</h2>
      <p className="dash-empty-desc">
        Start screening GitHub candidates against job descriptions. Get ranked results in minutes.
      </p>
      <div className="dash-empty-actions">
        <button className="btn-quick-primary" onClick={onBulk}>
          <Users size={16} />
          Start Bulk Screening
        </button>
        <button className="btn-quick-secondary" onClick={onSingle}>
          <User size={15} />
          Analyze a Candidate
        </button>
      </div>
    </div>
  );
}

// ─── Dashboard ───────────────────────────────────────────────────────────────
export default function Dashboard({ userData, reports, onBulkReopen, onSingleReopen }) {
  const navigate = useNavigate();
  const { bulk = [], single = [] } = reports;

  const hasActivity = bulk.length > 0 || single.length > 0;

  // Compute dashboard stats
  const totalScreened =
    bulk.reduce((acc, r) => acc + (r.stats?.successfulAnalyses || 0), 0) + single.length;

  const allScores = [
    ...bulk.flatMap(r => (r.allRankings || []).map(c => c.overallScore || 0)),
    ...single.map(r => r.result?.overallScore || 0),
  ];
  const avgScore = allScores.length
    ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)
    : 0;

  const shortlisted = bulk.reduce((acc, r) => acc + (r.stats?.shortlistedCandidates || 0), 0);

  const recentBulk   = bulk.slice(0, 4);
  const recentSingle = single.slice(0, 5);

  const firstName = userData?.name?.split(' ')[0] || userData?.login || 'there';

  if (!hasActivity) {
    return (
      <div className="dashboard-page">
        <EmptyDashboard
          userData={userData}
          onBulk={() => navigate('/bulk')}
          onSingle={() => navigate('/candidate')}
        />
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="dash-header">
        <div>
          <h1 className="dash-greeting">
            {getGreeting()}, {firstName}.
          </h1>
          <p className="dash-tagline">GitHub-Based Candidate Screening</p>
        </div>
        <span className="dash-date">
          {new Date().toLocaleDateString('en-GB', {
            weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
          })}
        </span>
      </div>

      {/* ── Stats ───────────────────────────────────────────── */}
      <div className="dash-stats">
        <StatCard
          value={totalScreened}
          label="Total Screened"
          color="var(--info-text)"
        />
        <StatCard
          value={avgScore ? `${avgScore}%` : '—'}
          label="Avg Match Score"
          color="var(--purple-text)"
        />
        <StatCard
          value={shortlisted}
          label="Shortlisted"
          color="var(--success-text)"
        />
        <StatCard
          value={bulk.length}
          label="Screenings Run"
          color="var(--warning-text)"
        />
      </div>

      {/* ── Quick Actions ────────────────────────────────────── */}
      <div className="dash-actions">
        <button
          className="btn-quick-primary"
          onClick={() => navigate('/bulk')}
          id="btn-dash-bulk"
        >
          <Plus size={15} />
          New Bulk Screening
        </button>
        <button
          className="btn-quick-secondary"
          onClick={() => navigate('/candidate')}
          id="btn-dash-single"
        >
          <User size={14} />
          Analyze a Candidate
        </button>
      </div>

      {/* ── Recent Activity ──────────────────────────────────── */}
      <div className="dash-recents">
        {/* Left: recent bulk screenings */}
        <div className="dash-recents-col">
          <div className="dash-recents-header">
            <span className="dash-recents-title">
              <Users size={13} /> Recent Screenings
            </span>
            {bulk.length > 4 && (
              <button
                className="dash-view-all"
                onClick={() => navigate('/reports')}
              >
                View all →
              </button>
            )}
          </div>
          {recentBulk.length > 0 ? (
            <div className="dash-recent-list">
              {recentBulk.map(r => (
                <ScreeningCard
                  key={r.id}
                  report={r}
                  onOpen={() => onBulkReopen(r)}
                />
              ))}
            </div>
          ) : (
            <p className="dash-recents-empty">No bulk screenings yet.</p>
          )}
        </div>

        {/* Right: recent single analyses */}
        <div className="dash-recents-col">
          <div className="dash-recents-header">
            <span className="dash-recents-title">
              <User size={13} /> Recent Analyses
            </span>
            {single.length > 5 && (
              <button
                className="dash-view-all"
                onClick={() => navigate('/reports')}
              >
                View all →
              </button>
            )}
          </div>
          {recentSingle.length > 0 ? (
            <div className="dash-recent-list">
              {recentSingle.map(r => (
                <CandidateRow
                  key={r.id}
                  report={r}
                  onOpen={() => onSingleReopen(r)}
                />
              ))}
            </div>
          ) : (
            <p className="dash-recents-empty">No single analyses yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
