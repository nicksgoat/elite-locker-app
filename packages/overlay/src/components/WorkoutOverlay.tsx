import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  WorkoutUpdate, 
  SessionStats, 
  StreamingSettings,
  OverlayTheme 
} from '@elite-locker/shared-types';
import { WorkoutPanel } from './WorkoutPanel';
import { SessionStatsPanel } from './SessionStatsPanel';
import { ProgressBar } from './ProgressBar';
import { AchievementPopup } from './AchievementPopup';
import './WorkoutOverlay.css';

interface WorkoutOverlayProps {
  workoutData: WorkoutUpdate | null;
  sessionStats: SessionStats | null;
  settings: StreamingSettings | null;
  theme: OverlayTheme;
  isConnected: boolean;
}

export const WorkoutOverlay: React.FC<WorkoutOverlayProps> = ({
  workoutData,
  sessionStats,
  settings,
  theme,
  isConnected
}) => {
  const [showAchievement, setShowAchievement] = useState(false);
  const [achievementData, setAchievementData] = useState<any>(null);
  const [lastSessionStats, setLastSessionStats] = useState<SessionStats | null>(null);

  // Check for new personal records
  useEffect(() => {
    if (sessionStats && lastSessionStats) {
      const newPRs = sessionStats.personalRecords.filter(pr => 
        !lastSessionStats.personalRecords.some(lastPR => 
          lastPR.exerciseName === pr.exerciseName && lastPR.type === pr.type
        )
      );

      if (newPRs.length > 0) {
        setAchievementData(newPRs[0]); // Show first new PR
        setShowAchievement(true);
        
        // Auto-hide after 5 seconds
        setTimeout(() => setShowAchievement(false), 5000);
      }
    }
    
    setLastSessionStats(sessionStats);
  }, [sessionStats, lastSessionStats]);

  // Don't render anything if not connected and no data
  if (!isConnected && !workoutData && !sessionStats) {
    return (
      <div className="overlay-waiting">
        <motion.div
          className="waiting-message"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="waiting-icon">⏳</div>
          <p>Waiting for workout data...</p>
        </motion.div>
      </div>
    );
  }

  const overlayPosition = settings?.overlayPosition || {
    x: 10,
    y: 10,
    width: 300,
    height: 200
  };

  const customColors = settings?.customColors;

  return (
    <div 
      className={`workout-overlay theme-${theme}`}
      style={{
        left: `${overlayPosition.x}%`,
        top: `${overlayPosition.y}%`,
        width: `${overlayPosition.width}px`,
        minHeight: `${overlayPosition.height}px`,
        ...(customColors && {
          '--primary-color': customColors.primary,
          '--secondary-color': customColors.secondary,
          '--accent-color': customColors.accent,
          '--background-color': customColors.background,
          '--text-color': customColors.text,
        } as React.CSSProperties)
      }}
    >
      <AnimatePresence mode="wait">
        {/* Main workout panel */}
        {workoutData && settings?.showCurrentExercise && (
          <motion.div
            key="workout-panel"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="panel-container"
          >
            <WorkoutPanel 
              workoutData={workoutData}
              theme={theme}
            />
          </motion.div>
        )}

        {/* Session stats panel */}
        {sessionStats && settings?.showSessionStats && (
          <motion.div
            key="stats-panel"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="panel-container"
          >
            <SessionStatsPanel 
              sessionStats={sessionStats}
              theme={theme}
            />
          </motion.div>
        )}

        {/* Progress bar */}
        {workoutData?.sessionProgress && (
          <motion.div
            key="progress-bar"
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            exit={{ opacity: 0, scaleX: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="progress-container"
          >
            <ProgressBar 
              progress={workoutData.sessionProgress}
              theme={theme}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Achievement popup */}
      <AnimatePresence>
        {showAchievement && achievementData && (
          <AchievementPopup
            achievement={achievementData}
            theme={theme}
            onClose={() => setShowAchievement(false)}
          />
        )}
      </AnimatePresence>

      {/* Connection indicator */}
      {!isConnected && (
        <motion.div
          className="connection-indicator offline"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="indicator-dot" />
          <span>Offline</span>
        </motion.div>
      )}
    </div>
  );
};
