import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Login from './components/Login';
import LoadingState from './components/LoadingState';
import Home from './pages/Home';
import Results from './pages/Results';
import GitHubService from '../../services/github.service.js';

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  // Auth state
  const [token, setToken] = useState(null);
  const [userData, setUserData] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Analysis state
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [apiError, setApiError] = useState(null);

  // Initialize auth
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = await window.electronAPI.getToken();
        if (storedToken) {
          setToken(storedToken);
          await fetchProfile(storedToken);
        }
      } catch (err) {
        console.warn('Auth init failed:', err.message);
      } finally {
        setAuthLoading(false);
      }
    };

    initAuth();

    window.electronAPI.onAuthSuccess((newToken) => {
      setToken(newToken);
      fetchProfile(newToken);
    });

    window.electronAPI.onAuthLogout(() => {
      setToken(null);
      setUserData(null);
      setAuthLoading(false);
      setAnalysisResult(null);
      setApiError(null);
      navigate('/');
    });
  }, []);

  const fetchProfile = async (authToken) => {
    try {
      const service = new GitHubService(authToken);
      const profile = await service.getUserProfile();
      setUserData(profile);
    } catch (err) {
      console.warn('Profile fetch failed:', err.message);
    }
  };

  // --- Analysis handler ---
  const handleAnalyze = async (username, jobDescription) => {
    setAnalyzing(true);
    setApiError(null);
    setAnalysisResult(null);
    navigate('/');

    try {
      const response = await window.electronAPI.analyzeJobFit(username, jobDescription);

      if (response.success) {
        setAnalysisResult(response.data);
        setAnalyzing(false);
        navigate('/results');
      } else {
        // Parse specific error types for user-friendly messages
        const errMsg = response.error || 'Analysis failed.';
        setApiError(friendlyError(errMsg));
        setAnalyzing(false);
      }
    } catch (err) {
      setApiError(friendlyError(err.message));
      setAnalyzing(false);
    }
  };

  const handleReset = () => {
    setAnalysisResult(null);
    setApiError(null);
    navigate('/');
  };

  const handleLogout = () => {
    window.electronAPI.logout();
  };

  // --- Auth loading ---
  if (authLoading) {
    return (
      <div className="app-shell" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div className="loading-container" style={{ paddingTop: '40vh' }}>
          <div className="loading-spinner" />
          <p style={{ color: 'var(--gp-text-muted)', fontSize: '0.9rem' }}>Loading GitMatch...</p>
        </div>
      </div>
    );
  }

  // --- Login screen ---
  if (!token) {
    return <Login onLogin={() => window.electronAPI.login()} error={apiError} />;
  }

  // --- Authenticated shell ---
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header-brand">
          <img src="./logo.png" alt="GitMatch" />
          <h1>GitMatch</h1>
          <span>Job Fit Analyzer</span>
        </div>
        <div className="app-header-user">
          {userData && (
            <>
              <span className="app-header-username">@{userData.login}</span>
              <img
                src={userData.avatar_url}
                alt={userData.name || userData.login}
                className="app-header-avatar"
              />
            </>
          )}
          <button className="btn-header-logout" onClick={handleLogout} id="btn-logout">
            Logout
          </button>
        </div>
      </header>

      <main className="app-content">
        {analyzing ? (
          <LoadingState />
        ) : (
          <Routes>
            <Route
              path="/"
              element={
                <Home
                  defaultUsername={userData?.login || ''}
                  onAnalyze={handleAnalyze}
                  loading={analyzing}
                  apiError={apiError}
                />
              }
            />
            <Route
              path="/results"
              element={
                analysisResult
                  ? <Results data={analysisResult} onBack={handleReset} />
                  : <Home
                      defaultUsername={userData?.login || ''}
                      onAnalyze={handleAnalyze}
                      loading={analyzing}
                      apiError={apiError}
                    />
              }
            />
          </Routes>
        )}
      </main>
    </div>
  );
}

/**
 * Map raw error messages to user-friendly descriptions.
 */
function friendlyError(msg) {
  if (!msg) return 'An unexpected error occurred. Please try again.';
  const lower = msg.toLowerCase();

  if (lower.includes('not found') || lower.includes('404')) {
    return 'GitHub user not found. Please check the username and try again.';
  }
  if (lower.includes('rate limit') || lower.includes('403')) {
    return 'GitHub API rate limit exceeded. Please wait a few minutes and try again.';
  }
  if (lower.includes('network') || lower.includes('enotfound') || lower.includes('econnrefused')) {
    return 'Network error. Please check your internet connection.';
  }
  if (lower.includes('username is required')) {
    return 'Please enter a valid GitHub username.';
  }
  if (lower.includes('job description is required')) {
    return 'Please paste a job description to analyze against.';
  }
  return msg;
}

export default App;
