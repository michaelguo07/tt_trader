import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: { 50: '#fef7ee', 100: '#fdedd6', 200: '#f9d7ac', 300: '#f4ba77', 400: '#ee9240', 500: '#ea751d', 600: '#db5b13', 700: '#b54412', 800: '#903617', 900: '#742f16', 950: '#3f1509' },
      },
    },
  },
  plugins: [],
};
export default config;
