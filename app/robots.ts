import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow:     "/",
        disallow:  ["/admin/", "/api/cms/", "/api/auth/"],
      },
    ],
    sitemap: "https://samenterprises.com/sitemap.xml",
  };
}
