import { Helmet } from "react-helmet";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  schema?: any;
}

const SEO = ({
  title = "LTR Studio - Professional 3D Visualization & Architectural Design in Vietnam",
  description = "LTR Studio - Leading 3D visualization and architectural design studio in Vietnam. Specializing in photorealistic renders, architectural visualization, and interior design. Transform your ideas into stunning visual reality.",
  keywords = "ltr studio, LTR Studio Vietnam, 3D visualization Vietnam, architectural design Vietnam, interior design Vietnam, 3D rendering Vietnam, architectural visualization, interior rendering, exterior rendering, 3D animation Vietnam",
  image = "/src/assets/images/og-image.jpg",
  url = "https://ltrvisuals.com",
  schema,
}: SEOProps) => {
  const defaultSchema = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: "LTR Studio",
    description: description,
    image: image,
    url: url,
    address: {
      "@type": "PostalAddress",
      addressCountry: "Vietnam",
    },
    priceRange: "$$",
    sameAs: [
      "https://www.facebook.com/people/LTR-Studio/61569704919964/?sk=about",
      "https://www.instagram.com/render.ltr",
    ],
  };

  return (
    <Helmet>
      {/* Basic meta tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />

      {/* Google Site Verification *   <meta name="google-site-verification" content="[Pa
s       te the content Google provides 
       here]" />

      {/* Viewport */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />

      {/* Open Graph meta tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="LTR Studio" />
      <meta property="og:locale" content="en_US" />

      {/* Twitter Card meta tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:site" content="@ltrstudio" />

      {/* Canonical URL */}
      <link rel="canonical" href={url} />

      {/* Additional meta tags for SEO */}
      <meta
        name="robots"
        content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"
      />
      <meta name="googlebot" content="index, follow" />
      <meta name="revisit-after" content="7 days" />
      <meta name="author" content="LTR Studio" />
      <meta name="language" content="English" />
      <meta name="geo.region" content="VN" />
      <meta name="geo.position" content="10.762622;106.660172" />
      <meta name="ICBM" content="10.762622, 106.660172" />

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(schema || defaultSchema)}
      </script>
    </Helmet>
  );
};

export default SEO;
