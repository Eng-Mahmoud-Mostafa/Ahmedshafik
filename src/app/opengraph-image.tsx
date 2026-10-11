import { ImageResponse } from "next/og";

/**
 * Social sharing card, generated from the same palette and typography as the
 * site. Latin-only by design: the default font has no Arabic glyphs, so mixing
 * in the Arabic name here would risk missing characters. The Arabic name still
 * appears in the page itself and in its metadata.
 */
export const alt =
  "Ahmed Said Shafik — Egyptian international volleyball outside hitter";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#05060a",
          backgroundImage:
            "radial-gradient(circle at 78% 12%, rgba(206,17,38,0.32), transparent 55%)",
          padding: "72px 80px",
          color: "#f6f2ea",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ width: 64, height: 4, background: "#ce1126" }} />
          <div
            style={{
              display: "flex",
              fontSize: 26,
              letterSpacing: 6,
              textTransform: "uppercase",
              color: "#ff3b4f",
            }}
          >
            Egyptian International
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 128, fontWeight: 800 }}>
            Ahmed
          </div>
          <div style={{ display: "flex", fontSize: 128, fontWeight: 800, color: "#ce1126" }}>
            Said Shafik
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ display: "flex", height: 4, width: 220, background: "#c9a44d" }} />
          <div style={{ display: "flex", fontSize: 30, color: "#b7b0a3" }}>
            Outside hitter · Born 7 December 1994 · 190 cm
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
