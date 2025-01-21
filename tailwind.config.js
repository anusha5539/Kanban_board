/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,tsx,jsx}",
  ],
  theme: {
    extend: {
      colors:{
        "mainBackgroundColor":'#0D1117',
        "columnBackgroundColor":'#161C22'
      }
    },
  },
  plugins: [],
}

