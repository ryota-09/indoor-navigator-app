# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an **indoor navigation app** project built with **Expo/React Native**. The app allows users to create, share, and navigate through indoor maps of facilities like stations, shopping centers, and other buildings.

### Key Features (Planned)
- Indoor map creation with drag-and-drop template elements
- Map sharing and community features
- Route calculation between locations within buildings
- Multi-floor support
- Rating and moderation system

### Implemented Features
- ✅ **Firebase Authentication System** (Issue #2)
  - Email/password registration and login
  - Session persistence with AsyncStorage
  - Automatic navigation based on auth state
  - User profile management
  - Secure logout functionality

## Development Commands

### Core Commands
- `npm install` - Install dependencies
- `npx expo start` - Start development server with Metro bundler
- `npm run start` - Alternative way to start Expo dev server
- `expo start --android` - Start with Android emulator
- `expo start --ios` - Start with iOS simulator  
- `expo start --web` - Start web version
- `npm run lint` - Run ESLint with Expo config

### Project Reset
- `npm run reset-project` - Move current code to `/app-example` and create clean `/app` directory for fresh start

## Project Structure

### Current State
The project currently contains **example/template code** from `create-expo-app`. The actual app implementation has not started yet.

### Key Directories
- `/app/` - Main application code using Expo Router file-based routing
- `/app-example/` - Template/example code (reference only)
- `/components/` - Reusable React Native components
- `/hooks/` - Custom React hooks
- `/constants/` - App constants (colors, themes, etc.)
- `/assets/` - Static assets (images, fonts)

### Architecture Notes
- **Routing**: Uses Expo Router with file-based routing system
- **Styling**: Themed components with light/dark mode support
- **Navigation**: Tab-based navigation structure in `(tabs)` directory
- **TypeScript**: Strict TypeScript configuration with path aliases (`@/*`)
- **Platform Support**: iOS, Android, and Web (universal app)

## Technical Configuration

### Key Technologies
- **Expo SDK ~53.0** with New Architecture enabled
- **React 19.0** / **React Native 0.79**
- **Expo Router 5.1** for navigation
- **TypeScript** with strict mode
- **ESLint** with Expo configuration

### Important Settings
- **New Architecture**: Enabled in app.json (`newArchEnabled: true`)
- **Typed Routes**: Experimental feature enabled for type-safe navigation
- **Path Aliases**: `@/*` maps to project root
- **Platforms**: Supports tablets on iOS, edge-to-edge on Android

## Development Workflow

### Getting Started
1. The project template is ready but actual implementation hasn't begun
2. Consider running `npm run reset-project` to start with a clean app structure
3. Refer to `/app-example/` for component patterns and structure examples
4. GitHub issues #1-#17 contain the planned features and implementation roadmap

### Code Patterns
- Components use themed styling (see `ThemedText`, `ThemedView`)
- Platform-specific code uses `.ios.tsx` and `.web.ts` extensions
- Expo symbols and vector icons for consistent iconography
- Gesture handling and animations with Reanimated

### Phase-Based Development
The project is planned for staged development:
- **Phase 1 (MVP)**: Basic map creation, viewing, and search (#1-#7)
- **Phase 2**: Quality improvements like ratings and route search (#8-#10)  
- **Phase 3**: Advanced features like multi-floor and social features (#11-#14)
- **Phase 4**: Monetization and B2B API (#15-#17)