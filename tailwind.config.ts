
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: '#00AAFF',
					foreground: '#FFFFFF'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: '#00CFFF',
					foreground: '#FFFFFF'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				dark: '#17255F',
			},
			borderRadius: {
				lg: 'var(--radius, 8px)',
				md: 'calc(var(--radius, 8px) - 2px)',
				sm: 'calc(var(--radius, 8px) - 4px)'
			},
			boxShadow: {
				'sm': '0 1px 2px rgba(0,0,0,.05)',
			},
			fontFamily: {
				sans: ['Segoe UI', 'system-ui', 'sans-serif'],
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'fade-in': {
					from: { 
						opacity: '0',
						transform: 'translateY(4px)'
					},
					to: { 
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'fade-out': {
					from: { 
						opacity: '1',
						transform: 'translateY(0)'
					},
					to: { 
						opacity: '0',
						transform: 'translateY(4px)'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.1s ease-out',
				'fade-out': 'fade-out 0.1s ease-out'
			},
			transitionDuration: {
				'DEFAULT': '100ms',
			},
			transitionTimingFunction: {
				'DEFAULT': 'cubic-bezier(0.4, 0, 0.2, 1)',
				'out': 'ease-out',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
