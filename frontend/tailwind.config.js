/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
        kandjou: {
          green: "#0f7b3f",
          light: "#e9f5ee",
          dark: "#0c6232",
        },
        navy: "#0F172A",
        cobalt: "#2563EB",
        emerald: "#10B981",
        coral: "#F43F5E",
      },
      fontFamily: {
        jakarta: ['Plus Jakarta Sans', 'sans-serif'],
        fraunces: ['Fraunces', 'serif'],
        inter: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
