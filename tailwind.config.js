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
          light: '#EEE5FF',
          hover: '#b99af4',
          primary: '#8147EB',
          dark: '#611AE5',
          darker: '#5326a6',
        },
        orange: {
          light: '#DC7E52',
          primary: '#EB7847',
          dark: '#CF4E17',
        },
        green: {
          light: '#44b22e',
        },
      },
    },
  },
  plugins: [],
}
