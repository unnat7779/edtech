/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Background Colors - 60% Dominant (Deep Blue)
        bg: {
          primary: "#0f172a",
          secondary: "#1e293b",
          tertiary: "#334155",
          accent: "#0f766e",
        },
        // Surface Colors - 30% Secondary (Green)
        surface: {
          primary: "#134e4a",
          secondary: "#115e59",
          tertiary: "#042f2e",
        },
        // Accent Colors - 10% (Yellow)
        accent: {
          primary: "#eab308",
          secondary: "#ca8a04",
          tertiary: "#a16207",
        },
        // Text Colors
        text: {
          primary: "#f8fafc",
          secondary: "#cbd5e1",
          tertiary: "#94a3b8",
          accent: "#34d399",
        },
        // Border Colors
        border: {
          primary: "#334155",
          secondary: "#475569",
          accent: "#0d9488",
        },
        // Status Colors
        status: {
          success: "#10b981",
          warning: "#f59e0b",
          error: "#ef4444",
          info: "#3b82f6",
        },
      },
      backgroundImage: {
        "gradient-primary": "linear-gradient(135deg, #134e4a 0%, #0f172a 100%)",
        "gradient-secondary": "linear-gradient(135deg, #0f766e 0%, #1e40af 100%)",
        "gradient-accent": "linear-gradient(135deg, #eab308 0%, #ca8a04 100%)",
        "gradient-cta": "linear-gradient(135deg, #10b981 0%, #0d9488 100%)",
        "gradient-card": "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
      },
      boxShadow: {
        "glow-primary": "0 0 20px rgba(20, 184, 166, 0.3)",
        "glow-secondary": "0 0 20px rgba(59, 130, 246, 0.3)",
        "glow-accent": "0 0 20px rgba(234, 179, 8, 0.3)",
        "inner-glow": "inset 0 0 15px rgba(20, 184, 166, 0.2)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.5s ease-out",
        "scale-in": "scaleIn 0.3s ease-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow-pulse": "glowPulse 2s ease-in-out infinite alternate",
      },
      keyframes: {
        glowPulse: {
          "0%": { boxShadow: "0 0 5px rgba(20, 184, 166, 0.2)" },
          "100%": { boxShadow: "0 0 20px rgba(20, 184, 166, 0.6)" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
