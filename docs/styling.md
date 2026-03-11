# Styling Strategy

This document defines the theming and styling approach for the project.

## Main Styling Libraries

- **Tailwind CSS v4**: Utility-first CSS framework. Primary tool for layout and spacing.
- **CSS Custom Properties**: Design tokens defined in `globals.css` for typography and colors.
- **Framer Motion**: Animation library for page transitions and interactive elements.

## Design Tokens

All design tokens are centralized in two places:

1. **`src/config/constants.ts`** — TypeScript constants for use in components
2. **`src/app/globals.css`** — CSS custom properties for use in stylesheets

### Typography

The project uses **IBM Plex Sans** loaded via `next/font/google` in `layout.tsx`.

Font sizes follow the design spec with pt-to-px conversions:
- Title: 57px (42.7pt)
- Body: 24px (18pt)
- Nav: 16px
- Small: 14px
- Label: 13px
- Caption: 11px

### Colors

Brand palette:
- Accent: `#ff0000` (used for nav pills, indicators, hover labels)
- Background: `#ffffff` (home), `#000000` (detail/about/contact)
- Text: `#000000` (on white), `#ffffff` (on black)

## Best Practices

### Prefer Tailwind utilities over inline styles

```tsx
// Bad
<div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>

// Good
<div className="flex gap-4 items-center">
```

### Use constants for repeated magic values

```tsx
// Bad
style={{ width: '472px', background: '#ff0000' }}

// Good
import { PROJECT_CARD, COLORS } from '@/config/constants';
style={{ width: `${PROJECT_CARD.width}px`, background: COLORS.accent }}
```

### Use CSS custom properties for font family

```tsx
// Bad
style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}

// Good
import { FONT_FAMILY } from '@/config/constants';
style={{ fontFamily: FONT_FAMILY }}
```

### CSS files location

- **Global styles**: `src/app/globals.css`
- **Component-specific CSS**: Only when Tailwind utilities are insufficient

### Variable consistency

Always use CSS variables or constants instead of hardcoded values:
- Use `var(--font-ibm-plex-sans)` in CSS
- Use `FONT_FAMILY` constant in TSX
- Use `COLORS.accent` instead of `'#ff0000'`
