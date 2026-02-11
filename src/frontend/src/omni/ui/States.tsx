// Reusable UI state components for loading, empty, error, and startup failure states

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Loader2, AlertTriangle, RotateCcw, Trash2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export function LoadingState({ message = 'Loading...', className = '' }: LoadingStateProps) {
  return (
    <Card className={className}>
      <CardContent className="py-12">
        <div className="flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
      </CardContent>
    </Card>
  );
}

interface EmptyStateProps {
  title?: string;
  message: string;
  className?: string;
  icon?: React.ReactNode;
}

export function EmptyState({ 
  title, 
  message, 
  className = '',
  icon 
}: EmptyStateProps) {
  return (
    <Card className={className}>
      <CardContent className="py-12">
        <div className="flex flex-col items-center justify-center gap-3 text-center">
          {icon && <div className="text-muted-foreground/50">{icon}</div>}
          {title && <h3 className="text-lg font-semibold">{title}</h3>}
          <p className="text-sm text-muted-foreground max-w-md">{message}</p>
        </div>
      </CardContent>
    </Card>
  );
}

interface InlineNoticeProps {
  message: string;
  variant?: 'default' | 'muted';
  className?: string;
}

export function InlineNotice({ 
  message, 
  variant = 'default',
  className = '' 
}: InlineNoticeProps) {
  return (
    <div 
      className={`text-center py-8 ${
        variant === 'muted' ? 'text-muted-foreground' : 'text-foreground'
      } ${className}`}
    >
      <p className="text-sm">{message}</p>
    </div>
  );
}

interface StartupErrorStateProps {
  errorMessage: string;
  onRetry: () => void;
  onWipeData: () => void;
}

export function StartupErrorState({ errorMessage, onRetry, onWipeData }: StartupErrorStateProps) {
  const [showWipeDialog, setShowWipeDialog] = useState(false);

  const handleWipeConfirm = () => {
    setShowWipeDialog(false);
    onWipeData();
  };

  return (
    <Card className="border-destructive/50">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-destructive/10">
            <AlertTriangle className="w-6 h-6 text-destructive" />
          </div>
          <div>
            <CardTitle>Failed to initialize OMNITRACE</CardTitle>
            <CardDescription className="mt-1">
              The application encountered an error during startup
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 rounded-lg bg-muted/50 border border-border">
          <p className="text-sm text-muted-foreground font-mono break-all">
            {errorMessage || 'Unknown error occurred'}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <Button 
            onClick={onRetry}
            className="w-full"
            variant="default"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Retry
          </Button>

          <AlertDialog open={showWipeDialog} onOpenChange={setShowWipeDialog}>
            <AlertDialogTrigger asChild>
              <Button 
                variant="destructive"
                className="w-full"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Wipe local data
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Wipe all local data?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete all OMNITRACE data stored locally on this device, including:
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>All recorded events and sessions</li>
                    <li>Activity history and analytics</li>
                    <li>Application settings</li>
                  </ul>
                  <p className="mt-3 font-semibold">This action cannot be undone.</p>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleWipeConfirm}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  Wipe data
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          If the problem persists after wiping data, please refresh the page or contact support.
        </p>
      </CardContent>
    </Card>
  );
}
