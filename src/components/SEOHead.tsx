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

    // Basic meta tags
    setMetaTag("description", description);
    setMetaTag("keywords", keywords);
    setMetaTag("author", author);

    // Open Graph tags
    setMetaTag("og:title", title, true);
    setMetaTag("og:description", description, true);
    setMetaTag("og:type", type, true);
    setMetaTag("og:image", ogImage, true);
    if (ogUrl) {
      setMetaTag("og:url", ogUrl, true);
    }
    setMetaTag("og:site_name", "Mie Ayam Ranger", true);
    setMetaTag("og:locale", "id_ID", true);

    // Twitter Card tags
    setMetaTag("twitter:card", "summary_large_image");
    setMetaTag("twitter:title", title);
    setMetaTag("twitter:description", description);
    setMetaTag("twitter:image", ogImage);

    // Article specific
    if (type === "article" && publishedTime) {
      setMetaTag("article:published_time", publishedTime, true);
      setMetaTag("article:author", author, true);
    }

    // Robots
    setMetaTag("robots", "index, follow");
    setMetaTag("googlebot", "index, follow");

  }, [title, description, keywords, ogImage, ogUrl, type, author, publishedTime]);

  return null;
};

export default SEOHead;