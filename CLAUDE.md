# BUG2 — Beach Buggy App (Cape May, NJ)

## What this app is
A ride-sharing app for golf cart rides in Cape May, NJ. Think Uber but for beach buggies.

## Project location
`/Users/tylerthomassen/Documents/BUG2`

## Tech stack
- React Native + Expo (expo-router)
- NativeWind (Tailwind for RN)
- Clerk for auth
- Stripe for payments
- Zustand for state
- TypeScript

## Key files
- `app/(auth)/welcome.tsx` — onboarding/welcome screen with swipeable slides and per-slide background images
- `app/(root)/(tabs)/home.tsx` — main home screen after login
- `app/_layout.tsx` — root layout, fonts loaded here
- `components/CustomButton.tsx` — reusable button component
- `tailwind.config.js` — custom fonts (Plus Jakarta Sans family) and colors
- `app.json` — app icon, splash screen config

## Fonts loaded
- Plus Jakarta Sans (Regular, Bold, ExtraBold, ExtraLight, Light, Medium, SemiBold)
- Gordita-Bold
- LibreBodoni-BoldItalic (used for "Buggy" logo text on welcome screen)
- Oswald-Bold — NOT YET ADDED (user plans to add for title font experiment)

## Welcome screen notes
- 3 slides with individual background images (ScrollView pagingEnabled, not react-native-swiper)
- Slide 1: `cape-may.webp`
- Slide 2: `lighthouseWelcome.png`
- Slide 3: `cape-may-beach.jpg`
- Logo + buttons float absolutely on top with `pointerEvents="box-none"`
- react-native-swiper was removed — replaced with native ScrollView due to touch blocking issues

## Assets
- App icon: `assets/images/icon.png` (Beach Buggy logo — yellow/blue)
- Adaptive icon: `assets/images/adaptive-icon.png` (same)
- Splash screen: `assets/images/splash.png` (BuggySplash — yellow background with Beach Buggy logo)
- In-app logo: `assets/images/buggyicon.png`

## Pending / TODO
- Add Oswald-Bold.ttf font to `assets/fonts/` then register in `_layout.tsx` and use for slide titles
