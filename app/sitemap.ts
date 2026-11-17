import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://staffbase.deworld.su";
  const now = new Date();
  const publicPaths = [
    "/",
    "/login",
    "/legal/privacy",
    "/legal/terms",
    "/legal/cookies",
    "/legal/consent",
    "/legal/refund",
    "/legal/delete-data",
    "/legal/company",
  ];
  return publicPaths.map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: path === "/" ? "weekly" : "yearly",
    priority: path === "/" ? 1 : 0.5,
  }));
}
