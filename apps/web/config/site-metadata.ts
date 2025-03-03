import { type Metadata } from "next";
import { siteConfig } from "./site-config";

export const siteMetadata: Metadata = {
  metadataBase: new URL(siteConfig.siteUrl),
  authors: {
    name: "Maksym Ryndia",
  },
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.name}`,
  },
  applicationName: siteConfig.name,
  description: siteConfig.description,
  openGraph: {
    title: siteConfig.title,
    siteName: siteConfig.name,
    description: siteConfig.description,
    url: "./",
    images: [siteConfig.siteLogo],
    locale: "en_US",
    type: "website",
    emails: siteConfig.supportEmail,
  },
  alternates: {
    canonical: "./",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  twitter: {
    title: siteConfig.title,
    card: "summary_large_image",
    images: [siteConfig.socialbanner],
    description: siteConfig.description,
    creator: siteConfig.twitter,
  },
};
