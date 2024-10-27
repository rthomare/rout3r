import { withAccountKitUi } from '@account-kit/react/tailwind';

/** @type {import('tailwindcss').Config} */
export default withAccountKitUi({
  content: ['./src/**/*.{html,js,jsx,ts,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
});
