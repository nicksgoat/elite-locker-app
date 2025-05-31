import { OverlayTheme } from '@elite-locker/shared-types';
import React from 'react';
import './ConnectionStatus.css';

interface ConnectionStatusProps {
  isConnected: boolean;
  theme: OverlayTheme;
  lastUpdate?: Date;
  error?: string;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  isConnected,
  theme,
  lastUpdate,
  error,
}) => {
  const getStatusColor = () => {
    if (error) return '#ff4444';
    return isConnected ? '#44ff44' : '#ffaa44';
  };

  const getStatusText = () => {
    if (error) return 'Error';
    return isConnected ? 'Connected' : 'Connecting...';
  };

  const formatLastUpdate = () => {
    if (!lastUpdate) return '';
    const now = new Date();
    const diff = now.getTime() - lastUpdate.getTime();
    const seconds = Math.floor(diff / 1000);

    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <div className={`connection-status theme-${theme}`}>
      <div className="status-indicator">
        <div
          className="status-dot"
          style={{ backgroundColor: getStatusColor() }}
        />
        <span className="status-text">{getStatusText()}</span>
      </div>

      {lastUpdate && (
        <div className="last-update">
          Last update: {formatLastUpdate()}
        </div>
      )}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
    </div>
  );
};
