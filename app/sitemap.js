const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001";

export default function sitemap() {
  return [
    {
      url: siteUrl,
      lastModified: new Date("2026-07-09"),
      changeFrequency: "weekly",
      priority: 1
    }
  ];
}
