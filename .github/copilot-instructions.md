# Sightread - Piano Learning Web Application

Sightread is a free and open-source React TypeScript web application for learning piano. Users can plug in MIDI keyboards and learn to play songs through an interactive interface with note visualization and real-time feedback.

**Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.**

## Technology Stack

- **Runtime**: Bun (package management, dev server, testing)
- **Framework**: React 19 with TypeScript 5.9
- **Routing**: React Router v7 (SPA mode)
- **Build Tool**: Vite 7.1
- **Styling**: Tailwind CSS 4.1
- **Testing**: Bun test with Jest-compatible API
- **Music Processing**: @tonejs/midi, Web MIDI API, custom parsers

## Required Environment Setup

### Install Bun
```bash
curl -fsSL https://bun.sh/install | bash
export PATH="$HOME/.bun/bin:$PATH"
```

### Environment Variables
Set this environment variable for builds to succeed:
```bash
export VITE_PUBLIC_GA_ID=mock-ga-id
```

## Bootstrap and Build Process

**CRITICAL TIMING NOTES:**
- Dependency installation: ~25 seconds
- Build: ~10 seconds
- Tests: <1 second
- Type checking: ~6 seconds
- Format checking: ~4 seconds

### 1. Install Dependencies
```bash
bun install
```
**Time: 25 seconds. NEVER CANCEL - use timeout of 60+ seconds.**

### 2. Build for Production
```bash
export VITE_PUBLIC_GA_ID=mock-ga-id
bun run build
```
**Time: 10 seconds. NEVER CANCEL - use timeout of 30+ seconds.**
**NOTE:** Build requires VITE_PUBLIC_GA_ID environment variable or it will fail.

### 3. Preview Production Build
```bash
export VITE_PUBLIC_GA_ID=mock-ga-id
bun run preview
```
Serves on http://localhost:8080/

## Development Workflow

### Development Server
```bash
export VITE_PUBLIC_GA_ID=mock-ga-id
bun run dev
```
Serves on http://localhost:5173/ with hot reload.
**Wait 5-10 seconds for Vite dependency optimization on first run.**

### Testing
```bash
bun run test
```
**Time: <1 second. Uses Bun's fast test runner.**

Watch mode:
```bash
bun run test:watch
```

### Code Quality

#### Format Code
```bash
bun run fmt
```

#### Check Formatting
```bash
bun run check-fmt
```
**Time: 4 seconds. NEVER CANCEL - use timeout of 15+ seconds.**

#### Type Checking
```bash
bun run check-types
```
**Time: 6 seconds. NEVER CANCEL - use timeout of 20+ seconds.**

## Validation and CI Requirements

**Before committing changes, ALWAYS run:**
1. `bun run test` - Ensure tests pass
2. `bun run check-fmt` - Ensure code is properly formatted
3. `export VITE_PUBLIC_GA_ID=mock-ga-id && bun run build` - Ensure build succeeds

**CI Process (from .github/workflows/validate.yml):**
```bash
bun install --frozen-lockfile
bun run test
bun run check-fmt
export VITE_PUBLIC_GA_ID=mock-ga-id && bun run build
```

## Manual Validation Scenarios

**ALWAYS test these user workflows after making changes:**

### 1. Homepage and Navigation
- Navigate to http://localhost:5173/
- Verify homepage loads with piano interface
- Test navigation: "Learn a song", "Free play", "About"

### 2. Song Selection and Learning
- Click "Learn a song" or navigate to /songs
- Verify song list loads with 16+ available songs
- Click on any song (e.g., "Ode to Joy")
- Verify song preview panel appears
- Click "Play Now"
- Verify learning interface loads at /play?id=...

### 3. Free Play Mode
- Navigate to /freeplay
- Verify free play interface loads with instrument selector

**Expected Console Messages:**
- MIDI permission warnings are normal in browser environments
- "Invalid instrument" warnings are expected and handled gracefully
- "Choosing the first two Piano tracks" warnings are normal

## Code Structure

### Key Directories
- `/src/features/` - Core functionality (MIDI, parsers, player, synth)
- `/src/pages/` - Page components and routing
- `/src/components/` - Reusable UI components
- `/src/hooks/` - Custom React hooks
- `/scripts/` - Utility scripts (render.ts for video generation)

### Important Files
- `react-router.config.ts` - Router configuration (SPA mode)
- `vite.config.ts` - Build configuration
- `tsconfig.json` - TypeScript configuration
- `.prettierrc` - Code formatting rules

### File Naming Conventions
- Folders: kebab-case (`song-preview/`)
- React components: PascalCase (`Button.tsx`)
- Hooks: camelCase starting with `use` (`useMidi.ts`)
- Other files: kebab-case (`utils.ts`, `parse-midi.ts`)

## Common Issues and Solutions

### Build Failures
- **Missing VITE_PUBLIC_GA_ID**: Set environment variable
- **Dependency issues**: Run `bun install` with clean cache

### Development Server Issues
- **504 Optimize Dep errors**: Wait for Vite dependency optimization (5-10 seconds)
- **MIDI errors**: Expected in browser without physical MIDI devices

### Testing
- **No ESLint script**: Project uses Prettier for formatting, no separate linting step
- **File system tests**: May fail in sandboxed environments

## Render Script (Advanced)

The `bun run render` script is for generating video content from MIDI files and requires:
- Local file paths in `/Users/jake/Movies/sightread-recordings`
- MP3 and MIDI file pairs
- FFmpeg for video processing

**Do not use this script for general development - it's specialized tooling.**

## Quick Reference Commands

```bash
# Complete development setup
curl -fsSL https://bun.sh/install | bash
export PATH="$HOME/.bun/bin:$PATH"
bun install

# Development
export VITE_PUBLIC_GA_ID=mock-ga-id
bun run dev

# Production build and test
export VITE_PUBLIC_GA_ID=mock-ga-id
bun run build
bun run preview

# Quality checks
bun run test
bun run check-fmt
bun run check-types

# Format code
bun run fmt
```