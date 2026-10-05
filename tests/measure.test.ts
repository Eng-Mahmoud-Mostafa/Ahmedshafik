import assert from "node:assert/strict";
import { test } from "node:test";

import { GuaranteedResizeObserver, INITIAL_MEASUREMENT_FALLBACK_MS } from "../src/lib/measure.ts";

/**
 * Minimal stand-ins for the browser globals the wrapper touches, so the
 * fallback path can be exercised in Node.
 */
function withStubbedGlobals<T>(impl: () => Promise<T>): Promise<T> {
  const globals = globalThis as unknown as Record<string, unknown>;
  const previousWindow = globals.window;
  const previousRaf = globals.requestAnimationFrame;
  const previousCancelRaf = globals.cancelAnimationFrame;

  globals.window = {};
  delete globals.requestAnimationFrame;
  delete globals.cancelAnimationFrame;

  return impl().finally(() => {
    if (previousWindow === undefined) delete globals.window;
    else globals.window = previousWindow;
    if (previousRaf !== undefined) globals.requestAnimationFrame = previousRaf;
    if (previousCancelRaf !== undefined) globals.cancelAnimationFrame = previousCancelRaf;
  });
}

const target = {} as Element;
const tick = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

test("reports a first measurement even when no frame is ever produced", async () => {
  await withStubbedGlobals(async () => {
    const observed: Element[] = [];
    let measurements = 0;

    const observer = new GuaranteedResizeObserver(() => {
      measurements += 1;
    });
    observer.observe(target);

    await tick(INITIAL_MEASUREMENT_FALLBACK_MS + 60);
    assert.equal(measurements, 1);
    assert.deepEqual(observed, []);
  });
});

test("measures once per observe, not once per tick", async () => {
  await withStubbedGlobals(async () => {
    let measurements = 0;
    const observer = new GuaranteedResizeObserver(() => {
      measurements += 1;
    });

    observer.observe(target);
    await tick(INITIAL_MEASUREMENT_FALLBACK_MS + 60);
    assert.equal(measurements, 1);

    // No further callbacks without another observe, so a repeated layout pass
    // cannot spin the fallback timer forever.
    await tick(INITIAL_MEASUREMENT_FALLBACK_MS * 3);
    assert.equal(measurements, 1);
  });
});

test("disconnect cancels a pending measurement", async () => {
  await withStubbedGlobals(async () => {
    let measurements = 0;
    const observer = new GuaranteedResizeObserver(() => {
      measurements += 1;
    });

    observer.observe(target);
    observer.disconnect();
    await tick(INITIAL_MEASUREMENT_FALLBACK_MS + 60);

    assert.equal(measurements, 0);
  });
});

test("delegates to a native observer and prefers its measurements", async () => {
  const calls: string[] = [];

  class FakeResizeObserver {
    private readonly callback: () => void;

    constructor(callback: () => void) {
      this.callback = callback;
    }

    observe() {
      calls.push("observe:ok");
      this.callback();
    }
    unobserve() {
      calls.push("unobserve");
    }
    disconnect() {
      calls.push("disconnect");
    }
  }

  const globals = globalThis as unknown as Record<string, unknown>;
  const previousWindow = globals.window;
  globals.window = { ResizeObserver: FakeResizeObserver };

  try {
    let measurements = 0;
    const observer = new GuaranteedResizeObserver(() => {
      measurements += 1;
    });
    observer.observe(target);

    assert.deepEqual(calls, ["observe:ok"]);
    // The native initial callback landed, so the fallback has nothing to add.
    assert.equal(measurements, 1);

    await tick(INITIAL_MEASUREMENT_FALLBACK_MS + 60);
    assert.equal(measurements, 1);

    observer.disconnect();
    assert.deepEqual(calls, ["observe:ok", "disconnect"]);
  } finally {
    if (previousWindow === undefined) delete globals.window;
    else globals.window = previousWindow;
  }
});

test("a delayed native observer still leaves the fallback working", async () => {
  class SilentResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }

  const globals = globalThis as unknown as Record<string, unknown>;
  const previousWindow = globals.window;
  globals.window = { ResizeObserver: SilentResizeObserver };

  try {
    let measurements = 0;
    const observer = new GuaranteedResizeObserver(() => {
      measurements += 1;
    });
    observer.observe(target);
    await tick(INITIAL_MEASUREMENT_FALLBACK_MS + 60);
    assert.equal(measurements, 1);
  } finally {
    if (previousWindow === undefined) delete globals.window;
    else globals.window = previousWindow;
  }
});