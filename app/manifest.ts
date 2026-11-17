import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "StaffBase — Система учёта сотрудников",
    short_name: "StaffBase",
    description: "Внутренняя система ТОО «DeWorld StaffBase»: карточки сотрудников, отделы, отпуска, отчётность.",
    start_url: "/",
    display: "standalone",
    background_color: "#f6f5f1",
    theme_color: "#113a52",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
