import type { MetadataRoute } from "next";
import { cities, counties, listings, siteUrl } from "@/data/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/for-sale", "/for-rent", "/resources", "/service-pros", "/data-sources"];
  return [
    ...staticRoutes.map((route) => ({ url: `${siteUrl}${route}`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: route === "" ? 1 : 0.9 })),
    ...cities.map((city) => ({ url: `${siteUrl}/cities/${city.slug}`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.85 })),
    ...counties.map((county) => ({ url: `${siteUrl}/counties/${county.slug}`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.85 })),
    ...listings.map((listing) => ({ url: `${siteUrl}/listings/${listing.slug}`, lastModified: new Date(), changeFrequency: "daily" as const, priority: listing.status === "active" ? 0.95 : 0.6 })),
  ];
}
