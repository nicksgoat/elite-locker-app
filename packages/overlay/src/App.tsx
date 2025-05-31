import React, { useEffect, useState } from 'react';
import { Routes, Route, useParams } from 'react-router-dom';
import { OverlayManager } from './services/OverlayManager';
import { WorkoutOverlay } from './components/WorkoutOverlay';
import { ConnectionStatus } from './components/ConnectionStatus';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LoadingScreen } from './components/LoadingScreen';
import { 
  WorkoutUpdate, 
  SessionStats, 
  StreamingSettings,
  OverlayTheme 
} from '@elite-locker/shared-types';

interface OverlayState {
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  workoutData: WorkoutUpdate | null;
  sessionStats: SessionStats | null;
  settings: StreamingSettings | null;
  theme: OverlayTheme;
}

function OverlayRoute() {
  const { overlayUrl } = useParams<{ overlayUrl: string }>();
  const [overlayManager] = useState(() => new OverlayManager());
  const [state, setState] = useState<OverlayState>({
    isConnected: false,
    isLoading: true,
    error: null,
    workoutData: null,
    sessionStats: null,
    settings: null,
    theme: 'default'
  });

  useEffect(() => {
    if (!overlayUrl) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Invalid overlay URL'
      }));
      return;
    }

    const initializeOverlay = async () => {
      try {
        // Set up event listeners
        overlayManager.on('connected', () => {
          setState(prev => ({ ...prev, isConnected: true, isLoading: false, error: null }));
        });

        overlayManager.on('disconnected', () => {
          setState(prev => ({ ...prev, isConnected: false }));
        });

        overlayManager.on('error', (error: { message: string }) => {
          setState(prev => ({ 
            ...prev, 
            error: error.message, 
            isLoading: false 
          }));
        });

        overlayManager.on('workoutUpdate', (data: WorkoutUpdate) => {
          setState(prev => ({ ...prev, workoutData: data }));
        });

        overlayManager.on('sessionStats', (data: SessionStats) => {
          setState(prev => ({ ...prev, sessionStats: data }));
        });

        overlayManager.on('settingsUpdate', (settings: StreamingSettings) => {
          setState(prev => ({ 
            ...prev, 
            settings,
            theme: settings.theme 
          }));
        });

        // Initialize connection
        await overlayManager.initialize(overlayUrl);
        
      } catch (error) {
        console.error('Failed to initialize overlay:', error);
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to initialize overlay'
        }));
      }
    };

    initializeOverlay();

    // Cleanup on unmount
    return () => {
      overlayManager.cleanup();
    };
  }, [overlayUrl, overlayManager]);

  // Show loading screen
  if (state.isLoading) {
    return <LoadingScreen />;
  }

  // Show error state
  if (state.error) {
    return (
      <div className="error-container">
        <div className="error-content">
          <h2>Connection Error</h2>
          <p>{state.error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="retry-button"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`overlay-container theme-${state.theme}`}>
      <ErrorBoundary>
        <ConnectionStatus 
          isConnected={state.isConnected}
          theme={state.theme}
        />
        
        <WorkoutOverlay
          workoutData={state.workoutData}
          sessionStats={state.sessionStats}
          settings={state.settings}
          theme={state.theme}
          isConnected={state.isConnected}
        />
      </ErrorBoundary>
    </div>
  );
}

function HomePage() {
  return (
    <div className="home-container">
      <div className="home-content">
        <h1>Elite Locker Workout Overlay</h1>
        <p>
          This is a workout streaming overlay for Elite Locker. 
          To use this overlay, you need a valid overlay URL from the Elite Locker mobile app.
        </p>
        <div className="instructions">
          <h3>How to use:</h3>
          <ol>
            <li>Open the Elite Locker mobile app</li>
            <li>Go to Settings → Streaming</li>
            <li>Enable streaming to get your overlay URL</li>
            <li>Add the overlay URL to your streaming software as a browser source</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/:overlayUrl" element={<OverlayRoute />} />
      </Routes>
    </div>
  );
}

export default App;
