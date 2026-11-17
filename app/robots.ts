import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/legal/", "/login"],
        disallow: ["/dashboard", "/employees", "/departments", "/positions", "/leaves", "/settings", "/admin", "/api/"],
      },
    ],
    sitemap: "https://staffbase.deworld.su/sitemap.xml",
  };
}
