# Contribution Guide

Thanks for your interest in contributing to **sightread**.

## Development Setup

We use [Bun](https://bun.sh/) for package management, dev server, and testing.

1. Install dependencies

```
bun install
```

2. Run the development server

```
export VITE_PUBLIC_GA_ID=stub
bun run dev --host
```

3. Run the production build preview

```
bun run build && bun run preview
```

Building for alternative paths (example)

```
VITE_PUBLIC_GA_ID=stub \
VITE_PUBLIC_ASSET_BASE=/api/sightread/ \
VITE_PUBLIC_ROUTER_BASENAME=/api/sightread \
bun run build
```

## File & Folder Structure

Consistency in file naming makes the project easier to navigate.

**Rules**

- Folders: kebab-case (`table-menu/`, `user-profile/`).
- React components: PascalCase (`Button.tsx`, `Select.tsx`).
- Hooks: camelCase starting with `use` (useMidi.ts).
- All other files: kebab-case (`utils.ts`, `parse-midi.ts`, `brand-logo.svg`).
- Tests & stories: Mirror the component filename (Button.test.tsx, Button.stories.tsx).
