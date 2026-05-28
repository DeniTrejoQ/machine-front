import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        fleet: {
          50: "#eff6ff",
          100: "#dbeafe",
          600: "#1d6ed0",
          700: "#1558a8",
          800: "#0f3975",
          900: "#0a2550",
          950: "#07172f"
        }
      },
      boxShadow: {
        enterprise: "0 20px 50px rgba(15, 35, 70, 0.10)"
      }
    }
  },
  plugins: []
};

export default config;
