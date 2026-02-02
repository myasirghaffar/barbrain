# The Oche – Darts Scoring App

Mobile darts scoring app for quick 301/501 games on a single device. This MVP focuses on pub-friendly scoring, offline-first behaviour, and a clean, readable UI.

### Features

- **Game modes**: 301 or 501
- **Players**: 2–4 players per game (name only)
- **Rules**:
  - Optional **Double-Out** toggle
  - Bust logic (over-scoring, leaving 1 with double-out, invalid finishes)
  - Exact checkout required, with optional “finished on double” confirmation
- **Gameplay**:
  - Simple numeric score entry (0–180)
  - Automatic turn rotation between players
  - **Undo last turn** (restores scores and turn order)
  - Local game state persistence so a game survives app reloads
- **Summary**:
  - Clear winner display
  - Start a brand new game
  - Rematch with the same players and settings

---

## Project Structure

- **`src/App.js`**: App entry, navigation setup, and initial route resolution based on any saved game.
- **`src/screens/`**
  - `HomeScreen` – Start a new game.
  - `GameSetupScreen` – Configure 301/501, double-out, legs meta, and add 2–4 players.
  - `GameScreen` – Main scoring UI with scoreboard, score input, and undo.
  - `GameSummaryScreen` – Winner + final scores, with options for new game or rematch.
- **`src/components/`**
  - `PlayerList` – Simple scrollable list of players.
  - `ScoreInput` – Numeric score input + “finished on double” toggle.
  - `TurnIndicator` – Shows current player and remaining score.
  - `UndoButton` – Reverts the last turn.
- **`src/logic/`**
  - `gameEngine.js` – Pure game rules: validation, scoring, bust logic, finish logic, turn rotation, and undo.
- **`src/storage/`**
  - `localGameStore.js` – AsyncStorage wrapper for persisting the current game state offline.
- **`src/types/`**
  - `Player.js` – Player model / helpers.
  - `Game.js` – Game model / helpers (designed for future team and competition support).

The code is kept deliberately small and readable, with clear separation between UI, game logic, and persistence.

---

## Requirements

- Node.js **20+**
- React Native CLI environment for iOS/Android:
  - Xcode + iOS Simulator for iOS builds (macOS)
  - Android Studio + Android SDK + an emulator or device for Android

All dependencies are declared in `package.json`.

---

## Setup & Installation

From the project root:

```bash
npm install
```

If you haven’t already set up React Native’s native tooling on this machine, follow the **React Native CLI** setup guide for your platform before continuing.

---

## Running the App Locally

### Start the Metro bundler

In one terminal:

```bash
npm start
```

### Run on Android

With an Android emulator running or a device connected:

```bash
npm run android
```

### Run on iOS (macOS only)

With an iOS simulator available:

```bash
npm run ios
```

This uses the standard React Native CLI commands under the hood.

---

## Building an Installable Binary

### Android – Generate an APK (debug)

For a quick, installable debug APK:

```bash
cd android
./gradlew assembleDebug
```

The generated APK will be at:

- `android/app/build/outputs/apk/debug/app-debug.apk`

You can install it on a device or emulator with:

```bash
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

For a signed release APK, follow the standard React Native guide for generating a keystore and configuring `android/app/build.gradle`.

### iOS – Archive / TestFlight

For iOS, use Xcode:

1. Open the workspace:
   - `ios/LLHAR.xcworkspace`
2. Choose a device (physical or generic iOS Device).
3. Use `Product > Archive` to create an archive.
4. Distribute via TestFlight or Ad Hoc as needed.

These steps follow the usual React Native + Xcode release pipeline.

---

## Gameplay Notes

- Scores must be between **0 and 180** per turn.
- A **bust** occurs when:
  - The entered score exceeds the remaining score, or
  - The remaining score would become **1** when **Double-Out** is enabled, or
  - The player tries to finish on 0 with Double-Out enabled but does **not** confirm a double checkout.
- The app asks you (via a toggle) to confirm if the winning checkout was on a double whenever Double-Out is turned on and a score would reduce the player to exactly 0.
- Undo fully restores:
  - The previous remaining score for the affected player.
  - The correct current player in the turn order.
  - Game status and winner (if you undo a winning turn).

All game state is stored locally on the device; there is no backend, login, or network dependency.

---

## Future-Proofing

The data models are structured to support:

- **Team mode**: Teams with multiple players and future team-based turn rotation.
- **Competitions / knockouts**: Games can be associated with higher-level competition or match IDs later without breaking the current MVP.

No team or tournament UI is implemented in this version.
