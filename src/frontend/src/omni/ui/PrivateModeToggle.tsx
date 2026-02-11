// Private Mode toggle control

import React from 'react';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';

interface PrivateModeToggleProps {
  isPrivate: boolean;
  onToggle: () => void;
}

export function PrivateModeToggle({ isPrivate, onToggle }: PrivateModeToggleProps) {
  return (
    <Button
      variant={isPrivate ? 'default' : 'outline'}
      size="sm"
      onClick={onToggle}
      className="gap-2"
    >
      {isPrivate ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      <span className="hidden sm:inline">
        {isPrivate ? 'Private Mode' : 'Private Mode'}
      </span>
    </Button>
  );
}
