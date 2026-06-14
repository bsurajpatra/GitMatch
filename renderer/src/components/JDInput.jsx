import React from 'react';
import { FileText, AlertCircle } from 'lucide-react';

const JDInput = ({ value, onChange, error }) => {
  return (
    <div className="form-group">
      <label htmlFor="job-description" className="form-label">
        <FileText size={14} className="form-label-icon" />
        Job Description
      </label>
      <textarea
        id="job-description"
        className={`form-input form-textarea ${error ? 'form-input-error' : ''}`}
        placeholder={"Paste the full job description here...\n\nExample:\nSenior Full Stack Developer\n\nRequired Skills:\n• React, Node.js, TypeScript\n• MongoDB, Docker, AWS\n\nExperience: 3+ years"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        spellCheck="false"
      />
      {error ? (
        <p className="form-error-text">
          <AlertCircle size={12} />
          {error}
        </p>
      ) : (
        <p className="form-hint">Include required skills, role title, and experience level</p>
      )}
    </div>
  );
};

export default JDInput;
