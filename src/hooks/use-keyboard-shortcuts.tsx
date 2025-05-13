
import { useEffect, useCallback } from 'react';

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  action: () => void;
  description: string;
}

/**
 * Hook to register global keyboard shortcuts
 * 
 * @param shortcuts Array of keyboard shortcuts to register
 */
export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in input fields
    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement ||
      event.target instanceof HTMLSelectElement
    ) {
      return;
    }

    shortcuts.forEach((shortcut) => {
      if (
        event.key === shortcut.key &&
        !!shortcut.ctrlKey === event.ctrlKey &&
        !!shortcut.altKey === event.altKey &&
        !!shortcut.shiftKey === event.shiftKey
      ) {
        event.preventDefault();
        shortcut.action();
      }
    });
  }, [shortcuts]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // Return list of shortcuts for documentation
  return shortcuts.map((shortcut) => {
    const parts = [];
    if (shortcut.ctrlKey) parts.push('Ctrl');
    if (shortcut.altKey) parts.push('Alt');
    if (shortcut.shiftKey) parts.push('Shift');
    parts.push(shortcut.key);
    
    return {
      key: parts.join('+'),
      description: shortcut.description
    };
  });
}

// Example usage:
// const shortcuts = useKeyboardShortcuts([
//   {
//     key: '/',
//     action: () => console.log('Search'),
//     description: 'Focus search'
//   },
//   {
//     key: 'Escape',
//     action: () => console.log('Close modal'),
//     description: 'Close modal'
//   }
// ]);
