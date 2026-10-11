import { ImageResponse } from "next/og";

/** Apple touch icon, matching the `AS` monogram used as the favicon. */
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#05060a",
          color: "#f6f2ea",
        }}
      >
        <div style={{ display: "flex", fontSize: 84, fontWeight: 800, letterSpacing: 2 }}>
          AS
        </div>
        <div style={{ display: "flex", marginTop: 10, height: 8, width: 92, background: "#c9a44d" }} />
      </div>
    ),
    { ...size },
  );
}
