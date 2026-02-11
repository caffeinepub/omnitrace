// Neural Midnight app shell with Focus Score Ring, Private Mode toggle, Cognitive Mode switch, and OMNIBRAIN navigation

import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, BarChart3, Search, Map, Microscope, Settings, Timer, Brain } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FocusScoreRing } from './FocusScoreRing';
import { PrivateModeToggle } from './PrivateModeToggle';
import { CognitiveModeSwitch } from './CognitiveModeSwitch';
import { useTodayOmniEvents } from '../hooks/useTodayOmniEvents';
import { computeFocusScore } from '../analytics/focusScore';
import { useSmoothedFocusPresentation } from '../hooks/useSmoothedFocusPresentation';
import { usePrivateMode } from '../privacy/privateMode';
import { useCognitiveMode } from '../hooks/useCognitiveMode';
import { setCurrentMode, setCurrentScreen } from '../instrumentation/context';

interface AppShellProps {
  currentScreen: string;
  onScreenChange: (screen: string) => void;
  children: React.ReactNode;
}

export function AppShell({ currentScreen, onScreenChange, children }: AppShellProps) {
  const { events, isLoading } = useTodayOmniEvents();
  const { isPrivate, toggle: togglePrivate } = usePrivateMode();
  const { mode, setMode } = useCognitiveMode();
  
  const focusResult = computeFocusScore(events);
  const { displayScore, displayLabel } = useSmoothedFocusPresentation(
    focusResult.score,
    focusResult.label
  );

  // Update instrumentation context when mode changes
  React.useEffect(() => {
    setCurrentMode(mode);
  }, [mode]);

  // Update instrumentation context when screen changes
  React.useEffect(() => {
    setCurrentScreen(currentScreen);
  }, [currentScreen]);

  // Clone children with isPrivate prop
  const childrenWithProps = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { isPrivate } as any);
    }
    return child;
  });

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b border-border/50 bg-card/40 backdrop-blur-xl sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">OMNITRACE</h1>
              <p className="text-xs text-muted-foreground mt-1.5 font-medium tracking-wide">
                Personal Activity Intelligence
              </p>
            </div>
            
            <div className="flex items-center gap-3 flex-wrap">
              <CognitiveModeSwitch mode={mode} onChange={setMode} />
              {!isLoading && (
                <FocusScoreRing
                  score={displayScore}
                  label={displayLabel}
                  hasEnoughData={focusResult.hasEnoughData}
                />
              )}
              <PrivateModeToggle isPrivate={isPrivate} onToggle={togglePrivate} />
            </div>
          </div>
        </div>
      </header>

      <nav className="border-b border-border/50 bg-popover/30 backdrop-blur-xl sticky top-[89px] z-40 shadow-md">
        <div className="container mx-auto px-6">
          <ScrollArea className="w-full">
            <Tabs value={currentScreen} onValueChange={onScreenChange}>
              <TabsList className="h-14 bg-transparent border-0 w-full justify-start gap-1 flex-nowrap">
                <TabsTrigger 
                  value="timeline" 
                  className="gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-sm data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-b-none px-5 font-semibold transition-all"
                >
                  <Activity className="w-4 h-4" />
                  <span className="hidden sm:inline">Timeline</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="dashboard" 
                  className="gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-sm data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-b-none px-5 font-semibold transition-all"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="activity-map" 
                  className="gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-sm data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-b-none px-5 font-semibold transition-all"
                >
                  <Map className="w-4 h-4" />
                  <span className="hidden sm:inline">Activity Map</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="forensic" 
                  className="gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-sm data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-b-none px-5 font-semibold transition-all"
                >
                  <Microscope className="w-4 h-4" />
                  <span className="hidden sm:inline">Forensic</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="search" 
                  className="gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-sm data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-b-none px-5 font-semibold transition-all"
                >
                  <Search className="w-4 h-4" />
                  <span className="hidden sm:inline">Search</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="omnibrain" 
                  className="gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-sm data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-b-none px-5 font-semibold transition-all"
                >
                  <Brain className="w-4 h-4" />
                  <span className="hidden sm:inline">OMNIBRAIN</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="timer" 
                  className="gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-sm data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-b-none px-5 font-semibold transition-all"
                >
                  <Timer className="w-4 h-4" />
                  <span className="hidden sm:inline">Timer</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="settings" 
                  className="gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-sm data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-b-none px-5 font-semibold transition-all"
                >
                  <Settings className="w-4 h-4" />
                  <span className="hidden sm:inline">Settings</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </ScrollArea>
        </div>
      </nav>

      <main className="flex-1 container mx-auto px-6 py-8">
        {childrenWithProps}
      </main>

      <footer className="border-t border-border/50 bg-card/30 backdrop-blur-xl mt-auto shadow-lg">
        <div className="container mx-auto px-6 py-5">
          <p className="text-xs text-muted-foreground text-center font-medium">
            Built with love using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors font-semibold"
            >
              caffeine.ai
            </a>
            {' • '}© {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}
