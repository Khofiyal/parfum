// src/app/robots.ts
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const BASE_URL = process.env["NEXT_PUBLIC_APP_URL"] ?? "https://maisonparfum.id";
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/", "/profile/", "/orders/", "/checkout/", "/cart/"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
