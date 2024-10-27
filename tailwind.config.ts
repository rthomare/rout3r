import { withAccountKitUi, createColorSet } from "@account-kit/react/tailwind";

// wrap your existing tailwind config with 'withAccountKitUi'
export default withAccountKitUi({
  darkMode: ['selector', '[data-theme="dark"]'],
  content: [],
  theme: {
    extend: {},
  },
  plugins: [],
}, {
  colors: {
    "btn-primary": createColorSet("#000000", "#ffffff"),
    "fg-accent-brand": createColorSet("#000000", "#ffffff"),
  },
  borderRadius: "sm",
})