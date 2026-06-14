import React from 'react';
import { TrendingUp, Award } from 'lucide-react';

const StrengthsCard = ({ strengths }) => {
  return (
    <div className="result-card">
      <div className="result-card-header">
        <TrendingUp size={16} style={{ color: 'var(--gp-success)' }} />
        <span className="result-card-title">Strengths</span>
      </div>
      {strengths && strengths.length > 0 ? (
        <div className="insight-list">
          {strengths.map((item, i) => (
            <div key={i} className="insight-row">
              <Award size={14} className="insight-row-icon" style={{ color: 'var(--gp-success)' }} />
              <span>{item}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="skills-empty">No specific strengths identified.</p>
      )}
    </div>
  );
};

export default StrengthsCard;
