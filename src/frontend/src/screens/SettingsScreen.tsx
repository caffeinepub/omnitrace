// Privacy & Control settings with enhanced Build Info card, Live App Troubleshooting, OMNIBRAIN Runtime Mode toggle, External AI (OpenAI) unavailability notice card, and data export/wipe controls

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { exportToJSON, exportToCSV } from '../omni/privacy/export';
import { wipeAllData } from '../omni/privacy/wipe';
import { Download, Trash2, Shield, FileJson, FileSpreadsheet, Info, RefreshCw, AlertTriangle, Code, Zap, Settings2 } from 'lucide-react';
import { FRONTEND_BUILD_LABEL } from '../constants/buildInfo';
import { useBuildInfo } from '../hooks/useBuildInfo';
import { useOmniBrainRuntimeMode, RUNTIME_MODE_LABELS, OmniBrainRuntimeMode } from '../omni/hooks/useOmniBrainRuntimeMode';

export function SettingsScreen() {
  const [isExportingJSON, setIsExportingJSON] = useState(false);
  const [isExportingCSV, setIsExportingCSV] = useState(false);
  const [isWiping, setIsWiping] = useState(false);

  const { data: backendBuildInfo, isLoading: backendLoading, isError: backendError, refetch: refetchBuildInfo, isFetching: backendRefetching } = useBuildInfo();
  const { mode: runtimeMode, setMode: setRuntimeMode, displayLabel: runtimeModeLabel } = useOmniBrainRuntimeMode();

  const handleExportJSON = async () => {
    setIsExportingJSON(true);
    try {
      await exportToJSON();
    } finally {
      setIsExportingJSON(false);
    }
  };

  const handleExportCSV = async () => {
    setIsExportingCSV(true);
    try {
      await exportToCSV();
    } finally {
      setIsExportingCSV(false);
    }
  };

  const handleWipe = async () => {
    setIsWiping(true);
    try {
      await wipeAllData();
      window.location.reload();
    } finally {
      setIsWiping(false);
    }
  };

  const handleReload = () => {
    window.location.reload();
  };

  const handleRefreshBuildInfo = () => {
    refetchBuildInfo();
  };

  // Check for version mismatch - only show when backend has loaded successfully and versions differ
  // Normalize strings by trimming whitespace for robust comparison
  const backendVersion = (backendBuildInfo?.version || '').trim();
  const frontendVersion = FRONTEND_BUILD_LABEL.trim();
  const hasBackendVersion = !backendLoading && !backendError && backendVersion !== '';
  const versionMismatch = hasBackendVersion && backendVersion !== frontendVersion;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Privacy & Control</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your data and privacy settings
        </p>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Code className="w-5 h-5" />
            Build Info
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Frontend version:</span>
              <span className="font-mono font-medium">{FRONTEND_BUILD_LABEL}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Backend version:</span>
              {backendLoading || backendRefetching ? (
                <span className="text-muted-foreground">Loading...</span>
              ) : backendError ? (
                <span className="text-destructive text-xs">Error loading</span>
              ) : (
                <span className="font-mono font-medium">{backendVersion}</span>
              )}
            </div>
            {hasBackendVersion && backendBuildInfo?.backendTimestamp && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Backend timestamp:</span>
                <span className="font-mono text-xs text-muted-foreground">{backendBuildInfo.backendTimestamp}</span>
              </div>
            )}
          </div>

          <Button
            onClick={handleRefreshBuildInfo}
            variant="outline"
            size="sm"
            disabled={backendLoading || backendRefetching}
            className="gap-2 w-full"
          >
            <RefreshCw className={`w-4 h-4 ${backendRefetching ? 'animate-spin' : ''}`} />
            {backendRefetching ? 'Refreshing...' : 'Refresh Build Info'}
          </Button>

          {versionMismatch && (
            <Alert className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                Frontend and backend versions differ. This may indicate a stale or cached build. 
                Try a hard refresh (Ctrl+Shift+R or Cmd+Shift+R) or clear your browser cache.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Info className="w-5 h-5" />
            Live App Troubleshooting
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium mb-1">Current URL:</p>
              <code className="text-xs bg-muted px-2 py-1 rounded block break-all">
                {window.location.href}
              </code>
            </div>

            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="leading-relaxed">
                <strong className="text-foreground">Not seeing the latest version?</strong> Follow these steps:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Verify you're using the <strong>live production URL</strong> (check above)</li>
                <li>Perform a <strong>hard refresh</strong>: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)</li>
                <li>Clear your browser's <strong>cache</strong> for this site</li>
                <li>Try opening in an <strong>incognito/private window</strong></li>
                <li>Use the <strong>Refresh Build Info</strong> button above to verify backend version</li>
              </ul>
              <p className="leading-relaxed mt-2">
                <strong className="text-foreground">After a fresh deployment:</strong> Always check Settings → Build Info to confirm both frontend and backend versions match the expected release label.
              </p>
            </div>
          </div>

          <Button 
            onClick={handleReload}
            variant="outline"
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Reload App
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-muted">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-muted-foreground" />
            OMNIBRAIN Runtime Mode
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Choose how OMNIBRAIN processes your questions. This setting is stored locally on your device and updates immediately.
          </p>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Current mode:</span>
              <Select 
                value={runtimeMode} 
                onValueChange={(v) => setRuntimeMode(v as OmniBrainRuntimeMode)}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="local">{RUNTIME_MODE_LABELS.local}</SelectItem>
                  <SelectItem value="api" disabled>
                    {RUNTIME_MODE_LABELS.api}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-2">
              <div className="flex items-start gap-2">
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">{RUNTIME_MODE_LABELS.local}</p>
                  <p className="text-xs text-muted-foreground">
                    Uses your local OMNITRACE data and static knowledge base. All processing happens on your device. No network calls.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-2 opacity-60">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{RUNTIME_MODE_LABELS.api}</p>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                      {RUNTIME_MODE_LABELS.apiUnavailableNote}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Would connect to external AI services. Not available in this build.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-sm">
              The current build maintains the offline-only guarantee: No API keys are accepted, and OMNIBRAIN makes no network calls regardless of the selected mode.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-muted">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="w-5 h-5 text-muted-foreground" />
            External AI (OpenAI)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground leading-relaxed">
            This build does not support connecting to OpenAI or other external AI services. No API keys are accepted, and OMNIBRAIN makes no network calls.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            OMNIBRAIN answers questions using only your local OMNITRACE data and a static app help knowledge base. All responses are generated deterministically on your device.
          </p>
          <div className="pt-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-medium">Status:</span>
              <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                Unavailable
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Privacy Statement
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground leading-relaxed">
            All your activity data is stored locally in your browser using IndexedDB. No data is sent to external servers.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            You have complete control over your data. You can export it at any time or permanently delete it.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            OMNITRACE respects your privacy and operates entirely offline after the initial page load.
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export Data
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Download a complete copy of your activity data in your preferred format.
          </p>
          <div className="flex gap-3 flex-wrap">
            <Button 
              onClick={handleExportJSON} 
              disabled={isExportingJSON || isExportingCSV}
              className="gap-2 shadow-sm"
            >
              <FileJson className="w-4 h-4" />
              {isExportingJSON ? 'Exporting...' : 'Export as JSON'}
            </Button>
            <Button 
              onClick={handleExportCSV} 
              disabled={isExportingJSON || isExportingCSV}
              variant="outline"
              className="gap-2"
            >
              <FileSpreadsheet className="w-4 h-4" />
              {isExportingCSV ? 'Exporting...' : 'Export as CSV'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-destructive/50">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2 text-destructive">
            <Trash2 className="w-5 h-5" />
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Permanently delete all your activity data. This action cannot be undone.
          </p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="destructive" 
                disabled={isWiping}
                className="gap-2 shadow-sm"
              >
                <Trash2 className="w-4 h-4" />
                {isWiping ? 'Wiping...' : 'Wipe All Data'}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete all your activity data, including events, sessions, and metadata.
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleWipe} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Yes, wipe all data
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
