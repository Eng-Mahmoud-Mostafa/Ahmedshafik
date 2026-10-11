import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Ahmed Said Shafik — Egyptian Volleyball Outside Hitter",
    short_name: "Ahmed Shafik",
    description:
      "Portfolio of Ahmed Said Shafik, Egyptian international volleyball outside hitter.",
    start_url: "/",
    display: "standalone",
    background_color: "#05060a",
    theme_color: "#05060a",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
