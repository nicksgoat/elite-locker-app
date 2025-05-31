import React from 'react';
import { motion } from 'framer-motion';
import { OverlayTheme } from '@elite-locker/shared-types';
import './AchievementPopup.css';

interface AchievementPopupProps {
  achievement: {
    exerciseName: string;
    type: 'weight' | 'reps' | 'time' | 'distance';
    value: number;
    previousValue?: number;
  };
  theme: OverlayTheme;
  onClose: () => void;
}

export const AchievementPopup: React.FC<AchievementPopupProps> = ({
  achievement,
  theme,
  onClose,
}) => {
  const formatValue = (type: string, value: number) => {
    switch (type) {
      case 'weight':
        return `${value} lbs`;
      case 'reps':
        return `${value} reps`;
      case 'time':
        const minutes = Math.floor(value / 60);
        const seconds = value % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
      case 'distance':
        return `${value} miles`;
      default:
        return value.toString();
    }
  };

  const getAchievementIcon = (type: string) => {
    switch (type) {
      case 'weight':
        return '🏋️';
      case 'reps':
        return '🔥';
      case 'time':
        return '⏱️';
      case 'distance':
        return '🏃';
      default:
        return '🎯';
    }
  };

  return (
    <motion.div
      className={`achievement-popup theme-${theme}`}
      initial={{ scale: 0, opacity: 0, y: 50 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0, opacity: 0, y: -50 }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 20 
      }}
    >
      <div className="achievement-content">
        <div className="achievement-icon">
          {getAchievementIcon(achievement.type)}
        </div>
        
        <div className="achievement-text">
          <h3 className="achievement-title">Personal Record!</h3>
          <p className="achievement-exercise">{achievement.exerciseName}</p>
          <div className="achievement-values">
            <span className="new-value">
              {formatValue(achievement.type, achievement.value)}
            </span>
            {achievement.previousValue && (
              <span className="previous-value">
                (was {formatValue(achievement.type, achievement.previousValue)})
              </span>
            )}
          </div>
        </div>
        
        <button 
          className="achievement-close"
          onClick={onClose}
          aria-label="Close achievement"
        >
          ×
        </button>
      </div>
      
      <div className="achievement-sparkles">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="sparkle"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: [0, 1, 0], 
              opacity: [0, 1, 0],
              x: [0, Math.random() * 40 - 20],
              y: [0, Math.random() * 40 - 20]
            }}
            transition={{ 
              duration: 2,
              delay: i * 0.2,
              repeat: Infinity,
              repeatDelay: 1
            }}
          >
            ✨
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
