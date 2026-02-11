// Main app component with startup error handling, recovery UI, and OMNIBRAIN screen routing

import React, { useEffect, useState } from 'react';
import { AppShell } from './omni/ui/AppShell';
import { TimelineScreen } from './screens/TimelineScreen';
import { DashboardScreen } from './screens/DashboardScreen';
import { ActivityMapScreen } from './screens/ActivityMapScreen';
import { ForensicScreen } from './screens/ForensicScreen';
import { SearchScreen } from './screens/SearchScreen';
import { StopwatchTimerScreen } from './screens/StopwatchTimerScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { OmniBrainScreen } from './screens/OmniBrainScreen';
import { initializeSession } from './omni/session/startup';
import { LoadingState, StartupErrorState } from './omni/ui/States';
import { wipeAllDataForRecovery } from './omni/privacy/wipe';

type StartupStatus = 'loading' | 'ready' | 'error';

function App() {
  const [currentScreen, setCurrentScreen] = useState('timeline');
  const [startupStatus, setStartupStatus] = useState<StartupStatus>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const attemptInitialization = async () => {
    setStartupStatus('loading');
    setErrorMessage('');
    
    try {
      await initializeSession();
      setStartupStatus('ready');
    } catch (error) {
      console.error('Initialization failed:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error');
      setStartupStatus('error');
    }
  };

  useEffect(() => {
    attemptInitialization();
  }, []);

  const handleRetry = () => {
    attemptInitialization();
  };

  const handleWipeAndRetry = async () => {
    try {
      await wipeAllDataForRecovery();
      // After wipe, retry initialization
      await attemptInitialization();
    } catch (error) {
      console.error('Wipe failed:', error);
      setErrorMessage('Failed to wipe data. Please try refreshing the page.');
      setStartupStatus('error');
    }
  };

  if (startupStatus === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <LoadingState message="Initializing OMNITRACE..." />
        </div>
      </div>
    );
  }

  if (startupStatus === 'error') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <StartupErrorState 
            errorMessage={errorMessage}
            onRetry={handleRetry}
            onWipeData={handleWipeAndRetry}
          />
        </div>
      </div>
    );
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 'timeline':
        return <TimelineScreen />;
      case 'dashboard':
        return <DashboardScreen />;
      case 'activity-map':
        return <ActivityMapScreen />;
      case 'forensic':
        return <ForensicScreen />;
      case 'search':
        return <SearchScreen />;
      case 'omnibrain':
        return <OmniBrainScreen />;
      case 'timer':
        return <StopwatchTimerScreen />;
      case 'settings':
        return <SettingsScreen />;
      default:
        return <TimelineScreen />;
    }
  };

  return (
    <AppShell currentScreen={currentScreen} onScreenChange={setCurrentScreen}>
      {renderScreen()}
    </AppShell>
  );
}

export default App;
