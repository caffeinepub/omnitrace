// Complete local export to JSON and CSV

import { storage } from '../storage/idb';
import { ExportData, SCHEMA_VERSION } from '../types';

export async function exportToJSON(): Promise<void> {
  const events = await storage.getAllEvents();
  const sessions = await storage.getAllSessions();
  const metadata = await storage.getMetadata();

  const exportData: ExportData = {
    schemaVersion: SCHEMA_VERSION,
    exportTime: Date.now(),
    events,
    sessions,
    metadata,
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `omnitrace-export-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function exportToCSV(): Promise<void> {
  const events = await storage.getAllEvents();

  const headers = ['ID', 'Type', 'Timestamp', 'Title', 'Category', 'Confidence', 'Duration', 'Note'];
  const rows = events.map(e => [
    e.id,
    e.type,
    new Date(e.timestamp).toISOString(),
    e.title || '',
    e.category || '',
    e.confidence,
    e.duration?.toString() || '',
    e.note || '',
  ]);

  const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `omnitrace-export-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
