# Coding Standards

This document defines coding conventions, naming rules, and documentation practices for the project. All developers and AI agents working on the codebase must follow these rules.

## Project Language

**All code, comments, file names, and documentation MUST be in English.**

Exceptions: User-facing content (labels, text) may be in Spanish as required by the client.

## Naming Conventions

### Variables and Constants

- **Data storage**: Use descriptive nouns — `projectList`, `activeIndex`, `siteConfig`
- **Booleans**: Use verb-based names — `isHovered`, `isDragging`, `hasMultiple`
- **Object references**: Name like the referenced object — `containerRef`, `trackRef`
- **Constants**: UPPER_SNAKE_CASE for top-level module constants, camelCase for object properties

### Functions

Function names start with a verb:

| Verb   | Usage                              | Example               |
|--------|------------------------------------|-----------------------|
| get    | Retrieve data from API/source      | `getProjects`         |
| set    | Assign a value                     | `setActiveIndex`      |
| create | Instantiate a new object           | `createGlassMaterial` |
| handle | Event handler                      | `handleMouseDown`     |
| build  | Construct/assemble something       | `buildBasis`          |

### Files and Folders

- **Components**: PascalCase — `HomeRotatingSlots.tsx`, `ProjectCard.tsx`
- **Utilities/helpers**: kebab-case with suffix — `image.helpers.ts`, `strapi-client.ts`
- **Models**: kebab-case with `.model.ts` — `project.model.ts`
- **API files**: kebab-case with `.api.ts` — `projects.api.ts`
- **Config**: kebab-case — `constants.ts`, `navigation.ts`

### Component Organization

Components are organized by domain in `src/components/`:

- `ui/` — Generic, reusable components (logos, buttons, icons)
- `layout/` — Layout-level components (header, footer, nav)
- `home/` — Home page specific components
- `proyecto/` — Project detail page components
- `about/` — About page components
- `contact/` — Contact page components

## Code Documentation (JSDoc)

### Single-Line Comments

For simple variables and straightforward elements:

```typescript
/** Strapi CMS backend URL */
export const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
```

### Multi-Line Comments

For complex functions and components:

```typescript
/**
 * Builds a full URL for a Strapi image asset.
 * Handles both absolute URLs (external storage) and relative URLs (local uploads).
 *
 * @param image - Strapi image object
 * @returns Full image URL or placeholder fallback
 */
export function getStrapiImageUrl(image: StrapiImage | undefined): string {
```

### Module-Level Comments

Each file should have a module-level JSDoc describing its purpose:

```typescript
/**
 * API functions for portfolio project data.
 *
 * @module lib/api/projects
 */
```

## Code Organization with Regions

Use `#region` / `#endregion` to organize TypeScript code into logical sections:

```typescript
//#region Environment
export const STRAPI_URL = '...';
//#endregion Environment

//#region Design tokens
export const COLORS = { ... };
//#endregion Design tokens
```

### Model File Regions

```typescript
//#region API
// Interfaces for API requests and responses
//#endregion API

//#region DTOs
// General interfaces and types
//#endregion DTOs
```

## HTML Documentation

Comment major template sections in JSX:

```tsx
return (
  <section>
    {/* HEADER */}
    <div>...</div>

    {/* MAIN CONTENT */}
    <div>
      {/* SLOT CAROUSEL */}
      <div>...</div>

      {/* NAVIGATION */}
      <div>...</div>
    </div>
  </section>
);
```

## Models and Interfaces

- Data structures MUST be defined as TypeScript interfaces in `src/models/`
- Each domain has its own `.model.ts` file
- All models are re-exported through `src/models/index.ts`
- API response interfaces end with `Response` when needed
- Use JSDoc to document each field's purpose

### Const Assertions (instead of Enums)

Do NOT use TypeScript `enum`. Use const assertion objects:

```typescript
export const COLORS = {
  accent: '#ff0000',
  black: '#000000',
} as const;
```

## Constants

Avoid magic strings and magic numbers. Define them in `src/config/constants.ts`:

```typescript
// Bad
style={{ width: '472px', height: '810px' }}

// Good
import { PROJECT_CARD } from '@/config/constants';
style={{ width: `${PROJECT_CARD.width}px`, height: `${PROJECT_CARD.height}px` }}
```

## Imports

Use path aliases consistently:

```typescript
import type { Project } from '@/models';
import { getProjects } from '@/lib/api';
import { getStrapiImageUrl } from '@/lib/helpers/image.helpers';
import { COLORS, FONT_FAMILY } from '@/config/constants';
import { ROUTES, NAV_LINKS } from '@/config/navigation';
```

## Summary

- **TypeScript**: JSDoc on all exports. Organize code with `#region` directives.
- **JSX**: Comment all major template sections.
- **Naming**: camelCase variables/functions, PascalCase components, kebab-case files.
- **Types**: Interfaces in `models/`, const assertions over enums.
- **Constants**: No magic values — centralize in `config/constants.ts`.
- **Imports**: Always use `@/` path aliases.
