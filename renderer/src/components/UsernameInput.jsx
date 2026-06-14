import React from 'react';
import { AtSign, AlertCircle } from 'lucide-react';

const UsernameInput = ({ value, onChange, error }) => {
  return (
    <div className="form-group">
      <label htmlFor="github-username" className="form-label">
        <AtSign size={14} className="form-label-icon" />
        GitHub Username
      </label>
      <input
        id="github-username"
        type="text"
        className={`form-input ${error ? 'form-input-error' : ''}`}
        placeholder="e.g. octocat"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="off"
        spellCheck="false"
      />
      {error ? (
        <p className="form-error-text">
          <AlertCircle size={12} />
          {error}
        </p>
      ) : (
        <p className="form-hint">Public profile and repositories will be analyzed</p>
      )}
    </div>
  );
};

export default UsernameInput;
