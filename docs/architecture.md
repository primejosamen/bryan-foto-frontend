# Project Architecture

This document describes the technical architecture and project structure of bryan-foto-frontend. It is intended for developers and AI agents working on the codebase.

## Business Domain

Bryan Photography is a professional photography portfolio platform. The frontend displays projects, an about page, and contact information fetched from a Strapi CMS backend.

### Core Capabilities

- Portfolio project gallery with animated slot carousel
- Individual project detail pages with editorial photo layout
- About page with dynamic Strapi content blocks
- Contact page with social and location info
- 3D glass logo rendered with Three.js / React Three Fiber
- Responsive design with Framer Motion animations

## Project Structure

```
bryan-foto-frontend/
├── src/
│   ├── app/                          # Next.js App Router pages
│   │   ├── layout.tsx                # Root layout (fonts, metadata)
│   │   ├── page.tsx                  # Home page
│   │   ├── globals.css               # Global styles and Tailwind config
│   │   ├── about/page.tsx            # About page
│   │   ├── contacto/page.tsx         # Contact page
│   │   └── proyecto/[slug]/page.tsx  # Dynamic project detail page
│   ├── components/                   # UI components organized by domain
│   │   ├── ui/                       # Generic reusable components
│   │   │   ├── Logo3D.tsx            # Full-size 3D glass logo (home)
│   │   │   └── LogoSmall3D.tsx       # Small 3D glass logo (detail pages)
│   │   ├── layout/                   # Layout and navigation components
│   │   │   └── Header.tsx            # Site header with responsive nav
│   │   ├── home/                     # Home page specific components
│   │   │   ├── HomeRotatingSlots.tsx # Main slot carousel
│   │   │   ├── HomeStickyWork.tsx    # Horizontal scroll gallery variant
│   │   │   ├── HomeWorkCard.tsx      # Individual project card
│   │   │   └── HomeNavLink.tsx       # Navigation link (red pill style)
│   │   ├── proyecto/                 # Project detail components
│   │   │   ├── ProyectoDetailView.tsx # Editorial photo layout
│   │   │   ├── ProjectCard.tsx       # Project card (gallery variant)
│   │   │   └── ProjectGallery.tsx    # Horizontal scroll project gallery
│   │   ├── about/                    # About page components
│   │   │   └── AboutSection.tsx      # About content renderer
│   │   └── contact/                  # Contact page components
│   │       └── ContactSection.tsx    # Contact info list
│   ├── lib/                          # Libraries and utilities
│   │   ├── api/                      # Strapi API client layer
│   │   │   ├── strapi-client.ts      # Base HTTP client with ISR
│   │   │   ├── projects.api.ts       # Project fetch functions
│   │   │   ├── about.api.ts          # About fetch functions
│   │   │   ├── contact.api.ts        # Contact fetch functions
│   │   │   ├── global.api.ts         # Global config fetch functions
│   │   │   └── index.ts              # Barrel export
│   │   └── helpers/                  # Pure utility functions
│   │       └── image.helpers.ts      # Strapi image URL builder
│   ├── models/                       # TypeScript interfaces and types
│   │   ├── project.model.ts          # Project, StrapiImage, ImageFormat
│   │   ├── about.model.ts            # About, AboutBlock
│   │   ├── contact.model.ts          # ContactInfo
│   │   ├── global.model.ts           # GlobalConfig
│   │   └── index.ts                  # Barrel export
│   ├── config/                       # Application configuration
│   │   ├── constants.ts              # Design tokens, layout values, timing
│   │   └── navigation.ts             # Routes and navigation links
│   ├── shaders/                      # GLSL shader files for 3D logo
│   │   ├── test/vertex.glsl
│   │   └── case/case_glass_fragment.glsl
│   └── types/                        # TypeScript declarations
│       └── glsl.d.ts                 # Module declarations for .glsl files
├── public/                           # Static assets
│   ├── cdcase/                       # 3D model files (.glb)
│   └── textures/cubemap/             # Environment map textures
├── docs/                             # Project documentation
├── .env.example                      # Environment variable template
├── next.config.ts                    # Next.js configuration
├── tsconfig.json                     # TypeScript configuration
└── package.json                      # Dependencies and scripts
```

## Dependency Flow

```
pages (app/)  →  components/  →  lib/api/  →  strapi-client
                     │              │
                     └→  models/    └→  config/constants
                     └→  config/
                     └→  lib/helpers/
```

- **Pages** import components and API functions; they are thin orchestrators.
- **Components** import from `models/`, `config/`, and `lib/helpers/`. They never call APIs directly.
- **API layer** handles all HTTP communication with Strapi via the base client.
- **Models** are pure TypeScript interfaces with no dependencies.
- **Config** holds constants, design tokens, and navigation definitions.

## Key Technologies

| Technology        | Version | Purpose                               |
|-------------------|---------|---------------------------------------|
| Next.js           | 16.1    | Application framework (App Router)    |
| React             | 19.2    | UI library                            |
| TypeScript        | ~5.x    | Type safety                           |
| Tailwind CSS      | ~4.x    | Utility-first CSS                     |
| Framer Motion     | ~12.x   | Page and component animations         |
| Three.js          | ~0.182  | 3D rendering (glass logo)             |
| React Three Fiber | ~9.5    | React bindings for Three.js           |
| Drei              | ~10.7   | R3F helpers (GLTF loader, env maps)   |
| Axios             | ~1.13   | HTTP client (available, not primary)  |
| Strapi            | 5.33    | Headless CMS (backend)                |

## Build and Serve

```bash
npm run dev          # Development server (port 3000)
npm run build        # Production build
npm run start        # Serve production build
npm run lint         # ESLint check
```
