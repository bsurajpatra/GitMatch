import React from 'react';
import { Github, ShieldCheck } from 'lucide-react';

const Login = ({ onLogin, error }) => {
  return (
    <div className="login-page">
      <div className="login-card">
        {/* Brand */}
        <div className="login-brand">
          <div className="login-logo">
            <img src="./logo.png" alt="GitMatch Logo" />
          </div>
          <span className="login-brand-name">
            Git<span>Match</span>
          </span>
        </div>

        {/* Headline */}
        <h1 className="login-headline">
          Score your<br />
          GitHub<br />
          <em>profile.</em>
        </h1>

        <p className="login-subtitle">
          Connect with GitHub OAuth to analyze any public profile
          against a job description and get a precise match score.
        </p>

        {error && <div className="login-error">{error}</div>}

        {/* Features */}
        <div className="login-features">
          <div className="login-feature">
            <span className="login-feature-dot" />
            Skill Matching
          </div>
          <div className="login-feature">
            <span className="login-feature-dot" />
            Fit Analysis
          </div>
          <div className="login-feature">
            <span className="login-feature-dot" />
            Dep. Scan
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={onLogin}
          className="btn-github-login"
          id="btn-github-login"
        >
          <Github size={18} />
          Sign in with GitHub
        </button>

        <div className="login-footer">
          <ShieldCheck size={12} />
          <span>Read-only OAuth · No data stored</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
