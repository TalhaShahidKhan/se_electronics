# Project Refactoring Summary

The project structure has been refactored to improve organization, readability, and scalability. This document outlines the changes made and how to navigate the new directory structure.

## 1. Directory Structure Overview

### Root Directory

The root directory has been cleaned up by moving non-core files into dedicated folders.

- `scripts/`: Contains all utility scripts, maintenance tools, and database checks.
- `docs/notes/`: Contains miscellaneous documentation, memos, and workflow notes.
- `src/`: Core application logic (Pages, Components, Actions, Utils).

### Components (`src/components/`)

The component library was previously a single flat directory. It has now been categorized into three main categories:

1.  **`ui/`**: Basic, reusable UI components (e.g., `Modal`, `Spinner`, `Button`, `InputField`).
2.  **`layout/`**: Structural components used for page layouts (e.g., `DashboardLayout`, `SideNavContext`).
3.  **`features/`**: Feature-specific components organized by domain.
    - `applications/`: Registration and application forms.
    - `auth/`: Login and token verification.
    - `customers/`: Customer profiles and lists.
    - `invoices/`: Generation and previewing of invoices.
    - `payments/`: Payment management and lists.
    - `services/`: Service tracking, lists, and view modals.
    - `staff/`: Staff profiles, ID cards, and lists.
    - `subscriptions/`: Subscription tracking.

## 2. Key Changes Made

### File Movement

- **Root -> `scripts/`**: Files like `check-*.ts`, `dump-*.ts`, `fix-*.ts`, and `.bat` files were moved.
- **`docs/` -> `docs/notes/`**: Sub-documentation files were organized into a notes folder.

### Component Reorganization

- All components were moved into their respective `ui`, `layout`, or `features/*` subfolders.
- The `src/components/index.ts` (barrel file) was completely updated to export all components from their new locations.
- Components that used relative imports (e.g., `import Modal from './Modal'`) were updated to use absolute imports (`@/components`) or corrected relative paths.

## 3. Scalability & Maintenance

### How to Add New Components

- **Generic UI**: Add to `src/components/ui/` and export from `src/components/index.ts`.
- **Feature Specific**: Create a new folder in `src/components/features/[feature_name]/`, add the component, and export it through `src/components/index.ts`.

### Best Practices

- **Imports**: Always prefer importing components from `@/components` to keep imports clean.
- **Server Actions**: Server actions remain organized in `src/actions/` by domain, mirroring the `features` folder in components.
- **Database**: The Drizzle schema is located in `src/db/schema.ts`. If it grows beyond 1,000 lines, consider splitting it into `src/db/schemas/` folder.

## 4. Immediate Benefits

- **Cleaner Root**: Easier to find configuration files.
- **Modular Components**: Reduced friction when looking for specific UI logic.
- **Improved Performance**: Better organization helps in identifying redundant code and optimizing imports.

---

_Refactoring completed on: 2024-03-07_
