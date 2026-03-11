# ============================================================
# MIGRATION SCRIPT — bryan-foto-frontend restructuring
# Run from the project root: .\migrate.ps1
# ============================================================

Write-Host "=== Bryan Foto Frontend — Project Restructuring ===" -ForegroundColor Cyan
Write-Host ""

# ─── 1. Create new folder structure ───
Write-Host "[1/7] Creating new folder structure..." -ForegroundColor Yellow

$folders = @(
    "src/models",
    "src/config",
    "src/lib/api",
    "src/lib/helpers",
    "src/components/ui",
    "src/components/layout",
    "src/components/home",
    "src/components/proyecto",
    "src/components/about",
    "src/components/contact",
    "docs"
)

foreach ($f in $folders) {
    if (-not (Test-Path $f)) {
        New-Item -ItemType Directory -Path $f -Force | Out-Null
        Write-Host "  Created: $f" -ForegroundColor DarkGray
    }
}

# ─── 2. Move components to domain folders ───
Write-Host "[2/7] Moving components to domain folders..." -ForegroundColor Yellow

$moves = @{
    # UI (generic/reusable)
    "src/components/Logo3D.tsx"             = "src/components/ui/Logo3D.tsx"
    "src/components/LogoSmall3D.tsx"        = "src/components/ui/LogoSmall3D.tsx"
    # Layout
    "src/components/Header.tsx"             = "src/components/layout/Header.tsx"
    # Home
    "src/components/HomeRotatingSlots.tsx"  = "src/components/home/HomeRotatingSlots.tsx"
    "src/components/HomeStickyWork.tsx"     = "src/components/home/HomeStickyWork.tsx"
    "src/components/HomeWorkCard.tsx"       = "src/components/home/HomeWorkCard.tsx"
    # Proyecto
    "src/components/ProyectoDetailView.tsx" = "src/components/proyecto/ProyectoDetailView.tsx"
    "src/components/ProjectCard.tsx"        = "src/components/proyecto/ProjectCard.tsx"
    "src/components/ProjectGallery.tsx"     = "src/components/proyecto/ProjectGallery.tsx"
    # About
    "src/components/AboutSection.tsx"       = "src/components/about/AboutSection.tsx"
    # Contact
    "src/components/ContactSection.tsx"     = "src/components/contact/ContactSection.tsx"
}

foreach ($src in $moves.Keys) {
    $dst = $moves[$src]
    if (Test-Path $src) {
        Move-Item -Path $src -Destination $dst -Force
        Write-Host "  Moved: $src -> $dst" -ForegroundColor DarkGray
    }
}

# Remove old barrel export (will be replaced by new files)
if (Test-Path "src/components/index.ts") {
    Remove-Item "src/components/index.ts" -Force
    Write-Host "  Removed: src/components/index.ts (replaced by domain exports)" -ForegroundColor DarkGray
}

# Remove old strapi.ts (replaced by models + api layer)
if (Test-Path "src/lib/strapi.ts") {
    Remove-Item "src/lib/strapi.ts" -Force
    Write-Host "  Removed: src/lib/strapi.ts (replaced by models/ + lib/api/)" -ForegroundColor DarkGray
}

# ─── 3. Update imports in all .tsx/.ts files ───
Write-Host "[3/7] Updating imports across all files..." -ForegroundColor Yellow

$files = Get-ChildItem -Path "src" -Recurse -Include "*.tsx","*.ts" | Where-Object { $_.FullName -notmatch "node_modules" }

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $original = $content

    # ── API imports: @/lib/strapi → @/lib/api or @/lib/helpers ──
    # Replace fetch function imports
    $content = $content -replace "import \{ getProyectos \} from '@/lib/strapi'", "import { getProjects } from '@/lib/api'"
    $content = $content -replace "import \{ getProyectoBySlug, getProyectos \} from '@/lib/strapi'", "import { getProjectBySlug, getProjects } from '@/lib/api'"
    $content = $content -replace "import \{ getProyectoBySlug \} from '@/lib/strapi'", "import { getProjectBySlug } from '@/lib/api'"
    $content = $content -replace "import \{ getAbout \} from '@/lib/strapi'", "import { getAbout } from '@/lib/api'"
    $content = $content -replace "import \{ getContacto \} from '@/lib/strapi'", "import { getContact } from '@/lib/api'"
    $content = $content -replace "import \{ getGlobal \} from '@/lib/strapi'", "import { getGlobalConfig } from '@/lib/api'"

    # Replace type imports
    $content = $content -replace "import \{ Proyecto, getStrapiImageUrl \} from '@/lib/strapi'", "import type { Project } from '@/models';`nimport { getStrapiImageUrl } from '@/lib/helpers/image.helpers'"
    $content = $content -replace "import \{ Proyecto, StrapiImage, getStrapiImageUrl \} from '@/lib/strapi'", "import type { Project, StrapiImage } from '@/models';`nimport { getStrapiImageUrl } from '@/lib/helpers/image.helpers'"
    $content = $content -replace "import \{ Proyecto \} from '@/lib/strapi'", "import type { Project } from '@/models'"
    $content = $content -replace "import \{ About, getStrapiImageUrl \} from '@/lib/strapi'", "import type { About } from '@/models';`nimport { getStrapiImageUrl } from '@/lib/helpers/image.helpers'"
    $content = $content -replace "import \{ Contacto \} from '@/lib/strapi'", "import type { ContactInfo } from '@/models'"
    $content = $content -replace "import \{ getStrapiImageUrl \} from '@/lib/strapi'", "import { getStrapiImageUrl } from '@/lib/helpers/image.helpers'"

    # ── Type references in code: Proyecto → Project, Contacto → ContactInfo ──
    $content = $content -replace "Proyecto\b", "Project"
    $content = $content -replace "Contacto\b", "ContactInfo"

    # ── Function call renames ──
    $content = $content -replace "getProyectos\b", "getProjects"
    $content = $content -replace "getProyectoBySlug\b", "getProjectBySlug"
    $content = $content -replace "getContacto\b", "getContact"
    $content = $content -replace "getGlobal\b", "getGlobalConfig"

    # ── Component imports: flat → domain folders ──
    $content = $content -replace "from '@/components/Logo3D'", "from '@/components/ui/Logo3D'"
    $content = $content -replace "from '@/components/LogoSmall3D'", "from '@/components/ui/LogoSmall3D'"
    $content = $content -replace "from '@/components/Header'", "from '@/components/layout/Header'"
    $content = $content -replace "from '@/components/HomeRotatingSlots'", "from '@/components/home/HomeRotatingSlots'"
    $content = $content -replace "from '@/components/HomeStickyWork'", "from '@/components/home/HomeStickyWork'"
    $content = $content -replace "from '@/components/HomeWorkCard'", "from '@/components/home/HomeWorkCard'"
    $content = $content -replace "from '@/components/ProyectoDetailView'", "from '@/components/proyecto/ProyectoDetailView'"
    $content = $content -replace "from '@/components/ProjectCard'", "from '@/components/proyecto/ProjectCard'"
    $content = $content -replace "from '@/components/ProjectGallery'", "from '@/components/proyecto/ProjectGallery'"
    $content = $content -replace "from '@/components/AboutSection'", "from '@/components/about/AboutSection'"
    $content = $content -replace "from '@/components/ContactSection'", "from '@/components/contact/ContactSection'"

    # ── Relative component imports within components ──
    $content = $content -replace "from '\./Logo3D'", "from '@/components/ui/Logo3D'"
    $content = $content -replace "from '\./LogoSmall3D'", "from '@/components/ui/LogoSmall3D'"
    $content = $content -replace "from '\./HomeWorkCard'", "from './HomeWorkCard'"
    $content = $content -replace "from '\./ProjectCard'", "from './ProjectCard'"

    # Write only if changed
    if ($content -ne $original) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "  Updated: $($file.FullName)" -ForegroundColor DarkGray
    }
}

# ─── 4. Install tooling dependencies ───
Write-Host "[4/7] Installing commitlint + husky..." -ForegroundColor Yellow
npm install -D @commitlint/cli @commitlint/config-conventional husky

# ─── 5. Initialize husky ───
Write-Host "[5/7] Initializing husky..." -ForegroundColor Yellow
npx husky init 2>$null
Set-Content -Path ".husky/commit-msg" -Value 'npx --no -- commitlint --edit $1'

# ─── 6. Summary ───
Write-Host ""
Write-Host "[6/7] Verifying structure..." -ForegroundColor Yellow
Write-Host ""
Write-Host "  src/models/         $(if (Test-Path 'src/models/index.ts') {'OK'} else {'MISSING — copy from migration package'})" -ForegroundColor $(if (Test-Path 'src/models/index.ts') {'Green'} else {'Red'})
Write-Host "  src/config/         $(if (Test-Path 'src/config/constants.ts') {'OK'} else {'MISSING — copy from migration package'})" -ForegroundColor $(if (Test-Path 'src/config/constants.ts') {'Green'} else {'Red'})
Write-Host "  src/lib/api/        $(if (Test-Path 'src/lib/api/index.ts') {'OK'} else {'MISSING — copy from migration package'})" -ForegroundColor $(if (Test-Path 'src/lib/api/index.ts') {'Green'} else {'Red'})
Write-Host "  src/lib/helpers/    $(if (Test-Path 'src/lib/helpers/image.helpers.ts') {'OK'} else {'MISSING — copy from migration package'})" -ForegroundColor $(if (Test-Path 'src/lib/helpers/image.helpers.ts') {'Green'} else {'Red'})
Write-Host "  docs/               $(if (Test-Path 'docs/architecture.md') {'OK'} else {'MISSING — copy from migration package'})" -ForegroundColor $(if (Test-Path 'docs/architecture.md') {'Green'} else {'Red'})
Write-Host "  commitlint.config   $(if (Test-Path 'commitlint.config.mjs') {'OK'} else {'MISSING — copy from migration package'})" -ForegroundColor $(if (Test-Path 'commitlint.config.mjs') {'OK'} else {'Red'})

Write-Host ""
Write-Host "[7/7] Done! Next steps:" -ForegroundColor Green
Write-Host "  1. Verify the app compiles: npm run build" -ForegroundColor White
Write-Host "  2. Commit the restructure: git add . && git commit -m 'refactor: restructure project following AcrossCapital standards'" -ForegroundColor White
Write-Host "  3. Push: git push" -ForegroundColor White
Write-Host ""
Write-Host "  Delete this script after migration: Remove-Item migrate.ps1" -ForegroundColor DarkGray
