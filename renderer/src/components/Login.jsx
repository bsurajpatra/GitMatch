import React from 'react';
import { Github, Zap, Target, ShieldCheck } from 'lucide-react';

const Login = ({ onLogin, error }) => {
  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <img src="./logo.png" alt="GitMatch Logo" />
        </div>

        <h1 className="login-title">GitMatch</h1>
        <p className="login-subtitle">GitHub Job Fit Analyzer</p>

        {error && <div className="login-error">{error}</div>}

        <div className="login-features">
          <div className="login-feature">
            <Target size={20} style={{ color: 'var(--gp-accent)' }} />
            <span className="login-feature-label">Skill Matching</span>
          </div>
          <div className="login-feature">
            <Zap size={20} style={{ color: 'var(--gp-warning)' }} />
            <span className="login-feature-label">Fit Analysis</span>
          </div>
        </div>

        <button
          onClick={onLogin}
          className="btn-github-login"
          id="btn-github-login"
        >
          <Github size={20} />
          Sign in with GitHub
        </button>

        <div className="login-footer">
          <ShieldCheck size={13} />
          <span>Secure OAuth Authentication</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
