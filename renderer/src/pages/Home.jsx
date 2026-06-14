import React, { useState } from 'react';
import { Sparkles, AlertCircle } from 'lucide-react';
import UsernameInput from '../components/UsernameInput';
import JDInput from '../components/JDInput';
import AnalyzeButton from '../components/AnalyzeButton';

const Home = ({ defaultUsername, onAnalyze, loading, apiError }) => {
  const [username, setUsername] = useState(defaultUsername || '');
  const [jobDescription, setJobDescription] = useState('');
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    const trimmedUser = username.trim();
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

  return (
    <div className="home-page">
      <div className="home-container">
        {/* Hero */}
        <div className="home-hero">
          <div className="home-hero-badge">
            <Sparkles size={13} />
            Job Fit Analyzer
          </div>
          <h2>Assess candidate-job alignment in seconds</h2>
          <p>
            Enter a GitHub username and paste a job description.
            GitMatch will extract skills and calculate a match score.
          </p>
        </div>

        {/* Form */}
        <div className="home-form-card">
          {apiError && (
            <div className="form-api-error">
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '1px' }} />
              <span>{apiError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <UsernameInput
              value={username}
              onChange={setUsername}
              error={errors.username}
            />

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
