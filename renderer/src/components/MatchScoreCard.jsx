import React from 'react';

const getScoreTier = (score) => {
  if (score >= 80) return { tier: 'excellent', label: 'Excellent Match' };
  if (score >= 60) return { tier: 'good', label: 'Good Match' };
  if (score >= 40) return { tier: 'fair', label: 'Fair Match' };
  return { tier: 'low', label: 'Low Match' };
};

const tierColors = {
  excellent: 'var(--gp-success)',
  good: 'var(--gp-info)',
  fair: 'var(--gp-warning)',
  low: 'var(--gp-danger)',
};

const MatchScoreCard = ({ score, role, experience, matchedCount, missingCount, totalJdSkills }) => {
  const { tier } = getScoreTier(score);
  const color = tierColors[tier];

  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className={`score-card score-${tier}`}>
      {/* Gauge */}
      <div className="score-gauge">
        <svg width="130" height="130" viewBox="0 0 130 130">
          <circle className="score-gauge-bg" cx="65" cy="65" r={radius} />
          <circle
            className="score-gauge-fill"
            cx="65" cy="65" r={radius}
            stroke={color}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="score-gauge-label">
          <span className="score-gauge-value" style={{ color }}>
            {score}<span className="score-gauge-pct" style={{ color }}>%</span>
          </span>
          <span className="score-gauge-sublabel">Match</span>
        </div>
      </div>

      {/* Info */}
      <div className="score-info">
        <div className="score-info-role">{role || 'Job Role'}</div>
        <div className="score-info-experience">
          {experience && experience !== 'Not Specified'
            ? `Experience: ${experience}`
            : 'Experience not specified'}
        </div>
        <div className="score-stats-row">
          <div className="score-stat">
            <span className="score-stat-value c-success">{matchedCount}</span>
            <span className="score-stat-label">Matched</span>
          </div>
          <div className="score-stat">
            <span className="score-stat-value c-danger">{missingCount}</span>
            <span className="score-stat-label">Missing</span>
          </div>
          <div className="score-stat">
            <span className="score-stat-value c-info">{totalJdSkills}</span>
            <span className="score-stat-label">Required</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchScoreCard;
