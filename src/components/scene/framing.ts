/**
 * Camera framing for the athlete scene.
 *
 * The scene must read as one composed image on every canvas size, and the stage
 * deliberately changes aspect at breakpoints (`aspect-4/5`, `sm:aspect-3/4`,
 * `lg:aspect-4/5`), so a hand-tuned camera position cannot hold: the athlete's
 * feet sink below the bottom edge and the highest thought cloud is cut off at
 * the top.
 *
 * Instead the camera is placed by fitting this declared content box to the
 * viewport aspect. Everything that must stay visible — figure, clouds, trophy,
 * medal and ball — is inside the box, and the court floor is allowed to bleed
 * past the edges because it is set dressing, not content.
 */

/**
 * World-space bounds that must remain visible, in metres.
 *
 * Derived from the geometry in `PlaceholderAthlete`, `ThoughtCloud`, `Trophy`
 * and `Volleyball`, after the `-1.25` world offset is applied, and including
 * the cloud puff reach plus the trophy and medal hit radii so their hover
 * targets are not cut in half.
 *
 * The vertical extent is the tallest thing in the scene, which is the centre
 * thought cloud at local y 2.42 plus its 0.23 m puff reach, and the lowest is the
 * ball on the court. The horizontal extent is set by the two side clouds and the
 * set pieces above the hands, which are wider than the figure.
 */
export const SCENE_CONTENT_BOUNDS = {
  minX: -0.8,
  maxX: 0.82,
  minY: -1.32,
  maxY: 1.4,
} as const;

/**
 * Extra room around the content box, as a multiplier.
 *
 * Without breathing space the outer clouds touch the frame edge, which reads as
 * a crop rather than a composition.
 */
export const FRAME_PADDING = 1.14;

/** Slight three-quarter view, so the figure reads with depth rather than flat-on. */
export const CAMERA_DIRECTION = { x: 0.55, y: 0.35, z: 3.7 } as const;

/** Vertical field of view in degrees. */
export const CAMERA_FOV = 34;

/** Near/far planes, matching the values passed to the canvas. */
export const CAMERA_NEAR = 0.1;
export const CAMERA_FAR = 60;

/**
 * Centre of the content box, which is also what the camera looks at.
 *
 * `z` is 0 because the content is authored in the plane the camera faces; the
 * camera's own direction supplies the three-quarter offset.
 */
export const FRAME_CENTRE = {
  x: (SCENE_CONTENT_BOUNDS.minX + SCENE_CONTENT_BOUNDS.maxX) / 2,
  y: (SCENE_CONTENT_BOUNDS.minY + SCENE_CONTENT_BOUNDS.maxY) / 2,
  z: 0,
} as const;

export interface FramePlacement {
  position: [number, number, number];
  centre: [number, number, number];
  /** True when width, not height, is what limits the fit. */
  widthLimited: boolean;
}

/**
 * Places the camera so `SCENE_CONTENT_BOUNDS` fits the given aspect ratio.
 *
 * Both axes are solved independently and the larger distance wins, so the
 * content fits at any aspect and the composition stays centred.
 */
export function computeFrame(
  aspect: number,
  fov: number = CAMERA_FOV,
  padding: number = FRAME_PADDING,
): FramePlacement {
  const width = SCENE_CONTENT_BOUNDS.maxX - SCENE_CONTENT_BOUNDS.minX;
  const height = SCENE_CONTENT_BOUNDS.maxY - SCENE_CONTENT_BOUNDS.minY;

  // Guard against a zero-width box while layout settles.
  const safeAspect = Number.isFinite(aspect) && aspect > 0 ? aspect : 1;

  const halfFovRadians = (fov * Math.PI) / 180 / 2;
  const visiblePerUnitDistance = 2 * Math.tan(halfFovRadians);

  const distanceForHeight = height / visiblePerUnitDistance;
  const distanceForWidth = width / (visiblePerUnitDistance * safeAspect);
  const widthLimited = distanceForWidth > distanceForHeight;

  const distance = Math.max(distanceForHeight, distanceForWidth) * padding;

  // Normalise the direction so the distance is measured from the content centre.
  const { x: dx, y: dy, z: dz } = CAMERA_DIRECTION;
  const length = Math.hypot(dx, dy, dz) || 1;

  return {
    position: [
      FRAME_CENTRE.x + (dx / length) * distance,
      FRAME_CENTRE.y + (dy / length) * distance,
      FRAME_CENTRE.z + (dz / length) * distance,
    ],
    centre: [FRAME_CENTRE.x, FRAME_CENTRE.y, FRAME_CENTRE.z],
    widthLimited,
  };
}