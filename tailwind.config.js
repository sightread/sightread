/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    screens: {
      sm: '650px',
      md: '800px',
      lg: '1100px',

      // This breakpoint exists solely for right padding on the AppBar GitHub Icon
      // Ideally come up with something better
      lgminus: '1130px',
    },
    extend: {
      fontSize: {
        reponsive2Xl: 'clamp(1.7rem, 1rem + 3vw, 4rem)',
        reponsiveXl: 'clamp(1rem, 1rem + 1vw, 1.2rem)',
      },
      colors: {
        purple: {
          lightest: '#F7F4FE',
          light: '#EEE5FF',
          hover: '#b99af4',
          primary: '#8147EB',
          dark: '#611AE5',
          darker: '#5326a6',
          darkest: '#280A6C',
        },
        orange: {
          light: '#DC7E52',
          primary: '#EB7847',
          dark: '#CF4E17',
        },
        green: {
          light: '#44b22e',
        },
        // MIDISHARE COLORS
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
    },
  },
  plugins: [],
}
