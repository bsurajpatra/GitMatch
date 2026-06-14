import React from 'react';
import { CheckCircle2 } from 'lucide-react';

const MatchedSkills = ({ skills }) => {
  return (
    <div className="result-card">
      <div className="result-card-header">
        <CheckCircle2 size={16} style={{ color: 'var(--gp-success)' }} />
        <span className="result-card-title">Matched Skills</span>
        <span className="result-card-count">{skills?.length || 0}</span>
      </div>
      {skills && skills.length > 0 ? (
        <div className="skills-badge-list">
          {skills.map((skill, i) => (
            <span key={i} className="skill-pill skill-pill-matched">
              <span className="skill-pill-icon">✓</span>
              {skill}
            </span>
          ))}
        </div>
      ) : (
        <p className="skills-empty">No matching skills found</p>
      )}
    </div>
  );
};

export default MatchedSkills;
