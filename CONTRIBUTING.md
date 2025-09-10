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
bun run dev
```

3. Run the production build preview

```
bun run build && bun run preview
```

## File & Folder Structure

Consistency in file naming makes the project easier to navigate.

**Rules**

- Folders: kebab-case (`table-menu/`, `user-profile/`).
- React components: PascalCase (`Button.tsx`, `Select.tsx`).
- Hooks: camelCase starting with `use` (useMidi.ts).
- All other files: kebab-case (`utils.ts`, `parse-midi.ts`, `brand-logo.svg`).
- Tests & stories: Mirror the component filename (Button.test.tsx, Button.stories.tsx).
