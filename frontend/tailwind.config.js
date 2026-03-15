/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef7f7',
          100: '#d6ece9',
          200: '#add9d3',
          300: '#8dcec1',
          400: '#6bbdaa',
          500: '#4a9e8e',
          600: '#3d7a71',
          700: '#325e59',
          800: '#284742',
          900: '#164f4f',
          950: '#0a2f2f',
        },
        secondary: {
          50: '#fdf9f4',
          100: '#f9efe2',
          200: '#f2dfc5',
          300: '#e8c9a0',
          400: '#e1ad76',
          500: '#d9904d',
          600: '#c27634',
          700: '#9a5a2a',
          800: '#7c4823',
          900: '#5e371c',
          950: '#331f0e',
        },
        accent: {
          50: '#eef7f5',
          100: '#d6ece5',
          200: '#add9cb',
          300: '#8dcec1',
          400: '#6bbdaa',
          500: '#4a9e8e',
          600: '#3d7a71',
          700: '#325e59',
          800: '#284742',
          900: '#164f4f',
        },
        success: {
          DEFAULT: '#00d084',
          light: '#e6faf3',
        },
        warning: {
          DEFAULT: '#fcb900',
          light: '#fff9e6',
        },
        danger: {
          DEFAULT: '#f78da7',
          light: '#fdf2f5',
        },
        chart: {
          blue: '#0693e3',
          lightBlue: '#8ed1fc',
          purple: '#9b51e0',
          gray: '#abb8c3',
        }
      },
    },
  },
  plugins: [],
}
