# Signify

Signify is a browser-based learning app for American Sign Language (ASL). It offers visual lessons, practice activities, quizzes, progress tracking, and an experimental camera coach for fingerspelling.

> ASL is a language used by Deaf communities in the United States and parts of Canada. Sign languages differ by country and region; this app currently teaches ASL.

## Features

- **Learn:** Explore the ASL alphabet, numbers, vocabulary, and sign details.
- **Visual references:** View schematic handshape and movement demonstrations, with written steps and common mistakes.
- **Practice:** Try visual recognition, multiple choice, gesture matching, memory challenges, and review of missed questions.
- **Quizzes:** Choose beginner, intermediate, or advanced quizzes and review results.
- **Progress:** Track learned items, daily activity, streaks, quiz results, mistakes, and badges. Progress is stored in this browser.
- **Camera coach:** Practice alphabet handshapes with a mirrored camera preview, hand landmarks, face framing, and approximate finger-bend feedback. Select a letter directly from an alphabet lesson or from the coach.

## Camera coach: what it checks

The coach is an experimental learning aid, not an ASL recognition system. It compares approximate bend/extension states for four fingers against the selected letter's schematic handshape. It also detects whether a face is in frame to help with camera positioning.

It does **not** check thumb placement, palm orientation, sign movement, facial expression or grammar, or whether a sign is linguistically correct. The movement in letters J and Z is shown in the lesson, but the camera coach checks only their starting handshape. Use the written lesson and a trusted reference or Deaf ASL instructor to verify signs.

## Requirements

- Node.js `^20.19.0` or `>=22.12.0` (required by the current Vite version)
- npm
- A modern browser
- For the camera coach: a camera, permission to use it, and a secure context (`localhost` during development or HTTPS when deployed)

An internet connection is needed to download the camera inference runtime and model files when the coach starts.

## Getting started

From the project directory:

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (typically `http://localhost:5173`). To use the camera coach, open **Practice → Camera coach** or choose **Practice with camera** from an alphabet lesson, then allow camera access when prompted.

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server. |
| `npm run build` | Type-check the TypeScript project and create a production build in `dist/`. |
| `npm run preview` | Serve the production build locally for a preview. Run `npm run build` first. |

## Privacy

Camera frames are processed in the browser by MediaPipe Tasks Vision; this app does not upload camera video or images to a server. The browser downloads the MediaPipe runtime from jsDelivr and hand/face model files from Google when starting the coach. The app does not need a backend for its current features.

Learning progress is saved in browser `localStorage` under the `signify:v1` key. It is not synced between devices. Clearing the browser's site data removes saved progress.

## Project structure

```text
src/
  components/   Shared layout, UI, sign demonstrations, and quiz components
  data/         Alphabet, vocabulary, and handshape reference data
  lib/          Motion, quiz, lesson, and local progress helpers
  pages/        App pages, including the camera coach
  App.tsx       Application routes
  index.css     Tailwind layers and global styles
```

## Technology

- React 18 and TypeScript
- Vite 7
- React Router
- Tailwind CSS
- Framer Motion
- MediaPipe Tasks Vision for in-browser hand landmarks and face detection

## Troubleshooting the camera

- **No camera or permission error:** Allow camera access in the browser's site settings. Check that the device has a camera and that another app is not using it.
- **Camera access is unavailable:** Use `localhost` for local development or deploy the app over HTTPS; browsers generally block camera access on insecure origins.
- **Models do not load:** Check your internet connection and reload the coach. Its runtime and model files are downloaded when the coach starts.
- **The hand is not detected:** Keep one hand fully visible in the preview and use clear lighting. Face detection is optional for fingerspelling.
- **The feedback does not match your sign:** The finger-bend check is approximate and can be affected by camera angle, lighting, and the handshape. It is not a correctness judgment.

## Learning and accuracy note

The illustrations are schematic learning aids and may simplify real signs. ASL meaning can depend on movement, location, orientation, facial expression, and context. Verify lessons against authoritative ASL references and, whenever possible, learn from Deaf teachers.
