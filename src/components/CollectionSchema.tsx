import { useEffect } from "react";

interface Review {
  id: string;
  slug?: string;
  outlet_name: string;
  city: string;
  address: string;
  overall_score?: number;
  image_url?: string;
  image_urls?: string[];
  visit_date: string;
  price: number;
  product_type: string;
}

interface CollectionSchemaProps {
  reviews: Review[];
  title?: string;
  description?: string;
}

const CollectionSchema = ({ 
  reviews, 
  title = "Review Mie Ayam Terbaik di Indonesia",
  description = "Koleksi review warung mie ayam dengan penilaian objektif dan terverifikasi"
}: CollectionSchemaProps) => {
  useEffect(() => {
    if (!reviews || reviews.length === 0) return;

    const baseUrl = "https://mieayamranger.web.id";

    // Create ItemList schema for reviews collection
    const itemListSchema = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": title,
      "description": description,
      "numberOfItems": reviews.length,
      "itemListOrder": "https://schema.org/ItemListOrderDescending",
      "itemListElement": reviews.slice(0, 20).map((review, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "Restaurant",
          "@id": `${baseUrl}/reviews/${review.slug || review.id}`,
          "name": review.outlet_name,
          "url": `${baseUrl}/reviews/${review.slug || review.id}`,
          "address": {
            "@type": "PostalAddress",
            "streetAddress": review.address,
            "addressLocality": review.city,
            "addressCountry": "ID"
          },
          "servesCuisine": "Indonesian",
          "priceRange": review.price <= 15000 ? "$" : review.price <= 20000 ? "$$" : "$$$",
          "image": review.image_urls?.[0] || review.image_url || `${baseUrl}/og-image.png`,
          "aggregateRating": review.overall_score ? {
            "@type": "AggregateRating",
            "ratingValue": Math.min(10, review.overall_score).toFixed(1),
            "bestRating": "10",
            "worstRating": "0",
            "ratingCount": 1
          } : undefined
        }
      }))
    };

    // Create FAQPage schema for common questions
    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Apa itu Mie Ayam Ranger?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Mie Ayam Ranger adalah platform review warung mie ayam di Indonesia yang menggunakan sistem penilaian objektif dan transparan. Kami menilai berdasarkan kualitas mie, ayam, kuah/goreng, fasilitas, dan service."
          }
        },
        {
          "@type": "Question",
          "name": "Bagaimana sistem penilaian Mie Ayam Ranger?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Kami menggunakan sistem scoring 0-10 berdasarkan beberapa kategori: tekstur mie, bumbu dan potongan ayam, karakteristik kuah atau goreng, fasilitas tempat, dan durasi penyajian. Setiap kategori memiliki bobot yang berbeda untuk menghasilkan skor akhir yang objektif."
          }
        },
        {
          "@type": "Question",
          "name": "Apa perbedaan antara mie ayam kuah dan goreng?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Mie ayam kuah disajikan dengan kuah kaldu yang dinilai dari kekentalan, keseimbangan rasa, kualitas kaldu, aroma, dan kejernihan. Mie ayam goreng dinilai dari keseimbangan minyak, bumbu tumisan, dan aroma tumisan."
          }
        },
        {
          "@type": "Question",
          "name": "Apakah review Mie Ayam Ranger independen?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Ya, semua review di Mie Ayam Ranger bersifat independen dan objektif. Kami tidak menerima pembayaran atau sponsorship untuk review positif. Metodologi penilaian kami transparan dan konsisten."
          }
        }
      ]
    };

    // Insert schemas
    ['collection-schema', 'faq-schema'].forEach(id => {
      const existing = document.getElementById(id);
      if (existing) existing.remove();
    });

    const collectionScript = document.createElement('script');
    collectionScript.id = 'collection-schema';
    collectionScript.type = 'application/ld+json';
    collectionScript.textContent = JSON.stringify(itemListSchema);
    document.head.appendChild(collectionScript);

    const faqScript = document.createElement('script');
    faqScript.id = 'faq-schema';
    faqScript.type = 'application/ld+json';
    faqScript.textContent = JSON.stringify(faqSchema);
    document.head.appendChild(faqScript);

    return () => {
      ['collection-schema', 'faq-schema'].forEach(id => {
        const script = document.getElementById(id);
        if (script) script.remove();
      });
    };
  }, [reviews, title, description]);

  return null;
};

export default CollectionSchema;
