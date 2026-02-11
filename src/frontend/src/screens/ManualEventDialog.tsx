// Manual event capture dialog

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Category, Confidence, EventType } from '../omni/types';
import { appendEvent } from '../omni/storage/ledger';
import { CATEGORY_LABELS } from '../omni/ui/categoryColors';

interface ManualEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEventCreated: () => void;
}

export function ManualEventDialog({ open, onOpenChange, onEventCreated }: ManualEventDialogProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Category>(Category.UNKNOWN);
  const [startTime, setStartTime] = useState('');
  const [duration, setDuration] = useState('');
  const [keywords, setKeywords] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) return;

    setIsSubmitting(true);

    try {
      const timestamp = startTime ? new Date(startTime).getTime() : Date.now();
      const durationMs = duration ? parseInt(duration) * 60 * 1000 : undefined;

      await appendEvent({
        id: `manual-${timestamp}-${Math.random().toString(36).substr(2, 9)}`,
        type: EventType.MANUAL_EVENT,
        timestamp,
        context: {},
        confidence: Confidence.MANUAL,
        title: title.trim(),
        category,
        duration: durationMs,
        keywords: keywords.split(',').map(k => k.trim()).filter(Boolean),
        note: note.trim() || undefined,
      });

      // Reset form
      setTitle('');
      setCategory(Category.UNKNOWN);
      setStartTime('');
      setDuration('');
      setKeywords('');
      setNote('');

      onEventCreated();
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Log Manual Event</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Event Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Started studying, Phone distraction"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
              <SelectTrigger id="category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(Category).map(cat => (
                  <SelectItem key={cat} value={cat}>
                    {CATEGORY_LABELS[cat]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time (optional)</Label>
              <Input
                id="startTime"
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                placeholder="e.g., 30"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="keywords">Keywords (comma-separated)</Label>
            <Input
              id="keywords"
              placeholder="e.g., focus, deep work, important"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Note</Label>
            <Textarea
              id="note"
              placeholder="Additional details..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!title.trim() || isSubmitting}>
            {isSubmitting ? 'Logging...' : 'Log Event'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
