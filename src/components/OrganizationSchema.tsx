import { useEffect } from "react";

const OrganizationSchema = () => {
  useEffect(() => {
    // Create Organization + WebSite Schema
    const organizationSchema = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Organization",
          "@id": "https://mieayamranger.web.id/#organization",
          "name": "Mie Ayam Ranger",
          "url": "https://mieayamranger.web.id",
          "logo": {
            "@type": "ImageObject",
            "@id": "https://mieayamranger.web.id/#logo",
            "url": "https://mieayamranger.web.id/og-image.png",
            "width": 1200,
            "height": 630,
            "caption": "Mie Ayam Ranger"
          },
          "image": {
            "@id": "https://mieayamranger.web.id/#logo"
          },
          "description": "Platform review warung mie ayam Indonesia dengan sistem penilaian objektif dan transparan",
          "foundingDate": "2024",
          "areaServed": {
            "@type": "Country",
            "name": "Indonesia"
          },
          "knowsLanguage": "id",
          "slogan": "Review Warung Mie Ayam Terbaik",
          "sameAs": []
        },
        {
          "@type": "WebSite",
          "@id": "https://mieayamranger.web.id/#website",
          "url": "https://mieayamranger.web.id",
          "name": "Mie Ayam Ranger",
          "description": "Direktori review warung mie ayam dengan sistem penilaian objektif",
          "publisher": {
            "@id": "https://mieayamranger.web.id/#organization"
          },
          "inLanguage": "id-ID",
          "potentialAction": {
            "@type": "SearchAction",
            "target": {
              "@type": "EntryPoint",
              "urlTemplate": "https://mieayamranger.web.id/?search={search_term_string}"
            },
            "query-input": "required name=search_term_string"
          }
        },
        {
          "@type": "WebPage",
          "@id": "https://mieayamranger.web.id/#webpage",
          "url": "https://mieayamranger.web.id",
          "name": "Mie Ayam Ranger - Review Warung Mie Ayam Terbaik",
          "isPartOf": {
            "@id": "https://mieayamranger.web.id/#website"
          },
          "about": {
            "@id": "https://mieayamranger.web.id/#organization"
          },
          "description": "Platform review mie ayam dengan penilaian objektif dan transparan. Temukan warung mie ayam terbaik di Indonesia.",
          "inLanguage": "id-ID",
          "primaryImageOfPage": {
            "@id": "https://mieayamranger.web.id/#logo"
          },
          "datePublished": "2024-01-01",
          "dateModified": new Date().toISOString().split('T')[0]
        }
      ]
    };

    // Insert or update the schema script
    const existingScript = document.getElementById('organization-schema');
    if (existingScript) {
      existingScript.textContent = JSON.stringify(organizationSchema);
    } else {
      const script = document.createElement('script');
      script.id = 'organization-schema';
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(organizationSchema);
      document.head.appendChild(script);
    }

    return () => {
      const script = document.getElementById('organization-schema');
      if (script) {
        script.remove();
      }
    };
  }, []);

  return null;
};

export default OrganizationSchema;
