import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        // Mapeia as variáveis CSS para as classes Tailwind
        poppins: ["var(--font-poppins)", "sans-serif"],
        nunito: ["var(--font-nunito)", "sans-serif"],
        mulish: ["var(--font-mulish)", "sans-serif"],
        "work-sans": ["var(--font-work-sans)", "sans-serif"],
        sans: ["var(--font-poppins)", "sans-serif"], // Poppins como a fonte sans padrão
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#7B2CBF", // Roxo Primário
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "0 84.2% 60.2%",
          foreground: "210 40% 98%",
        },
        muted: {
          DEFAULT: "220 14.3% 95.9%",
          foreground: "220 8.9% 46.1%",
        },
        accent: {
          DEFAULT: "220 14.3% 95.9%",
          foreground: "220.9 39.3% 11%",
        },
        popover: {
          DEFAULT: "0 0% 100%",
          foreground: "222.2 84% 4.9%",
        },
        card: {
          DEFAULT: "0 0% 100%",
          foreground: "222.2 84% 4.9%",
        },
        // Nova paleta de cores conforme o guia
        "purple-primary": "#7B2CBF",
        "lilac-soft": "#EEDCFF",
        "purple-medium": "#B682E0",
        "lavender-soft": "#F8E9FF",
        "dark-purple-text": "#442066",
        "rose-wine": "#AD267C",
        "gray-neutral": "#F5F5F5",
        "emotional-support": "#FFB3D1", // Mantido, pois é usado para ícones de urgência
        "default-option-border": "#D9C6F0", // Nova cor para borda padrão das opções
        // Novas cores para os efeitos de glow e timer
        "purple-dark-glow": "#5A1F99", // Roxo mais escuro para o glow do título
        "red-timer": "#DC2626", // Vermelho para o timer
        "metallic-purple": "#6A0DAD", // Roxo metálico para a borda externa
        "darker-purple-start": "#4A1C7A", // Novo roxo mais escuro para o gradiente do timer
        "darker-purple-end": "#6B26A0", // Novo roxo mais escuro para o gradiente do timer
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
