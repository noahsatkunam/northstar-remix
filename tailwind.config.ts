import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
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
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
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
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			},
  			cta: {
  				DEFAULT: 'hsl(var(--cta))',
  				foreground: 'hsl(var(--cta-foreground))',
  				hover: 'hsl(var(--cta-hover))'
  			},
  			gray: {
  				50: 'hsl(var(--gray-50))',
  				100: 'hsl(var(--gray-100))',
  				200: 'hsl(var(--gray-200))',
  				300: 'hsl(var(--gray-300))',
  				400: 'hsl(var(--gray-400))',
  				500: 'hsl(var(--gray-500))',
  				600: 'hsl(var(--gray-600))',
  				700: 'hsl(var(--gray-700))',
  				800: 'hsl(var(--gray-800))',
  				900: 'hsl(var(--gray-900))',
  				950: 'hsl(var(--gray-950))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
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
      'shimmer': {
        '0%': {
          backgroundPosition: '200% 0'
        },
        '100%': {
          backgroundPosition: '-200% 0'
        }
      },
      'fade-in': {
  				from: {
  					opacity: '0'
  				},
  				to: {
  					opacity: '1'
  				}
  			},
  			'slide-up': {
  				from: {
  					opacity: '0',
  					transform: 'translateY(10px)'
  				},
  				to: {
  					opacity: '1',
  					transform: 'translateY(0)'
  				}
  			},
  			'scale-in': {
  				from: {
  					opacity: '0',
  					transform: 'scale(0.95)'
  				},
  				to: {
  					opacity: '1',
  					transform: 'scale(1)'
  				}
  			},
  			'underline-slide': {
  				from: {
  					transform: 'scaleX(0)'
  				},
  				to: {
  					transform: 'scaleX(1)'
  				}
  			},
  			'subtle-glow': {
  				'0%, 100%': {
  					boxShadow: '0 0 0 0 hsl(var(--primary) / 0)'
  				},
  				'50%': {
  					boxShadow: '0 0 20px 4px hsl(var(--primary) / 0.3)'
  				}
  			},
  			'stagger-in': {
  				from: {
  					opacity: '0',
  					transform: 'translateY(-8px)'
  				},
  				to: {
  					opacity: '1',
  					transform: 'translateY(0)'
  				}
  			},
  			'fade-in-up': {
  				from: {
  					opacity: '0',
  					transform: 'translateY(12px)'
  				},
  				to: {
  					opacity: '1',
  					transform: 'translateY(0)'
  				}
  			},
  			'shake': {
  				'0%, 100%': {
  					transform: 'translateX(0)'
  				},
  				'10%, 30%, 50%, 70%, 90%': {
  					transform: 'translateX(-4px)'
  				},
  				'20%, 40%, 60%, 80%': {
  					transform: 'translateX(4px)'
  				}
  			},
  			'pulse-success': {
  				'0%, 100%': {
  					boxShadow: '0 0 0 0 rgba(34, 197, 94, 0)'
  				},
  				'50%': {
  					boxShadow: '0 0 20px 4px rgba(34, 197, 94, 0.4)'
  				}
  			},
  			'gradient-shift': {
  				'0%, 100%': {
  					backgroundPosition: '0% 50%'
  				},
  				'50%': {
  					backgroundPosition: '100% 50%'
  				}
  			},
  			'float': {
  				'0%, 100%': {
  					transform: 'translateY(0)'
  				},
  				'50%': {
  					transform: 'translateY(-10px)'
  				}
  			},
  			'bounce-subtle': {
  				'0%, 100%': {
  					transform: 'translateY(0)'
  				},
  				'50%': {
  					transform: 'translateY(8px)'
  				}
  			}
  		},
  		animation: {
      'accordion-down': 'accordion-down 0.2s ease-out',
      'accordion-up': 'accordion-up 0.2s ease-out',
      'shimmer': 'shimmer 8s linear infinite',
      'fade-in': 'fade-in 0.3s ease-out',
  			'slide-up': 'slide-up 0.4s ease-out',
  			'scale-in': 'scale-in 0.2s ease-out',
  			'underline-slide': 'underline-slide 0.25s ease-out forwards',
  			'subtle-glow': 'subtle-glow 2s ease-in-out infinite',
  			'stagger-in': 'stagger-in 0.3s ease-out forwards',
  			'fade-in-up': 'fade-in-up 0.3s ease-out forwards',
  			'shake': 'shake 0.4s ease-in-out',
  			'pulse-success': 'pulse-success 2s ease-in-out infinite',
  			'gradient-shift': 'gradient-shift 10s ease-in-out infinite',
  			'float': 'float 6s ease-in-out infinite',
  			'bounce-subtle': 'bounce-subtle 2s ease-in-out infinite'
  		},
  		fontFamily: {
  			sans: [
  				'Space Grotesk',
  				'ui-sans-serif',
  				'system-ui',
  				'-apple-system',
  				'BlinkMacSystemFont',
  				'Segoe UI',
  				'Roboto',
  				'Helvetica Neue',
  				'Arial',
  				'Noto Sans',
  				'sans-serif'
  			],
  			serif: [
  				'Lora',
  				'ui-serif',
  				'Georgia',
  				'Cambria',
  				'Times New Roman',
  				'Times',
  				'serif'
  			],
  			mono: [
  				'Space Mono',
  				'ui-monospace',
  				'SFMono-Regular',
  				'Menlo',
  				'Monaco',
  				'Consolas',
  				'Liberation Mono',
  				'Courier New',
  				'monospace'
  			]
  		},
  		boxShadow: {
  			'2xs': 'var(--shadow-2xs)',
  			xs: 'var(--shadow-xs)',
  			sm: 'var(--shadow-sm)',
  			md: 'var(--shadow-md)',
  			lg: 'var(--shadow-lg)',
  			xl: 'var(--shadow-xl)',
  			'2xl': 'var(--shadow-2xl)',
  			soft: 'var(--shadow-soft)',
  			elevated: 'var(--shadow-elevated)'
  		},
  		transitionDuration: {
  			fast: '150ms',
  			DEFAULT: '250ms',
  			slow: '400ms'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
