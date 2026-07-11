/**
 * GlassSurface effect applied to .navbar
 * Vanilla JS port of the React Bits GlassSurface component.
 */

const GLASS_ID = 'glass-navbar-filter';

// Props (matching GlassSurface defaults, tuned for a navbar)
const CFG = {
  borderRadius:    16,
  borderWidth:     0.07,
  brightness:      50,
  opacity:         0.93,
  blur:            11,
  displace:        0,
  backgroundOpacity: 0,
  saturation:      1,
  distortionScale: -180,
  redOffset:       0,
  greenOffset:     10,
  blueOffset:      20,
  xChannel:        'R',
  yChannel:        'G',
  mixBlendMode:    'difference',
};

// ── SVG filter detection ─────────────────────────────────────────────────────
function supportsSVGFilters() {
  if (typeof window === 'undefined') return false;
  const isWebkit = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
  const isFirefox = /Firefox/.test(navigator.userAgent);
  if (isWebkit || isFirefox) return false;
  const div = document.createElement('div');
  div.style.backdropFilter = `url(#${GLASS_ID})`;
  return div.style.backdropFilter !== '';
}

// ── Displacement map SVG data URI ────────────────────────────────────────────
function buildDisplacementMap(w, h) {
  const edgeSize = Math.min(w, h) * (CFG.borderWidth * 0.5);
  const { borderRadius: br, brightness, opacity, blur, mixBlendMode } = CFG;

  const svg = `
    <svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="rg" x1="100%" y1="0%" x2="0%" y2="0%">
          <stop offset="0%" stop-color="#0000"/>
          <stop offset="100%" stop-color="red"/>
        </linearGradient>
        <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#0000"/>
          <stop offset="100%" stop-color="blue"/>
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="${w}" height="${h}" fill="black"/>
      <rect x="0" y="0" width="${w}" height="${h}" rx="${br}" fill="url(#rg)"/>
      <rect x="0" y="0" width="${w}" height="${h}" rx="${br}" fill="url(#bg)" style="mix-blend-mode:${mixBlendMode}"/>
      <rect x="${edgeSize}" y="${edgeSize}"
            width="${w - edgeSize * 2}" height="${h - edgeSize * 2}"
            rx="${br}"
            fill="hsl(0 0% ${brightness}% / ${opacity})"
            style="filter:blur(${blur}px)"/>
    </svg>`;

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

// ── Inject SVG filter markup into the navbar element ─────────────────────────
function buildFilterSVG() {
  const { distortionScale, redOffset, greenOffset, blueOffset, xChannel, yChannel, displace } = CFG;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.classList.add('glass-surface__filter');
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

  svg.innerHTML = `
    <defs>
      <filter id="${GLASS_ID}" color-interpolation-filters="sRGB"
              x="0%" y="0%" width="100%" height="100%">

        <feImage id="${GLASS_ID}-img"
                 x="0" y="0" width="100%" height="100%"
                 preserveAspectRatio="none" result="map"/>

        <feDisplacementMap in="SourceGraphic" in2="map" result="dispRed"
          scale="${distortionScale + redOffset}"
          xChannelSelector="${xChannel}" yChannelSelector="${yChannel}"/>
        <feColorMatrix in="dispRed" type="matrix"
          values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
          result="red"/>

        <feDisplacementMap in="SourceGraphic" in2="map" result="dispGreen"
          scale="${distortionScale + greenOffset}"
          xChannelSelector="${xChannel}" yChannelSelector="${yChannel}"/>
        <feColorMatrix in="dispGreen" type="matrix"
          values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0"
          result="green"/>

        <feDisplacementMap in="SourceGraphic" in2="map" result="dispBlue"
          scale="${distortionScale + blueOffset}"
          xChannelSelector="${xChannel}" yChannelSelector="${yChannel}"/>
        <feColorMatrix in="dispBlue" type="matrix"
          values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"
          result="blue"/>

        <feBlend in="red" in2="green" mode="screen" result="rg"/>
        <feBlend in="rg"  in2="blue"  mode="screen" result="output"/>
        <feGaussianBlur in="output" stdDeviation="${displace || 0.7}"/>
      </filter>
    </defs>`;

  return svg;
}

// ── Apply glass effect to the navbar ─────────────────────────────────────────
function applyGlass(navbar) {
  const svgSupported = supportsSVGFilters();

  // Add base class
  navbar.classList.add('glass-surface');
  navbar.classList.add(svgSupported ? 'glass-surface--svg' : 'glass-surface--fallback');

  // CSS custom properties
  navbar.style.setProperty('--glass-frost', String(CFG.backgroundOpacity));
  navbar.style.setProperty('--glass-saturation', String(CFG.saturation));
  navbar.style.setProperty('--filter-id', `url(#${GLASS_ID})`);
  navbar.style.borderRadius = `${CFG.borderRadius}px`;

  if (!svgSupported) return; // fallback path — no SVG filter needed

  // Inject SVG filter
  const filterSVG = buildFilterSVG();
  navbar.insertBefore(filterSVG, navbar.firstChild);

  const feImage = filterSVG.querySelector(`#${GLASS_ID}-img`);

  // Update displacement map on resize
  function update() {
    const { width, height } = navbar.getBoundingClientRect();
    if (width && height && feImage) {
      feImage.setAttribute('href', buildDisplacementMap(width, height));
    }
  }

  update();
  const ro = new ResizeObserver(() => setTimeout(update, 0));
  ro.observe(navbar);
}

// ── Wait for .navbar, then apply ─────────────────────────────────────────────
function init() {
  const existing = document.querySelector('.navbar');
  if (existing) { applyGlass(existing); return; }

  const mo = new MutationObserver(() => {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
      mo.disconnect();
      applyGlass(navbar);
    }
  });
  mo.observe(document.body, { childList: true, subtree: true });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
