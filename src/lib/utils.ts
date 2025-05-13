
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ENGIE design tokens
export const tokens = {
  colors: {
    primary: "#00AAFF",
    dark: "#17255F",
    accent: "#00CFFF"
  },
  radius: "8px",
  shadowSm: "0 1px 2px rgba(0, 0, 0, 0.05)"
}
