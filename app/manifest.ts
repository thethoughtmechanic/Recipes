import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Misu’s Recipe Book",
    short_name: "Misu’s",
    description:
      "A weights-first personal recipe book with exact whole-egg scaling.",
    start_url: "/",
    display: "standalone",
    background_color: "#1E1814",
    theme_color: "#1E1814",
    orientation: "any",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable",
      },
    ],
  };
}
