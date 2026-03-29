import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Sfira Madness",
    short_name: "Sfira",
    description: "Guess how far your friends will count the Omer.",
    start_url: "/",
    display: "standalone",
    background_color: "#1a1040",
    theme_color: "#1a1040",
    icons: [
      { src: "/icons/icon-192.svg", sizes: "192x192", type: "image/svg+xml" },
      { src: "/icons/icon-512.svg", sizes: "512x512", type: "image/svg+xml" },
    ],
  };
}
