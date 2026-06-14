import React, { useState, useEffect } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';

const STEPS = [
  'Fetching repositories...',
  'Extracting skills from profile...',
  'Parsing job description...',
  'Calculating match score...',
];

const LoadingState = () => {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => {
        if (prev < STEPS.length - 1) return prev + 1;
        return prev;
      });
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="loading-page">
      <div className="loading-container">
        <div className="loading-spinner" />
        <h3 className="loading-title">Analyzing GitHub Profile...</h3>

        <div className="loading-steps">
          {STEPS.map((step, i) => {
            let className = 'loading-step ';
            let icon;

            if (i < activeStep) {
              className += 'loading-step-done';
              icon = <CheckCircle2 size={16} />;
            } else if (i === activeStep) {
              className += 'loading-step-active';
              icon = <div className="loading-step-spinner" />;
            } else {
              className += 'loading-step-pending';
              icon = <Loader2 size={16} style={{ opacity: 0.3 }} />;
            }

            return (
              <div key={i} className={className} style={{ animationDelay: `${i * 80}ms` }}>
                {icon}
                <span>{step}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LoadingState;
