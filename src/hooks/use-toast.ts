
import * as React from "react";
import { toast as sonnerToast, type ToasterProps } from "sonner";

// Define our custom toast props type
export type ToastProps = ToasterProps & {
  title?: React.ReactNode;
  description?: React.ReactNode;
  autoClose?: boolean;
  autoCloseDelay?: number;
  hideProgressBar?: boolean;
  announcing?: boolean; // Whether to announce to screen readers
};

export function useToast() {
  return {
    toast: ({ title, description, announcing = true, ...props }: ToastProps) => {
      // Announce the toast message to screen readers
      if (announcing && description) {
        const liveRegion = document.createElement("div");
        liveRegion.setAttribute("aria-live", "polite");
        liveRegion.setAttribute("aria-atomic", "true");
        liveRegion.className = "sr-only";
        liveRegion.innerText = typeof description === "string" 
          ? description 
          : "Notification";
        
        document.body.appendChild(liveRegion);
        
        // Remove after announcement
        setTimeout(() => {
          document.body.removeChild(liveRegion);
        }, 3000);
      }
      
      return sonnerToast(title as string, { description, ...props });
    },
    toasts: [] // Add this to satisfy the type in toaster.tsx
  };
}

// For more straightforward usage
// Using a different name to avoid redeclaration
export const useToastSimple = ({ title, description, announcing = true, ...props }: ToastProps) => {
  // Announce the toast message to screen readers
  if (announcing && description) {
    const liveRegion = document.createElement("div");
    liveRegion.setAttribute("aria-live", "polite");
    liveRegion.setAttribute("aria-atomic", "true");
    liveRegion.className = "sr-only";
    liveRegion.innerText = typeof description === "string" 
      ? description 
      : "Notification";
    
    document.body.appendChild(liveRegion);
    
    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(liveRegion);
    }, 3000);
  }
  
  return sonnerToast(title as string, { description, ...props });
};

// Export toast as a function for direct usage
export const toast = {
  // Basic toast
  default: (props: ToastProps) => useToastSimple(props),
  
  // Success variant
  success: (props: ToastProps | string) => {
    if (typeof props === 'string') {
      return sonnerToast.success(props);
    }
    return sonnerToast.success(props.title as string, { description: props.description });
  },
  
  // Error variant
  error: (props: ToastProps | string) => {
    if (typeof props === 'string') {
      return sonnerToast.error(props);
    }
    return sonnerToast.error(props.title as string, { description: props.description });
  },
  
  // Warning variant
  warning: (props: ToastProps | string) => {
    if (typeof props === 'string') {
      return sonnerToast.warning(props);
    }
    return sonnerToast.warning(props.title as string, { description: props.description });
  },
  
  // Info variant
  info: (props: ToastProps | string) => {
    if (typeof props === 'string') {
      return sonnerToast.info(props);
    }
    return sonnerToast.info(props.title as string, { description: props.description });
  }
};
