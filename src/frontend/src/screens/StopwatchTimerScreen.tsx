// Timer & Stopwatch screen with refined card styling and consistent controls

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Clock, Play, Pause, RotateCcw } from 'lucide-react';
import { useStopwatch } from '../hooks/useStopwatch';
import { useTimer } from '../hooks/useTimer';

export function StopwatchTimerScreen() {
  const stopwatch = useStopwatch();
  const timer = useTimer();
  const [timerDuration, setTimerDuration] = useState(0);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = Math.floor((ms % 1000) / 10);

    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds
      .toString()
      .padStart(2, '0')}`;
  };

  const handleTimerDurationChange = (field: 'hours' | 'minutes' | 'seconds', value: string) => {
    const numValue = parseInt(value) || 0;
    const currentHours = Math.floor(timerDuration / 3600000);
    const currentMinutes = Math.floor((timerDuration % 3600000) / 60000);
    const currentSeconds = Math.floor((timerDuration % 60000) / 1000);

    let newHours = currentHours;
    let newMinutes = currentMinutes;
    let newSeconds = currentSeconds;

    if (field === 'hours') newHours = Math.max(0, Math.min(23, numValue));
    if (field === 'minutes') newMinutes = Math.max(0, Math.min(59, numValue));
    if (field === 'seconds') newSeconds = Math.max(0, Math.min(59, numValue));

    const newDuration = newHours * 3600000 + newMinutes * 60000 + newSeconds * 1000;
    setTimerDuration(newDuration);
    timer.setDuration(newDuration);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Timer & Stopwatch</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Precise time tracking tools for your activities
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Stopwatch
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-4xl font-mono font-bold tracking-tight">
                {formatTime(stopwatch.elapsedMs)}
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              {!stopwatch.isRunning ? (
                <Button onClick={stopwatch.start} className="gap-2 shadow-sm">
                  <Play className="w-4 h-4" />
                  Start
                </Button>
              ) : (
                <Button onClick={stopwatch.pause} variant="secondary" className="gap-2 shadow-sm">
                  <Pause className="w-4 h-4" />
                  Pause
                </Button>
              )}
              <Button onClick={stopwatch.reset} variant="outline" className="gap-2">
                <RotateCcw className="w-4 h-4" />
                Reset
              </Button>
            </div>

            <div className="pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground text-center">
                High-precision stopwatch using requestAnimationFrame for accurate timing
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Countdown Timer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-4xl font-mono font-bold tracking-tight">
                {formatTime(timer.remainingMs)}
              </div>
            </div>

            {!timer.isRunning && (
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground text-center block">Hours</label>
                  <Input
                    type="number"
                    min="0"
                    max="23"
                    value={Math.floor(timerDuration / 3600000)}
                    onChange={(e) => handleTimerDurationChange('hours', e.target.value)}
                    className="text-center"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground text-center block">Minutes</label>
                  <Input
                    type="number"
                    min="0"
                    max="59"
                    value={Math.floor((timerDuration % 3600000) / 60000)}
                    onChange={(e) => handleTimerDurationChange('minutes', e.target.value)}
                    className="text-center"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground text-center block">Seconds</label>
                  <Input
                    type="number"
                    min="0"
                    max="59"
                    value={Math.floor((timerDuration % 60000) / 1000)}
                    onChange={(e) => handleTimerDurationChange('seconds', e.target.value)}
                    className="text-center"
                  />
                </div>
              </div>
            )}

            <div className="flex gap-3 justify-center">
              {!timer.isRunning ? (
                <Button 
                  onClick={timer.start} 
                  disabled={timerDuration === 0}
                  className="gap-2 shadow-sm"
                >
                  <Play className="w-4 h-4" />
                  Start
                </Button>
              ) : (
                <Button onClick={timer.pause} variant="secondary" className="gap-2 shadow-sm">
                  <Pause className="w-4 h-4" />
                  Pause
                </Button>
              )}
              <Button onClick={timer.reset} variant="outline" className="gap-2">
                <RotateCcw className="w-4 h-4" />
                Reset
              </Button>
            </div>

            {timer.isCompleted && (
              <div className="text-center text-sm font-medium text-success">
                Timer completed!
              </div>
            )}

            <div className="pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground text-center">
                Set your desired duration and start the countdown timer
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

