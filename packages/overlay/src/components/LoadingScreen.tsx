import React from 'react';
import './LoadingScreen.css';

interface LoadingScreenProps {
  message?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = 'Connecting to Elite Locker...' 
}) => {
  return (
    <div className="loading-screen">
      <div className="loading-content">
        <div className="loading-spinner">
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
        </div>
        
        <h2 className="loading-title">Elite Locker</h2>
        <p className="loading-message">{message}</p>
        
        <div className="loading-dots">
          <span className="dot"></span>
          <span className="dot"></span>
          <span className="dot"></span>
        </div>
      </div>
    </div>
  );
};
