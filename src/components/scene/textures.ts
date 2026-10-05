import * as THREE from "three";

const createCanvas = (width: number, height: number): HTMLCanvasElement => {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
};

/**
 * Procedural court surface: charcoal base with restrained white markings and a
 * single red centre mark. Generated at runtime, so no image asset is requested.
 */
export const createCourtTexture = (
  segments = 24,
): { texture: THREE.Texture; anisotropy: number } => {
  const size = 1024;
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");
  if (!ctx) return { texture: new THREE.Texture(), anisotropy: 1 };

  ctx.fillStyle = "#0b0d12";
  ctx.fillRect(0, 0, size, size);

  // Soft central lift so the platform is not a flat black slab.
  const glow = ctx.createRadialGradient(
    size / 2,
    size / 2,
    size * 0.05,
    size / 2,
    size / 2,
    size * 0.62,
  );
  glow.addColorStop(0, "rgba(38, 44, 56, 0.95)");
  glow.addColorStop(1, "rgba(5, 6, 10, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, size, size);

  // Subtle plank grain.
  ctx.globalAlpha = 0.05;
  for (let i = 0; i < 160; i += 1) {
    const y = Math.random() * size;
    ctx.fillStyle = i % 2 === 0 ? "#ffffff" : "#000000";
    ctx.fillRect(0, y, size, 1);
  }
  ctx.globalAlpha = 1;

  const inset = size * 0.085;
  const line = (x1: number, y1: number, x2: number, y2: number, alpha: number) => {
    ctx.strokeStyle = `rgba(246, 242, 234, ${alpha})`;
    ctx.lineWidth = size * 0.006;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  };

  // Outer boundary.
  ctx.strokeStyle = "rgba(246, 242, 234, 0.16)";
  ctx.lineWidth = size * 0.008;
  ctx.strokeRect(inset, inset, size - inset * 2, size - inset * 2);

  // Centre line.
  line(size / 2, inset, size / 2, size - inset, 0.12);

  // Attack lines, drawn with the real 5 cm width so they read as court markings
  // rather than hairlines. Real volleyball courts are 9 x 18 m with the attack
  // line 3 m from the centre.
  const attack = size * 0.19;
  ctx.strokeStyle = "rgba(246, 242, 234, 0.16)";
  ctx.lineWidth = size * 0.011;
  for (const x of [size / 2 - attack, size / 2 + attack]) {
    ctx.beginPath();
    ctx.moveTo(x, inset);
    ctx.lineTo(x, size - inset);
    ctx.stroke();
  }

  // Centre marks and the service-zone ticks at the boundary.
  ctx.fillStyle = "rgba(246, 242, 234, 0.22)";
  for (const x of [size / 2 - attack, size / 2 + attack]) {
    ctx.fillRect(x - size * 0.005, inset, size * 0.01, size * 0.016);
    ctx.fillRect(x - size * 0.005, size - inset - size * 0.016, size * 0.01, size * 0.016);
  }

  // Dashed free-zone hint.
  ctx.setLineDash([size * 0.02, size * 0.02]);
  line(size * 0.07, inset, size * 0.07, size - inset, 0.05);
  line(size - size * 0.07, inset, size - size * 0.07, size - inset, 0.05);
  ctx.setLineDash([]);

  // Red centre mark.
  ctx.strokeStyle = "rgba(206, 17, 38, 0.55)";
  ctx.lineWidth = size * 0.007;
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size * 0.035, 0, Math.PI * 2);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = segments;
  texture.needsUpdate = true;
  return { texture, anisotropy: segments };
};

/**
 * Procedural volleyball: off-white panels with the classic red / blue / yellow
 * tri-colour grouping. Drawn to a canvas instead of shipping an image file.
 */
export const createVolleyballTexture = (): THREE.Texture => {
  const width = 512;
  const height = 256;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.Texture();

  ctx.fillStyle = "#efeae1";
  ctx.fillRect(0, 0, width, height);

  const colours = ["#ce1126", "#1d4ed8", "#eab308"];
  const panels = 12;
  const bandWidth = width / panels;

  for (let i = 0; i < panels; i += 1) {
    if (i % 2 !== 0) continue;
    const colourIndex = Math.floor(i / 4) % colours.length;
    ctx.fillStyle = colours[colourIndex];
    ctx.beginPath();
    ctx.moveTo(i * bandWidth, 0);
    ctx.lineTo((i + 1) * bandWidth, 0);
    ctx.lineTo((i + 1) * bandWidth, height);
    ctx.lineTo(i * bandWidth, height);
    ctx.closePath();
    ctx.fill();
  }

  // Panel seams.
  ctx.strokeStyle = "rgba(5, 6, 10, 0.55)";
  ctx.lineWidth = 3;
  for (let i = 0; i <= panels; i += 1) {
    ctx.beginPath();
    ctx.moveTo(i * bandWidth, 0);
    ctx.lineTo(i * bandWidth, height);
    ctx.stroke();
  }

  // Soft top-down shading so the ball reads as a sphere.
  const shade = ctx.createLinearGradient(0, 0, 0, height);
  shade.addColorStop(0, "rgba(255, 255, 255, 0.22)");
  shade.addColorStop(0.55, "rgba(0, 0, 0, 0)");
  shade.addColorStop(1, "rgba(0, 0, 0, 0.45)");
  ctx.fillStyle = shade;
  ctx.fillRect(0, 0, width, height);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
};

/**
 * Net mesh for the stadium backdrop: a square grid with alternating alpha so it
 * reads as woven tape rather than a printed screen.
 */
export const createNetTexture = (): THREE.Texture => {
  const size = 512;
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.Texture();

  ctx.clearRect(0, 0, size, size);
  ctx.strokeStyle = "rgba(226, 232, 244, 0.85)";
  ctx.lineWidth = 2;

  const cells = 22;
  const step = size / cells;

  for (let i = 0; i <= cells; i += 1) {
    const p = i * step;
    ctx.globalAlpha = 0.55 + (i % 2 === 0 ? 0.2 : 0);
    ctx.beginPath();
    ctx.moveTo(p, 0);
    ctx.lineTo(p, size);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, p);
    ctx.lineTo(size, p);
    ctx.stroke();
  }

  // Knots at the intersections.
  ctx.globalAlpha = 0.9;
  ctx.fillStyle = "rgba(240, 244, 252, 0.9)";
  for (let x = 0; x <= cells; x += 1) {
    for (let y = 0; y <= cells; y += 1) {
      ctx.beginPath();
      ctx.arc(x * step, y * step, 2.1, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
};

/** Soft radial blob used as a cheap contact shadow under the athlete. */
export const createGroundShadowTexture = (): THREE.Texture => {
  const size = 256;
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.Texture();

  const gradient = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2,
  );
  gradient.addColorStop(0, "rgba(0, 0, 0, 0.55)");
  gradient.addColorStop(0.55, "rgba(0, 0, 0, 0.22)");
  gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
};

/** Releases GPU resources for a generated texture. */
export const disposeTexture = (texture: THREE.Texture | null | undefined): void => {
  texture?.dispose();
};