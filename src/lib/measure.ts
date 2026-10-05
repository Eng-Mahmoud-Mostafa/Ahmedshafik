import type { Options as MeasureOptions } from "react-use-measure";

/**
 * Types derived from `react-use-measure` so the wrapper below is structurally
 * guaranteed to satisfy the `polyfill` slot in its options.
 */
type MeasurePolyfill = NonNullable<MeasureOptions["polyfill"]>;
type MeasureCallback = ConstructorParameters<MeasurePolyfill>[0];

/**
 * How long to wait for a native measurement before forcing one.
 *
 * A normal browser delivers the first ResizeObserver batch long before this,
 * so the delay is invisible there. It only matters in environments that never
 * run their rendering steps.
 */
export const INITIAL_MEASUREMENT_FALLBACK_MS = 250;

/**
 * ResizeObserver wrapper that guarantees the first measurement is delivered.
 *
 * `react-use-measure` — which `@react-three/fiber` uses to size the canvas —
 * never measures on its own. It starts at `0 x 0` and the *only* thing that
 * ever fills it in is a ResizeObserver callback. Those callbacks are delivered
 * by the browser's rendering steps, so anywhere the rendering loop does not run
 * (headless browsers, screenshot tooling, some embedded webviews) the canvas
 * stays at its intrinsic `300 x 150`, and because R3F only creates its
 * renderer once a non-empty rect arrives, the scene never mounts at all.
 *
 * This wrapper keeps the native observer for real resize tracking and, on top
 * of it, schedules one guaranteed measurement so the canvas is correctly sized
 * on the first frame in every environment. Duplicate measurements are
 * harmless: `react-use-measure` compares rects and ignores unchanged ones.
 */
export class GuaranteedResizeObserver {
  private readonly callback: MeasureCallback;
  private readonly fallbackDelayMs: number;
  private readonly native: ResizeObserver | null;
  private frame: number | null = null;
  private frameTimer: ReturnType<typeof setTimeout> | null = null;
  private fallbackTimer: ReturnType<typeof setTimeout> | null = null;
  private pending = false;

  constructor(
    callback: MeasureCallback,
    fallbackDelayMs: number = INITIAL_MEASUREMENT_FALLBACK_MS,
  ) {
    this.callback = callback;
    this.fallbackDelayMs = fallbackDelayMs;

    const Native = typeof window === "undefined" ? undefined : window.ResizeObserver;
    this.native = Native
      ? new Native((entries) => {
          // The native observer reports initial size and every later change.
          this.cancelFallback();
          this.callback(entries, this);
        })
      : null;
  }

  observe(target: Element, options?: ResizeObserverOptions): void {
    // Scheduled before the native observer is attached, so a native callback
    // that lands immediately (synchronously, or in the same task) cancels it
    // instead of leaving a redundant second measurement queued.
    this.scheduleFallback();
    this.native?.observe(target, options);
  }

  unobserve(target: Element): void {
    this.native?.unobserve(target);
  }

  disconnect(): void {
    this.cancelFallback();
    this.native?.disconnect();
  }

  private readonly measure = (): void => {
    if (!this.pending) return;
    this.cancelFallback();
    this.callback([], this);
  };

  private scheduleFallback(): void {
    if (this.pending) return;
    this.pending = true;

    // Preferred path: right after the next frame, which is when a native
    // observer would normally deliver its first batch.
    if (typeof window !== "undefined" && typeof window.requestAnimationFrame === "function") {
      this.frame = window.requestAnimationFrame(() => {
        this.frame = null;
        this.frameTimer = setTimeout(this.measure, 0);
      });
    }

    // Guarantee: still measured where no frame is ever produced. Deferred so
    // that mounting effects have run before the measurement lands.
    this.fallbackTimer = setTimeout(this.measure, this.fallbackDelayMs);
  }

  private cancelFallback(): void {
    this.pending = false;

    if (this.frame !== null && typeof window !== "undefined") {
      window.cancelAnimationFrame(this.frame);
      this.frame = null;
    }
    if (this.frameTimer !== null) {
      clearTimeout(this.frameTimer);
      this.frameTimer = null;
    }
    if (this.fallbackTimer !== null) {
      clearTimeout(this.fallbackTimer);
      this.fallbackTimer = null;
    }
  }
}