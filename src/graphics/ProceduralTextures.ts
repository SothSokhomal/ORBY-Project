/**
 * Project Artemis: Procedural 3D Textures & Celestial Shaders
 * Zero-external-dependency HTML5 Canvas textures and calibrated PBR materials.
 * SimonDev-calibrated planetary aesthetics: realistic atmospheres, solar plasma,
 * banded gas giants, rings with Cassini divisions, and hexagonal lens flare bokeh.
 */

import * as THREE from 'three';

// ==========================================
// 1. REGOLITH (LUNAR SURFACE)
// ==========================================
export function createRegolithTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#65676c';
  ctx.fillRect(0, 0, 512, 512);

  // Micro-craters and dust noise
  for (let i = 0; i < 5000; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const r = Math.random() * 2.2 + 0.4;
    const lum = Math.floor(Math.random() * 65 + 75);
    ctx.fillStyle = `rgb(${lum}, ${lum}, ${lum})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Impact craters with realistic rim shadows and highlights
  for (let i = 0; i < 45; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const r = Math.random() * 16 + 3;
    ctx.fillStyle = '#333438';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#9ca0a8';
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.arc(x - 1, y - 1, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// ==========================================
// 2. SOLAR PANEL TEXTURE
// ==========================================
export function createSolarPanelTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#091933';
  ctx.fillRect(0, 0, 256, 256);

  ctx.strokeStyle = '#224a80';
  ctx.lineWidth = 1.5;
  const cellSize = 32;
  for (let x = 0; x <= 256; x += cellSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 256);
    ctx.stroke();
  }
  for (let y = 0; y <= 256; y += cellSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(256, y);
    ctx.stroke();
  }

  ctx.strokeStyle = '#b0c4de';
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.moveTo(64, 0);
  ctx.lineTo(64, 256);
  ctx.moveTo(192, 0);
  ctx.lineTo(192, 256);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// ==========================================
// 3. HAZARD STRIPE TEXTURE
// ==========================================
export function createHazardStripeTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(0, 0, 128, 128);

  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  for (let i = -128; i < 256; i += 32) {
    ctx.moveTo(i, 0);
    ctx.lineTo(i + 16, 0);
    ctx.lineTo(i + 48, 128);
    ctx.lineTo(i + 32, 128);
    ctx.closePath();
  }
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// ==========================================
// 4. SIMONDEV-STYLE SUN SHADER & CORONA
// ==========================================
export function createSunShaderMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vPosition;

      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vPosition;

      // Fast simplex-like procedural noise
      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
      vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

      float snoise(vec3 v) {
        const vec2 C = vec2(1.0/6.0, 1.0/3.0);
        const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
        vec3 i  = floor(v + dot(v, C.yyy));
        vec3 x0 = v - i + dot(i, C.xxx);
        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min(g.xyz, l.zxy);
        vec3 i2 = max(g.xyz, l.zxy);
        vec3 x1 = x0 - i1 + C.xxx;
        vec3 x2 = x0 - i2 + C.yyy;
        vec3 x3 = x0 - D.yyy;
        i = mod289(i);
        vec4 p = permute(permute(permute(
                  i.z + vec4(0.0, i1.z, i2.z, 1.0))
                + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                + i.x + vec4(0.0, i1.x, i2.x, 1.0));
        float n_ = 0.142857142857;
        vec3  ns = n_ * D.wyz - D.xzx;
        vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_);
        vec4 x = x_ *ns.x + ns.yyyy;
        vec4 y = y_ *ns.x + ns.yyyy;
        vec4 h = 1.0 - abs(x) - abs(y);
        vec4 b0 = vec4(x.xy, y.xy);
        vec4 b1 = vec4(x.zw, y.zw);
        vec4 s0 = floor(b0)*2.0 + 1.0;
        vec4 s1 = floor(b1)*2.0 + 1.0;
        vec4 sh = -step(h, vec4(0.0));
        vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
        vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
        vec3 p0 = vec3(a0.xy, h.x);
        vec3 p1 = vec3(a0.zw, h.y);
        vec3 p2 = vec3(a1.xy, h.z);
        vec3 p3 = vec3(a1.zw, h.w);
        vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
        p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
        vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
        m = m * m;
        return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
      }

      void main() {
        // Multi-frequency solar plasma turbulence
        vec3 p = vPosition * 0.9;
        float t = uTime * 0.25;
        float n1 = snoise(p + vec3(0.0, 0.0, t));
        float n2 = snoise(p * 2.2 - vec3(t * 0.6, 0.0, 0.0)) * 0.5;
        float n3 = snoise(p * 4.5 + vec3(0.0, t * 0.8, 0.0)) * 0.25;
        float plasma = (n1 + n2 + n3) * 0.5 + 0.5;

        // Colors: blazing white core, golden amber mantle, deep fiery vermilion limb
        vec3 whiteHot = vec3(1.0, 0.98, 0.92);
        vec3 goldPlasma = vec3(1.0, 0.68, 0.08);
        vec3 redLimb = vec3(0.95, 0.22, 0.02);
        vec3 darkCorona = vec3(0.55, 0.08, 0.01);

        vec3 color = mix(redLimb, goldPlasma, smoothstep(0.3, 0.65, plasma));
        color = mix(color, whiteHot, smoothstep(0.65, 0.95, plasma));

        // Limb darkening (view-angle fresnel falloff)
        float limb = clamp(dot(vNormal, vec3(0.0, 0.0, 1.0)), 0.0, 1.0);
        color = mix(darkCorona, color, pow(limb, 0.45));

        gl_FragColor = vec4(color, 1.0);
      }
    `,
  });
}

// Soft radial corona bloom texture (used for billboards)
export function createSunCoronaTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Smooth, soft corona falloff - transparent in center to let sun plasma show through
  const gradient = ctx.createRadialGradient(256, 256, 100, 256, 256, 256);
  gradient.addColorStop(0.0, 'rgba(255, 240, 180, 0.85)');
  gradient.addColorStop(0.2, 'rgba(255, 170, 30, 0.65)');
  gradient.addColorStop(0.45, 'rgba(235, 75, 10, 0.35)');
  gradient.addColorStop(0.75, 'rgba(180, 30, 5, 0.12)');
  gradient.addColorStop(1.0, 'rgba(0, 0, 0, 0.0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 512, 512);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Circular rainbow / chromatic aberration ring halo (seen around the Sun in SimonDev's screenshot)
export function createRainbowHaloTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Delicate, ethereal spectral rainbow ring
  const grad = ctx.createRadialGradient(256, 256, 140, 256, 256, 230);
  grad.addColorStop(0.0, 'rgba(0, 0, 0, 0.0)');
  grad.addColorStop(0.3, 'rgba(255, 60, 60, 0.0)');
  grad.addColorStop(0.45, 'rgba(255, 70, 40, 0.18)');
  grad.addColorStop(0.58, 'rgba(255, 200, 30, 0.20)');
  grad.addColorStop(0.70, 'rgba(40, 220, 140, 0.18)');
  grad.addColorStop(0.82, 'rgba(30, 150, 255, 0.22)');
  grad.addColorStop(0.92, 'rgba(140, 70, 255, 0.15)');
  grad.addColorStop(1.0, 'rgba(0, 0, 0, 0.0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// SimonDev hexagonal lens flare bokeh texture (delicate, translucent, soft edge)
export function createHexagonFlareTexture(
  fillRgba = 'rgba(70, 150, 255, 0.12)',
  rimRgba = 'rgba(120, 200, 255, 0.35)'
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  const cx = 128;
  const cy = 128;
  const radius = 95;

  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3 - Math.PI / 6;
    const x = cx + radius * Math.cos(angle);
    const y = cy + radius * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();

  // Soft translucent radial fill
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
  grad.addColorStop(0.0, fillRgba);
  grad.addColorStop(0.7, fillRgba);
  grad.addColorStop(1.0, 'rgba(0, 0, 0, 0.0)');
  ctx.fillStyle = grad;
  ctx.fill();

  // Delicate hairline diffraction rim
  ctx.strokeStyle = rimRgba;
  ctx.lineWidth = 1.2;
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Center subtle soft starburst glint (no hard thick crossbars)
export function createFlareStarburstTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  const cx = 128;
  const cy = 128;

  // Soft radial glow
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 50);
  grad.addColorStop(0.0, 'rgba(255, 255, 255, 0.9)');
  grad.addColorStop(0.2, 'rgba(200, 230, 255, 0.5)');
  grad.addColorStop(0.5, 'rgba(80, 160, 255, 0.15)');
  grad.addColorStop(1.0, 'rgba(0, 0, 0, 0.0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  // Soft, feathered horizontal streak (subtle anamorphic glint)
  const hGrad = ctx.createLinearGradient(0, 0, 256, 0);
  hGrad.addColorStop(0.0, 'rgba(150, 210, 255, 0.0)');
  hGrad.addColorStop(0.4, 'rgba(180, 225, 255, 0.35)');
  hGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.7)');
  hGrad.addColorStop(0.6, 'rgba(180, 225, 255, 0.35)');
  hGrad.addColorStop(1.0, 'rgba(150, 210, 255, 0.0)');
  ctx.fillStyle = hGrad;
  ctx.fillRect(0, 126, 256, 4);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// ==========================================
// 5. PHOTOREALISTIC EARTH & ATMOSPHERE
// ==========================================
export function createEarthTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Deep ocean blue base
  ctx.fillStyle = '#0a2347';
  ctx.fillRect(0, 0, 1024, 512);

  // Continental shelf shallow waters
  ctx.fillStyle = '#164e78';
  // North America Shelf
  ctx.beginPath();
  ctx.ellipse(260, 160, 130, 95, 0.2, 0, Math.PI * 2);
  ctx.fill();
  // South America Shelf
  ctx.beginPath();
  ctx.ellipse(360, 340, 75, 125, 0.3, 0, Math.PI * 2);
  ctx.fill();
  // Eurasia Shelf
  ctx.beginPath();
  ctx.ellipse(650, 170, 190, 110, -0.1, 0, Math.PI * 2);
  ctx.fill();
  // Africa Shelf
  ctx.beginPath();
  ctx.ellipse(560, 300, 100, 120, 0.1, 0, Math.PI * 2);
  ctx.fill();
  // Australia Shelf
  ctx.beginPath();
  ctx.ellipse(840, 380, 70, 55, -0.2, 0, Math.PI * 2);
  ctx.fill();

  // Continental landmasses - lush green
  ctx.fillStyle = '#2d6a3f';
  // North America
  ctx.beginPath();
  ctx.ellipse(260, 160, 105, 75, 0.2, 0, Math.PI * 2);
  ctx.fill();
  // South America
  ctx.beginPath();
  ctx.ellipse(360, 340, 60, 105, 0.3, 0, Math.PI * 2);
  ctx.fill();
  // Eurasia
  ctx.beginPath();
  ctx.ellipse(650, 170, 165, 85, -0.1, 0, Math.PI * 2);
  ctx.fill();
  // Africa
  ctx.beginPath();
  ctx.ellipse(560, 300, 85, 100, 0.1, 0, Math.PI * 2);
  ctx.fill();
  // Australia
  ctx.beginPath();
  ctx.ellipse(840, 380, 55, 42, -0.2, 0, Math.PI * 2);
  ctx.fill();

  // Desert regions (Sahara, Middle East, Gobi, Australian Outback)
  ctx.fillStyle = '#b5935b';
  // Sahara
  ctx.beginPath();
  ctx.ellipse(540, 240, 75, 30, 0.05, 0, Math.PI * 2);
  ctx.fill();
  // Middle East
  ctx.beginPath();
  ctx.ellipse(620, 230, 35, 25, 0.1, 0, Math.PI * 2);
  ctx.fill();
  // Australian Outback
  ctx.beginPath();
  ctx.ellipse(840, 380, 38, 25, 0, 0, Math.PI * 2);
  ctx.fill();

  // Mountain ranges (Rockies, Andes, Himalayas) - slate brown
  ctx.strokeStyle = '#5a5043';
  ctx.lineWidth = 12;
  // Rockies
  ctx.beginPath();
  ctx.moveTo(180, 110);
  ctx.lineTo(230, 220);
  ctx.stroke();
  // Andes
  ctx.beginPath();
  ctx.moveTo(310, 250);
  ctx.lineTo(340, 420);
  ctx.stroke();
  // Himalayas
  ctx.beginPath();
  ctx.moveTo(680, 210);
  ctx.lineTo(760, 220);
  ctx.stroke();

  // Arctic & Antarctic Polar Ice Caps
  ctx.fillStyle = '#e8f4f8';
  ctx.fillRect(0, 0, 1024, 38);
  ctx.fillRect(0, 474, 1024, 38);
  for (let i = 0; i < 20; i++) {
    const x = Math.random() * 1024;
    ctx.beginPath();
    ctx.arc(x, 38, Math.random() * 20 + 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x, 474, Math.random() * 20 + 8, 0, Math.PI * 2);
    ctx.fill();
  }

  // Realistic cloud weather patterns
  ctx.fillStyle = 'rgba(255, 255, 255, 0.72)';
  for (let i = 0; i < 45; i++) {
    const cx = Math.random() * 1024;
    const cy = Math.random() * 450 + 30;
    const rx = Math.random() * 110 + 35;
    const ry = Math.random() * 22 + 6;
    const rot = Math.random() * 0.4 - 0.2;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, rot, 0, Math.PI * 2);
    ctx.fill();
  }

  // Cyclonic storm spiral
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.lineWidth = 5;
  const hurricaneX = 290;
  const hurricaneY = 220;
  ctx.beginPath();
  for (let a = 0; a < Math.PI * 4; a += 0.1) {
    const r = a * 6;
    const x = hurricaneX + r * Math.cos(a);
    const y = hurricaneY + r * Math.sin(a);
    if (a === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Glowing cyan-blue atmospheric rim shader for Earth (Fresnel rim)
export function createAtmosphereMaterial(colorHex = 0x38bdf8): THREE.ShaderMaterial {
  const color = new THREE.Color(colorHex);
  return new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: color },
    },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vViewPosition;

      void main() {
        vNormal = normalize(normalMatrix * normal);
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vViewPosition = -mvPosition.xyz;
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      varying vec3 vNormal;
      varying vec3 vViewPosition;

      void main() {
        vec3 normal = normalize(vNormal);
        vec3 viewDir = normalize(vViewPosition);
        float fresnel = 1.0 - clamp(dot(normal, viewDir), 0.0, 1.0);
        fresnel = pow(fresnel, 2.8);
        gl_FragColor = vec4(uColor, fresnel * 0.85);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
    depthWrite: false,
  });
}

// ==========================================
// 6. HIGH-FIDELITY JUPITER
// ==========================================
export function createJupiterTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Authentically ordered Jovian atmospheric bands
  const bands = [
    { color: '#52667a', h: 32 },  // North Polar Region
    { color: '#8c7662', h: 36 },  // North North Temperate Belt
    { color: '#d9cbb7', h: 28 },  // North North Temperate Zone
    { color: '#a67c52', h: 44 },  // North Temperate Belt
    { color: '#f0e6d6', h: 36 },  // North Tropical Zone
    { color: '#994f2d', h: 56 },  // North Equatorial Belt (broad red-brown)
    { color: '#fff9ed', h: 48 },  // Equatorial Zone (bright cream)
    { color: '#8f4222', h: 60 },  // South Equatorial Belt (rich dark terracotta)
    { color: '#f3e8d8', h: 36 },  // South Tropical Zone
    { color: '#aa7e56', h: 44 },  // South Temperate Belt
    { color: '#e0d5c3', h: 32 },  // South South Temperate Zone
    { color: '#5b6b7a', h: 60 },  // South Polar Region
  ];

  let currentY = 0;
  bands.forEach((b) => {
    ctx.fillStyle = b.color;
    ctx.fillRect(0, currentY, 1024, b.h);

    // Sinusoidal jet stream boundary waves
    ctx.fillStyle = b.color;
    ctx.beginPath();
    for (let x = 0; x <= 1024; x += 16) {
      const wave = Math.sin((x / 1024) * Math.PI * 16) * 5 + Math.cos((x / 1024) * Math.PI * 32) * 2;
      ctx.lineTo(x, currentY + wave);
    }
    ctx.lineTo(1024, currentY + b.h);
    ctx.lineTo(0, currentY + b.h);
    ctx.closePath();
    ctx.fill();

    currentY += b.h;
  });

  // Micro turbulent swirls along cloud belts
  for (let i = 0; i < 90; i++) {
    const x = Math.random() * 1024;
    const y = Math.random() * 512;
    const rx = Math.random() * 45 + 15;
    const ry = Math.random() * 8 + 3;
    const lum = Math.random() > 0.5 ? 'rgba(255, 255, 255, 0.35)' : 'rgba(100, 40, 10, 0.4)';
    ctx.fillStyle = lum;
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // The Great Red Spot (22° South Latitude)
  const grsX = 680;
  const grsY = 325;
  // Outer storm border
  ctx.fillStyle = '#8f2d18';
  ctx.beginPath();
  ctx.ellipse(grsX, grsY, 68, 38, 0, 0, Math.PI * 2);
  ctx.fill();

  // Swirling inner rings
  ctx.strokeStyle = '#c44521';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.ellipse(grsX, grsY, 52, 28, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Red Spot Core
  ctx.fillStyle = '#e0582d';
  ctx.beginPath();
  ctx.ellipse(grsX, grsY, 32, 16, 0, 0, Math.PI * 2);
  ctx.fill();

  // White storm ovals in South Temperate Belt
  for (let i = 0; i < 4; i++) {
    const ox = 200 + i * 220;
    const oy = 390;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(ox, oy, 16, 10, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// ==========================================
// 7. HIGH-FIDELITY SATURN & 3D RINGS
// ==========================================
export function createSaturnTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  const bands = [
    '#687a7d', '#c2b395', '#deb887', '#edd4ab', '#f5e4c4',
    '#e2ca9c', '#d2b48c', '#e6cda3', '#bfa178', '#637576',
  ];
  const h = 512 / bands.length;

  for (let i = 0; i < bands.length; i++) {
    ctx.fillStyle = bands[i];
    ctx.fillRect(0, i * h, 1024, h);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createSaturnRingTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;

  // Radial linear strip for RingGeometry
  const grad = ctx.createLinearGradient(0, 0, 512, 0);
  grad.addColorStop(0.0, 'rgba(0, 0, 0, 0.0)');
  // C-ring (faint inner ring)
  grad.addColorStop(0.08, 'rgba(140, 120, 95, 0.25)');
  grad.addColorStop(0.25, 'rgba(180, 160, 130, 0.55)');
  // B-ring (dense, brightest main ring)
  grad.addColorStop(0.28, 'rgba(230, 215, 185, 0.95)');
  grad.addColorStop(0.62, 'rgba(215, 195, 160, 0.90)');
  // Cassini Division (transparent dark gap)
  grad.addColorStop(0.64, 'rgba(20, 15, 10, 0.0)');
  grad.addColorStop(0.72, 'rgba(20, 15, 10, 0.0)');
  // A-ring
  grad.addColorStop(0.74, 'rgba(195, 175, 145, 0.85)');
  grad.addColorStop(0.92, 'rgba(175, 155, 125, 0.75)');
  // Outer edge
  grad.addColorStop(0.96, 'rgba(120, 100, 80, 0.25)');
  grad.addColorStop(1.0, 'rgba(0, 0, 0, 0.0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 64);

  // Micro ringlet striations
  for (let i = 0; i < 150; i++) {
    const x = Math.random() * 512;
    ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(x, 0, 1.5, 64);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// ==========================================
// 8. HIGH-FIDELITY MARS
// ==========================================
export function createMarsTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Iron-oxide rust red base
  ctx.fillStyle = '#b84a28';
  ctx.fillRect(0, 0, 1024, 512);

  // Dark volcanic basaltic maria (Syrtis Major, Acidalia Planitia)
  ctx.fillStyle = '#5c2d1b';
  // Syrtis Major
  ctx.beginPath();
  ctx.ellipse(650, 240, 95, 75, 0.3, 0, Math.PI * 2);
  ctx.fill();
  // Mare Erythraeum
  ctx.beginPath();
  ctx.ellipse(320, 320, 120, 60, -0.1, 0, Math.PI * 2);
  ctx.fill();
  // Acidalia Planitia
  ctx.beginPath();
  ctx.ellipse(360, 150, 80, 55, 0.1, 0, Math.PI * 2);
  ctx.fill();

  // Valles Marineris canyon rift
  ctx.strokeStyle = '#38160a';
  ctx.lineWidth = 9;
  ctx.beginPath();
  ctx.moveTo(250, 270);
  ctx.bezierCurveTo(340, 280, 420, 260, 480, 285);
  ctx.stroke();

  // Olympus Mons shield caldera
  ctx.fillStyle = '#7a3118';
  ctx.beginPath();
  ctx.arc(170, 220, 35, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#421609';
  ctx.beginPath();
  ctx.arc(170, 220, 12, 0, Math.PI * 2);
  ctx.fill();

  // Brilliant white Polar Ice Caps (Water Ice + Dry Ice CO2)
  ctx.fillStyle = '#ffffff';
  // North polar cap
  ctx.beginPath();
  ctx.ellipse(512, 22, 160, 22, 0, 0, Math.PI * 2);
  ctx.fill();
  // South polar cap
  ctx.beginPath();
  ctx.ellipse(512, 492, 130, 20, 0, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// ==========================================
// 9. HIGH-FIDELITY VENUS
// ==========================================
export function createVenusTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#e8c887';
  ctx.fillRect(0, 0, 512, 256);

  // Sulfuric acid cloud swirling bands
  ctx.fillStyle = '#fce5af';
  for (let i = 0; i < 25; i++) {
    const y = Math.random() * 256;
    ctx.beginPath();
    ctx.ellipse(256, y, 250, Math.random() * 22 + 6, Math.random() * 0.1 - 0.05, 0, Math.PI * 2);
    ctx.fill();
  }

  // Planetary chevron wind streak
  ctx.strokeStyle = '#d4aa5d';
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.moveTo(120, 40);
  ctx.lineTo(256, 128);
  ctx.lineTo(120, 216);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// ==========================================
// 10. HIGH-FIDELITY MERCURY
// ==========================================
export function createMercuryTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#7a7d85';
  ctx.fillRect(0, 0, 512, 256);

  // High contrast iron craters
  for (let i = 0; i < 3000; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 256;
    const lum = Math.floor(Math.random() * 80 + 60);
    ctx.fillStyle = `rgb(${lum}, ${lum}, ${lum})`;
    ctx.fillRect(x, y, 2, 2);
  }

  // Ray crater system (Caloris Basin)
  ctx.fillStyle = '#b0b5be';
  ctx.beginPath();
  ctx.arc(220, 120, 32, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = 'rgba(230, 235, 245, 0.45)';
  ctx.lineWidth = 1.5;
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 8) {
    ctx.beginPath();
    ctx.moveTo(220, 120);
    ctx.lineTo(220 + 90 * Math.cos(a), 120 + 90 * Math.sin(a));
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
