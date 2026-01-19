import { useEffect } from "react";

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogUrl?: string;
  type?: "website" | "article";
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  noIndex?: boolean;
}

const SEOHead = ({
  title = "Mie Ayam Ranger - Review Warung Mie Ayam Terbaik",
  description = "Direktori review warung mie ayam dengan sistem penilaian objektif. Temukan mie ayam terbaik berdasarkan rasa, harga, dan fasilitas.",
  keywords = "mie ayam, review mie ayam, kuliner indonesia, warung mie ayam, mie ayam enak, rekomendasi mie ayam",
  ogImage = "/og-image.png",
  ogUrl,
  type = "website",
  author = "Mie Ayam Ranger",
  publishedTime,
  modifiedTime,
  section,
  noIndex = false,
}: SEOHeadProps) => {
  useEffect(() => {
    // Update document title
    document.title = title;

    // Helper function to update or create meta tag
    const setMetaTag = (name: string, content: string, isProperty = false) => {
      const attr = isProperty ? "property" : "name";
      let element = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement;
      
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attr, name);
        document.head.appendChild(element);
      }
      element.content = content;
    };

    // Helper function to update or create link tag
    const setLinkTag = (rel: string, href: string, type?: string) => {
      let element = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
      
      if (!element) {
        element = document.createElement("link");
        element.rel = rel;
        document.head.appendChild(element);
      }
      element.href = href;
      if (type) element.type = type;
    };

    // Basic meta tags
    setMetaTag("description", description);
    setMetaTag("keywords", keywords);
    setMetaTag("author", author);

    // Open Graph tags
    setMetaTag("og:title", title, true);
    setMetaTag("og:description", description, true);
    setMetaTag("og:type", type, true);
    setMetaTag("og:image", ogImage.startsWith("http") ? ogImage : `https://mieayamranger.web.id${ogImage}`, true);
    setMetaTag("og:image:alt", title, true);
    setMetaTag("og:image:width", "1200", true);
    setMetaTag("og:image:height", "630", true);
    if (ogUrl) {
      setMetaTag("og:url", ogUrl, true);
    }
    setMetaTag("og:site_name", "Mie Ayam Ranger", true);
    setMetaTag("og:locale", "id_ID", true);

    // Twitter Card tags
    setMetaTag("twitter:card", "summary_large_image");
    setMetaTag("twitter:site", "@mieayamranger");
    setMetaTag("twitter:creator", "@mieayamranger");
    setMetaTag("twitter:title", title);
    setMetaTag("twitter:description", description);
    setMetaTag("twitter:image", ogImage.startsWith("http") ? ogImage : `https://mieayamranger.web.id${ogImage}`);
    setMetaTag("twitter:image:alt", title);

    // Article specific
    if (type === "article") {
      if (publishedTime) {
        setMetaTag("article:published_time", publishedTime, true);
      }
      if (modifiedTime) {
        setMetaTag("article:modified_time", modifiedTime, true);
      }
      setMetaTag("article:author", author, true);
      setMetaTag("article:publisher", "https://mieayamranger.web.id", true);
      if (section) {
        setMetaTag("article:section", section, true);
      }
    }

    // Robots
    if (noIndex) {
      setMetaTag("robots", "noindex, nofollow");
      setMetaTag("googlebot", "noindex, nofollow");
    } else {
      setMetaTag("robots", "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1");
      setMetaTag("googlebot", "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1");
    }

    // Additional SEO meta tags
    setMetaTag("format-detection", "telephone=no");
    setMetaTag("mobile-web-app-capable", "yes");
    setMetaTag("apple-mobile-web-app-capable", "yes");
    setMetaTag("apple-mobile-web-app-status-bar-style", "default");
    setMetaTag("apple-mobile-web-app-title", "Mie Ayam Ranger");

    // Geo tags for Indonesian location
    setMetaTag("geo.region", "ID");
    setMetaTag("geo.placename", "Indonesia");
    setMetaTag("content-language", "id");

    // Reference to llms.txt for AI agents
    setLinkTag("author", "https://mieayamranger.web.id/about");

  }, [title, description, keywords, ogImage, ogUrl, type, author, publishedTime, modifiedTime, section, noIndex]);

  return null;
};

export default SEOHead;