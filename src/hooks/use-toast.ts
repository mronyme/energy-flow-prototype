
import * as React from "react";
import { toast as sonnerToast, type ToasterProps } from "sonner";

export type ToastProps = ToasterProps & {
  // Custom props
  autoClose?: boolean;
  autoCloseDelay?: number;
  hideProgressBar?: boolean;
  announcing?: boolean; // Whether to announce to screen readers
};

export function useToast() {
  return {
    toast: ({ announcing = true, ...props }: ToastProps) => {
      // Announce the toast message to screen readers
      if (announcing && props.description) {
        const liveRegion = document.createElement("div");
        liveRegion.setAttribute("aria-live", "polite");
        liveRegion.setAttribute("aria-atomic", "true");
        liveRegion.className = "sr-only";
        liveRegion.innerText = typeof props.description === "string" 
          ? props.description 
          : "Notification";
        
        document.body.appendChild(liveRegion);
        
        // Remove after announcement
        setTimeout(() => {
          document.body.removeChild(liveRegion);
        }, 3000);
      }
      
      return sonnerToast(props);
    },
    toasts: [] // Add this to satisfy the type in toaster.tsx
  };
}

// For more straightforward usage
export const toast = ({ announcing = true, ...props }: ToastProps) => {
  // Announce the toast message to screen readers
  if (announcing && props.description) {
    const liveRegion = document.createElement("div");
    liveRegion.setAttribute("aria-live", "polite");
    liveRegion.setAttribute("aria-atomic", "true");
    liveRegion.className = "sr-only";
    liveRegion.innerText = typeof props.description === "string" 
      ? props.description 
      : "Notification";
    
    document.body.appendChild(liveRegion);
    
    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(liveRegion);
    }, 3000);
  }
  
  return sonnerToast(props);
};
