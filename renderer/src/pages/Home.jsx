import React, { useState } from 'react';
import { AlertCircle, AtSign, Zap } from 'lucide-react';
import JDInput from '../components/JDInput';
import AnalyzeButton from '../components/AnalyzeButton';

const Home = ({ defaultUsername, userData, onAnalyze, loading, apiError }) => {
  const [username, setUsername] = useState(defaultUsername || '');
  const [jobDescription, setJobDescription] = useState('');
  const [errors, setErrors] = useState({});

  const validate = (overrideUsername) => {
    const newErrors = {};
    const trimmedUser = (overrideUsername ?? username).trim();
    const trimmedJd = jobDescription.trim();

    if (!trimmedUser) {
      newErrors.username = 'GitHub username is required.';
    } else if (!/^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/.test(trimmedUser)) {
      newErrors.username = 'Invalid GitHub username format.';
    }

    if (!trimmedJd) {
      newErrors.jd = 'Job description is required.';
    } else if (trimmedJd.length < 20) {
      newErrors.jd = 'Job description is too short. Add more detail.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onAnalyze(username.trim(), jobDescription.trim());
    }
  };

  // Fill username field with the logged-in user's GitHub login
  const handleUseMyAccount = () => {
    const myLogin = userData?.login || '';
    if (myLogin) setUsername(myLogin);
  };

  return (
    <div className="home-page">
      <div className="home-container">

        {/* Header */}
        <div className="home-header">
          <div className="home-tag">Single Candidate</div>
          <h2 className="home-title">Evaluate a GitHub Profile</h2>
          <p className="home-desc">
            Enter a GitHub username and paste a job description to calculate a precise match score.
          </p>
        </div>

        {/* Form card */}
        <div className="home-form-card">
          {apiError && (
            <div className="form-api-error">
              <AlertCircle size={15} style={{ flexShrink: 0, marginTop: '1px' }} />
              <span>{apiError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Username + "Use my account" inline */}
            <div className="form-group">
              <div className="form-label-row">
                <label htmlFor="github-username" className="form-label" style={{ margin: 0 }}>
                  <AtSign size={13} className="form-label-icon" />
                  GitHub Username
                </label>
                {userData?.login && (
                  <button
                    type="button"
                    className="btn-use-mine"
                    onClick={handleUseMyAccount}
                    title={`Fill with @${userData.login}`}
                    id="btn-use-my-account"
                  >
                    <Zap size={11} />
                    Use @{userData.login}
                  </button>
                )}
              </div>
              <input
                id="github-username"
                type="text"
                className={`form-input ${errors.username ? 'form-input-error' : ''}`}
                placeholder="e.g. octocat"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="off"
                spellCheck="false"
              />
              {errors.username ? (
                <p className="form-error-text">
                  <AlertCircle size={12} />
                  {errors.username}
                </p>
              ) : (
                <p className="form-hint">Public profile and repositories will be analyzed</p>
              )}
            </div>

            <JDInput
              value={jobDescription}
              onChange={setJobDescription}
              error={errors.jd}
            />

            <div className="form-divider" />

            <AnalyzeButton loading={loading} />
          </form>
        </div>
      </div>
    </div>
  );
};

export default Home;
