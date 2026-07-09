const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001";

export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin"]
      }
    ],
    sitemap: `${siteUrl}/sitemap.xml`
  };
}
