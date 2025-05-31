import { OverlayTheme, WorkoutUpdate } from '@elite-locker/shared-types';
import React from 'react';
import './WorkoutPanel.css';

interface WorkoutPanelProps {
  workoutData: WorkoutUpdate;
  theme: OverlayTheme;
}

export const WorkoutPanel: React.FC<WorkoutPanelProps> = ({
  workoutData,
  theme,
}) => {
  if (!workoutData) {
    return null;
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const currentExercise = workoutData.currentExercise;

  return (
    <div className={`workout-panel theme-${theme}`}>
      <div className="workout-header">
        <h2 className="workout-title">{workoutData.workoutName || 'Current Workout'}</h2>
        <div className="workout-duration">
          {formatDuration(workoutData.elapsedTime || 0)}
        </div>
      </div>

      {currentExercise && (
        <div className="current-exercise">
          <h3 className="exercise-name">{currentExercise.name}</h3>

          {currentExercise.sets && currentExercise.sets.length > 0 && (
            <div className="sets-info">
              <div className="sets-header">
                <span>Set</span>
                <span>Weight</span>
                <span>Reps</span>
                <span>Status</span>
              </div>

              {currentExercise.sets.map((set, index) => (
                <div
                  key={index}
                  className={`set-row ${set.completed ? 'completed' : 'pending'}`}
                >
                  <span className="set-number">{index + 1}</span>
                  <span className="set-weight">
                    {set.weight ? `${set.weight} lbs` : '-'}
                  </span>
                  <span className="set-reps">
                    {set.actualReps || set.targetReps || '-'}
                  </span>
                  <span className="set-status">
                    {set.completed ? '✓' : '○'}
                  </span>
                </div>
              ))}
            </div>
          )}

          {currentExercise.notes && (
            <div className="exercise-notes">
              <strong>Notes:</strong> {currentExercise.notes}
            </div>
          )}
        </div>
      )}

      <div className="workout-stats">
        <div className="stat-item">
          <span className="stat-label">Current Set</span>
          <span className="stat-value">
            {currentExercise?.currentSet || 0} / {currentExercise?.sets?.length || 0}
          </span>
        </div>

        <div className="stat-item">
          <span className="stat-label">Rest Time</span>
          <span className="stat-value">
            {workoutData.restTimer ? `${Math.ceil(workoutData.restTimer / 1000)}s` : '-'}
          </span>
        </div>

        {workoutData.sessionProgress && (
          <div className="stat-item">
            <span className="stat-label">Progress</span>
            <span className="stat-value">{Math.round(workoutData.sessionProgress.percentage)}%</span>
          </div>
        )}
      </div>
    </div>
  );
};
