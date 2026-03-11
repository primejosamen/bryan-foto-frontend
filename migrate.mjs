/**
 * Migration script — bryan-foto-frontend restructuring
 * Run from the project root: node migrate.mjs
 */

import { existsSync, mkdirSync, renameSync, unlinkSync, readdirSync, readFileSync, writeFileSync, statSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

const ROOT = process.cwd();

function log(msg, color = '\x1b[0m') {
  console.log(`${color}${msg}\x1b[0m`);
}

// ─── 1. Create new folder structure ───
log('\n[1/6] Creating new folder structure...', '\x1b[33m');

const folders = [
  'src/models',
  'src/config',
  'src/lib/api',
  'src/lib/helpers',
  'src/components/ui',
  'src/components/layout',
  'src/components/home',
  'src/components/proyecto',
  'src/components/about',
  'src/components/contact',
  'docs',
];

for (const f of folders) {
  const p = join(ROOT, f);
  if (!existsSync(p)) {
    mkdirSync(p, { recursive: true });
    log(`  Created: ${f}`, '\x1b[90m');
  }
}

// ─── 2. Move components to domain folders ───
log('\n[2/6] Moving components to domain folders...', '\x1b[33m');

const moves = {
  'src/components/Logo3D.tsx': 'src/components/ui/Logo3D.tsx',
  'src/components/LogoSmall3D.tsx': 'src/components/ui/LogoSmall3D.tsx',
  'src/components/Header.tsx': 'src/components/layout/Header.tsx',
  'src/components/HomeRotatingSlots.tsx': 'src/components/home/HomeRotatingSlots.tsx',
  'src/components/HomeStickyWork.tsx': 'src/components/home/HomeStickyWork.tsx',
  'src/components/HomeWorkCard.tsx': 'src/components/home/HomeWorkCard.tsx',
  'src/components/ProyectoDetailView.tsx': 'src/components/proyecto/ProyectoDetailView.tsx',
  'src/components/ProjectCard.tsx': 'src/components/proyecto/ProjectCard.tsx',
  'src/components/ProjectGallery.tsx': 'src/components/proyecto/ProjectGallery.tsx',
  'src/components/AboutSection.tsx': 'src/components/about/AboutSection.tsx',
  'src/components/ContactSection.tsx': 'src/components/contact/ContactSection.tsx',
};

for (const [src, dst] of Object.entries(moves)) {
  const srcPath = join(ROOT, src);
  const dstPath = join(ROOT, dst);
  if (existsSync(srcPath)) {
    renameSync(srcPath, dstPath);
    log(`  Moved: ${src} -> ${dst}`, '\x1b[90m');
  }
}

// Remove old files replaced by new structure
const toRemove = ['src/components/index.ts', 'src/lib/strapi.ts'];
for (const f of toRemove) {
  const p = join(ROOT, f);
  if (existsSync(p)) {
    unlinkSync(p);
    log(`  Removed: ${f}`, '\x1b[90m');
  }
}

// ─── 3. Update imports in all .tsx/.ts files ───
log('\n[3/6] Updating imports across all files...', '\x1b[33m');

function getAllTsFiles(dir) {
  const results = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (entry === 'node_modules' || entry === '.next' || entry === 'dist') continue;
    const stat = statSync(full);
    if (stat.isDirectory()) {
      results.push(...getAllTsFiles(full));
    } else if (/\.(tsx?|mts|cts)$/.test(entry)) {
      results.push(full);
    }
  }
  return results;
}

// Import replacements (order matters — most specific first)
const importReplacements = [
  // ── API function imports from strapi.ts ──
  [
    "import { getProyectoBySlug, getProyectos } from '@/lib/strapi'",
    "import { getProjectBySlug, getProjects } from '@/lib/api'",
  ],
  [
    "import { getProyectoBySlug } from '@/lib/strapi'",
    "import { getProjectBySlug } from '@/lib/api'",
  ],
  [
    "import { getProyectos } from '@/lib/strapi'",
    "import { getProjects } from '@/lib/api'",
  ],
  [
    "import { getAbout } from '@/lib/strapi'",
    "import { getAbout } from '@/lib/api'",
  ],
  [
    "import { getContacto } from '@/lib/strapi'",
    "import { getContact } from '@/lib/api'",
  ],
  [
    "import { getGlobal } from '@/lib/strapi'",
    "import { getGlobalConfig } from '@/lib/api'",
  ],
  // ── Type + helper mixed imports ──
  [
    "import { Proyecto, StrapiImage, getStrapiImageUrl } from '@/lib/strapi'",
    "import type { Project, StrapiImage } from '@/models';\nimport { getStrapiImageUrl } from '@/lib/helpers/image.helpers'",
  ],
  [
    "import { Proyecto, getStrapiImageUrl } from '@/lib/strapi'",
    "import type { Project } from '@/models';\nimport { getStrapiImageUrl } from '@/lib/helpers/image.helpers'",
  ],
  [
    "import { About, getStrapiImageUrl } from '@/lib/strapi'",
    "import type { About } from '@/models';\nimport { getStrapiImageUrl } from '@/lib/helpers/image.helpers'",
  ],
  // ── Pure type imports ──
  [
    "import { Proyecto } from '@/lib/strapi'",
    "import type { Project } from '@/models'",
  ],
  [
    "import { Contacto } from '@/lib/strapi'",
    "import type { ContactInfo } from '@/models'",
  ],
  [
    "import { getStrapiImageUrl } from '@/lib/strapi'",
    "import { getStrapiImageUrl } from '@/lib/helpers/image.helpers'",
  ],
  // ── Component imports: flat -> domain ──
  ["from '@/components/Logo3D'", "from '@/components/ui/Logo3D'"],
  ["from '@/components/LogoSmall3D'", "from '@/components/ui/LogoSmall3D'"],
  ["from '@/components/Header'", "from '@/components/layout/Header'"],
  ["from '@/components/HomeRotatingSlots'", "from '@/components/home/HomeRotatingSlots'"],
  ["from '@/components/HomeStickyWork'", "from '@/components/home/HomeStickyWork'"],
  ["from '@/components/HomeWorkCard'", "from '@/components/home/HomeWorkCard'"],
  ["from '@/components/ProyectoDetailView'", "from '@/components/proyecto/ProyectoDetailView'"],
  ["from '@/components/ProjectCard'", "from '@/components/proyecto/ProjectCard'"],
  ["from '@/components/ProjectGallery'", "from '@/components/proyecto/ProjectGallery'"],
  ["from '@/components/AboutSection'", "from '@/components/about/AboutSection'"],
  ["from '@/components/ContactSection'", "from '@/components/contact/ContactSection'"],
  // ── Relative imports within moved components ──
  ["from './Logo3D'", "from '@/components/ui/Logo3D'"],
  ["from './LogoSmall3D'", "from '@/components/ui/LogoSmall3D'"],
];

// Word replacements for type names and function calls
const wordReplacements = [
  [/\bProyecto\b/g, 'Project'],
  [/\bContacto\b/g, 'ContactInfo'],
  [/\bgetProyectos\b/g, 'getProjects'],
  [/\bgetProyectoBySlug\b/g, 'getProjectBySlug'],
  [/\bgetContacto\b/g, 'getContact'],
  [/\bgetGlobal\b/g, 'getGlobalConfig'],
];

const srcDir = join(ROOT, 'src');
const files = getAllTsFiles(srcDir);
let updatedCount = 0;

for (const file of files) {
  let content = readFileSync(file, 'utf-8');
  const original = content;

  // Apply string replacements (import lines)
  for (const [find, replace] of importReplacements) {
    content = content.replaceAll(find, replace);
  }

  // Apply regex word replacements (type names, function calls)
  for (const [regex, replace] of wordReplacements) {
    content = content.replace(regex, replace);
  }

  if (content !== original) {
    writeFileSync(file, content, 'utf-8');
    const relative = file.replace(ROOT, '').replace(/\\/g, '/');
    log(`  Updated: ${relative}`, '\x1b[90m');
    updatedCount++;
  }
}

log(`  ${updatedCount} files updated`, '\x1b[36m');

// ─── 4. Install tooling ───
log('\n[4/6] Installing commitlint + husky...', '\x1b[33m');
try {
  execSync('npm install -D @commitlint/cli @commitlint/config-conventional husky', {
    stdio: 'inherit',
    cwd: ROOT,
  });
} catch (e) {
  log('  Warning: npm install failed. Run manually: npm install -D @commitlint/cli @commitlint/config-conventional husky', '\x1b[31m');
}

// ─── 5. Initialize husky ───
log('\n[5/6] Initializing husky...', '\x1b[33m');
try {
  execSync('npx husky init', { stdio: 'pipe', cwd: ROOT });
  writeFileSync(join(ROOT, '.husky', 'commit-msg'), 'npx --no -- commitlint --edit $1\n');
  log('  Husky initialized with commit-msg hook', '\x1b[90m');
} catch (e) {
  log('  Warning: husky init failed. Run manually: npx husky init', '\x1b[31m');
}

// ─── 6. Summary ───
log('\n[6/6] Verification:', '\x1b[33m');

const checks = [
  ['src/models/index.ts', 'Models layer'],
  ['src/config/constants.ts', 'Config layer'],
  ['src/lib/api/index.ts', 'API layer'],
  ['src/lib/helpers/image.helpers.ts', 'Helpers'],
  ['docs/architecture.md', 'Documentation'],
  ['commitlint.config.mjs', 'Commitlint'],
  ['.env.example', 'Env template'],
  ['src/components/home/HomeRotatingSlots.tsx', 'Components moved'],
];

for (const [path, label] of checks) {
  const exists = existsSync(join(ROOT, path));
  log(`  ${exists ? '✓' : '✗'} ${label} (${path})`, exists ? '\x1b[32m' : '\x1b[31m');
}

log('\n=== Done! Next steps: ===', '\x1b[32m');
log('  1. npm run build          (verify it compiles)');
log('  2. git add .');
log('  3. git commit -m "refactor: restructure project following professional standards"');
log('  4. git push');
log('\n  Then delete migration files: del migrate.mjs migrate.ps1 bryan-foto-restructure.zip\n');
