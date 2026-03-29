const fs = require('fs');
const p = 'd:/Users/Escritorio/MIO/srccccc/srcc1/AC/bryan-foto-frontend/src/components/home/HomeRotatingSlots.tsx';
let c = fs.readFileSync(p, 'utf8');

// Find the old animation block
const startMarker = `      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Wrapper de HOLD visual`;
const endMarker = `transition={{ duration: 0.18, ease: 'easeInOut' }}
        />`;

const startIdx = c.indexOf(startMarker);
const endIdx = c.indexOf(endMarker, startIdx) + endMarker.length;

if (startIdx === -1 || endIdx === -1) {
  console.log('Markers not found. startIdx:', startIdx, 'endIdx:', endIdx);
  // Try to find what's there
  const altStart = c.indexOf('absolute inset-0 z-0 overflow-hidden');
  console.log('Alt start at:', altStart);
  if (altStart > 0) {
    console.log('Context:', JSON.stringify(c.substring(altStart - 20, altStart + 100)));
  }
  process.exit(1);
}

const replacement = `      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Imagen saliente — cinematic exit */}
        {prevIndex !== null && (
          <div
            key={\`exit-\${animKey}\`}
            className="absolute inset-0"
            style={{
              animation: \`slot-exit \${TRANSITION_MS}ms cubic-bezier(0.4, 0, 0.2, 1) forwards\`,
              zIndex: 1,
            }}
          >
            <Image
              src={getStrapiImageUrl(slot.projects[prevIndex].foto_portada)}
              alt={slot.projects[prevIndex].titulo}
              fill
              className="object-cover"
              sizes={fullWidth ? '(max-width: 767px) 100vw, 90vw' : \`\${SLOT_W}px\`}
              quality={100}
            />
          </div>
        )}

        {/* Imagen entrante — cinematic enter */}
        <div
          key={\`enter-\${animKey}\`}
          className="absolute inset-0"
          style={{
            animation:
              animKey > 0
                ? \`slot-enter \${TRANSITION_MS}ms cubic-bezier(0.4, 0, 0.2, 1) forwards\`
                : undefined,
            zIndex: 2,
          }}
        >
          <Image
            src={getStrapiImageUrl(activeProject.foto_portada)}
            alt={activeProject.titulo}
            fill
            className="object-cover"
            sizes={fullWidth ? '(max-width: 767px) 100vw, 90vw' : \`\${SLOT_W}px\`}
            quality={100}
            priority={slotIndex < 3 || fullWidth}
          />
        </div>

        {/* Overlay sutil editorial */}
        <div
          className="pointer-events-none absolute inset-0 z-3"
          style={{
            background:
              'linear-gradient(to top, rgba(0,0,0,0.08), rgba(0,0,0,0.02) 30%, rgba(0,0,0,0))',
            opacity: 0.25,
          }}
        />`;

c = c.substring(0, startIdx) + replacement + c.substring(endIdx);
fs.writeFileSync(p, c, 'utf8');
console.log('Done - animation replaced');
