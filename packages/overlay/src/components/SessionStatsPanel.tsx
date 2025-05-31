import React from 'react';
import { SessionStats, OverlayTheme } from '@elite-locker/shared-types';
import './SessionStatsPanel.css';

interface SessionStatsPanelProps {
  sessionStats: SessionStats;
  theme: OverlayTheme;
}

export const SessionStatsPanel: React.FC<SessionStatsPanelProps> = ({
  sessionStats,
  theme,
}) => {
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatWeight = (weight: number) => {
    return weight.toLocaleString();
  };

  return (
    <div className={`session-stats-panel theme-${theme}`}>
      <div className="stats-header">
        <h3>Session Stats</h3>
      </div>

      <div className="stats-grid">
        <div className="stat-item">
          <span className="stat-label">Duration</span>
          <span className="stat-value">
            {formatDuration(sessionStats.duration)}
          </span>
        </div>

        <div className="stat-item">
          <span className="stat-label">Exercises</span>
          <span className="stat-value">
            {sessionStats.exercisesCompleted}
          </span>
        </div>

        <div className="stat-item">
          <span className="stat-label">Total Sets</span>
          <span className="stat-value">
            {sessionStats.totalSets}
          </span>
        </div>

        <div className="stat-item">
          <span className="stat-label">Total Reps</span>
          <span className="stat-value">
            {sessionStats.totalReps}
          </span>
        </div>

        <div className="stat-item">
          <span className="stat-label">Volume</span>
          <span className="stat-value">
            {formatWeight(sessionStats.totalVolume)} lbs
          </span>
        </div>

        <div className="stat-item">
          <span className="stat-label">Calories</span>
          <span className="stat-value">
            {sessionStats.caloriesBurned}
          </span>
        </div>
      </div>

      {sessionStats.personalRecords && sessionStats.personalRecords.length > 0 && (
        <div className="personal-records">
          <h4>Personal Records</h4>
          <div className="pr-list">
            {sessionStats.personalRecords.slice(0, 3).map((pr, index) => (
              <div key={index} className="pr-item">
                <span className="pr-exercise">{pr.exerciseName}</span>
                <span className="pr-value">
                  {pr.type === 'weight' ? `${pr.value} lbs` : 
                   pr.type === 'reps' ? `${pr.value} reps` :
                   pr.type === 'time' ? formatDuration(pr.value) : pr.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
