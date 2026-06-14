import React from 'react';
import { AlertTriangle } from 'lucide-react';

const WeaknessesCard = ({ weaknesses }) => {
  return (
    <div className="result-card">
      <div className="result-card-header">
        <AlertTriangle size={16} style={{ color: 'var(--gp-warning)' }} />
        <span className="result-card-title">Areas to Improve</span>
      </div>
      {weaknesses && weaknesses.length > 0 ? (
        <div className="insight-list">
          {weaknesses.map((item, i) => (
            <div key={i} className="insight-row">
              <AlertTriangle size={14} className="insight-row-icon" style={{ color: 'var(--gp-warning)' }} />
              <span>{item}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="skills-empty">No weaknesses identified.</p>
      )}
    </div>
  );
};

export default WeaknessesCard;
