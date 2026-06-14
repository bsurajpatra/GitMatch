import React from 'react';
import { Zap } from 'lucide-react';

const AnalyzeButton = ({ onClick, disabled, loading }) => {
  return (
    <button
      type="submit"
      className="btn-analyze"
      onClick={onClick}
      disabled={disabled || loading}
      id="btn-start-analysis"
    >
      {loading ? (
        <>
          <div className="btn-analyze-loading" />
          Analyzing...
        </>
      ) : (
        <>
          <Zap size={18} />
          Analyze Job Fit
        </>
      )}
    </button>
  );
};

export default AnalyzeButton;
