
import { useCallback, useEffect, useRef } from 'react';

/**
 * A hook to trap focus within a container for better keyboard accessibility
 * 
 * @param active Whether the focus trap is active
 * @param onEscape Callback to run when Escape key is pressed
 * @returns Ref to attach to the container element
 */
export function useFocusTrap(active = true, onEscape?: () => void) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!active) return;
    
    // Handle escape key
    if (e.key === 'Escape' && onEscape) {
      e.preventDefault();
      onEscape();
      return;
    }
    
    // Handle tab key for focus trapping
    if (e.key === 'Tab' && containerRef.current) {
      const focusableElements = containerRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
      
      // Shift + Tab: move focus to the last element if at first
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      } 
      // Tab: move focus to the first element if at last
      else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    }
  }, [active, onEscape]);
  
  // Set up keydown listener
  useEffect(() => {
    if (!active) return;
    
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [active, handleKeyDown]);
  
  // Auto-focus first element when activated
  useEffect(() => {
    if (active && containerRef.current) {
      const focusableElement = containerRef.current.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as HTMLElement;
      
      if (focusableElement) {
        // Small delay to allow any animations to complete
        setTimeout(() => focusableElement.focus(), 100);
      }
    }
  }, [active]);
  
  return containerRef;
}
