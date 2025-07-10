import { Helmet } from "react-helmet";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
}

const SEO = ({
  title = "LTR Studio - Professional 3D Visualization & Architectural Design",
  description = "LTR Studio specializes in high-quality 3D visualization, architectural design, and interior rendering. Transform your ideas into stunning visual reality.",
  keywords = "ltr, LTR Studio, 3D visualization, architectural design, interior design, rendering, Vietnam architecture",
  image = "/src/assets/images/og-image.jpg",
  url = "https://ltrstudio.com",
}: SEOProps) => {
  return (
    <Helmet>
      {/* Basic meta tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />

      {/* Open Graph meta tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />

      {/* Twitter Card meta tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Canonical URL */}
      <link rel="canonical" href={url} />

      {/* Additional meta tags for SEO */}
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow" />
      <meta name="revisit-after" content="7 days" />
      <meta name="author" content="LTR Studio" />
      <meta name="language" content="English" />
    </Helmet>
  );
};

export default SEO;
