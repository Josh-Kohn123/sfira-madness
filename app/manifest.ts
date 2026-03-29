import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Sfira Madness",
    short_name: "Sfira",
    description: "Predict your friends. Count the Omer.",
    start_url: "/",
    display: "standalone",
    background_color: "#1a1040",
    theme_color: "#1a1040",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
