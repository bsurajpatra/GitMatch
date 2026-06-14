import React from 'react';
import { XCircle } from 'lucide-react';

const MissingSkills = ({ skills }) => {
  return (
    <div className="result-card">
      <div className="result-card-header">
        <XCircle size={16} style={{ color: 'var(--gp-danger)' }} />
        <span className="result-card-title">Missing Skills</span>
        <span className="result-card-count">{skills?.length || 0}</span>
      </div>
      {skills && skills.length > 0 ? (
        <div className="skills-badge-list">
          {skills.map((skill, i) => (
            <span key={i} className="skill-pill skill-pill-missing">
              <span className="skill-pill-icon">✗</span>
              {skill}
            </span>
          ))}
        </div>
      ) : (
        <p className="skills-empty">No skill gaps — great coverage!</p>
      )}
    </div>
  );
};

export default MissingSkills;
