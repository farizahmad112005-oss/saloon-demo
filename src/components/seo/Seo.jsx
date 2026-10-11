import { Helmet } from 'react-helmet-async';

const SITE_NAME = "Velour Men's Salon";
const DEFAULT_DESCRIPTION =
  "Velour Men's Salon — best men's salon & barber shop in Faisalabad. Book haircuts, fades, beard grooming & packages online. Market Place 204, Canal Road. Call 03007273029.";
const DEFAULT_KEYWORDS =
  'Velour, Velour Salon, Velour Men Salon, men salon, mens salon, men saloon, best men salon, best mens salon Faisalabad, salon in Faisalabad, saloon in Faisalabad, barber shop, barber shops, top barber shops Pakistan, top barber shops Faisalabad, haircut Faisalabad, fade Faisalabad, beard trim, Canal Road salon, Market Place 204';

/**
 * Per-page SEO head tags for SPA routes.
 * @param {{ title?: string, description?: string, path?: string, keywords?: string, type?: string, noindex?: boolean, jsonLd?: object|object[] }} props
 */
export default function Seo({
  title,
  description = DEFAULT_DESCRIPTION,
  path = '/',
  keywords = DEFAULT_KEYWORDS,
  type = 'website',
  noindex = false,
  jsonLd,
}) {
  const siteUrl = (import.meta.env.VITE_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : '')).replace(
    /\/$/,
    ''
  );
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} | Best Men's Barber Shop in Faisalabad`;
  const url = `${siteUrl}${path.startsWith('/') ? path : `/${path}`}`;
  const image = `${siteUrl}/logo.png`;
  const schemas = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];

  return (
    <Helmet>
      <html lang="en" />
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="Velour Men's Salon" />
      <meta name="robots" content={noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large'} />
      <meta name="geo.region" content="PK-PB" />
      <meta name="geo.placename" content="Faisalabad" />
      <meta name="geo.position" content="31.4504;73.1350" />
      <meta name="ICBM" content="31.4504, 73.1350" />
      <link rel="canonical" href={url} />

      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:locale" content="en_PK" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {schemas.map((schema, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
}

export function localBusinessJsonLd(settings) {
  const siteUrl = (import.meta.env.VITE_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : '')).replace(
    /\/$/,
    ''
  );
  return {
    '@context': 'https://schema.org',
    '@type': ['BarberShop', 'HairSalon', 'LocalBusiness'],
    '@id': `${siteUrl}/#business`,
    name: settings?.salon_name || "Velour Men's Salon",
    alternateName: ['Velour', 'Velour Salon', 'Velour Men Salon', "Velour Men's Hair Salon"],
    description: DEFAULT_DESCRIPTION,
    url: siteUrl || undefined,
    telephone: settings?.phone || '03007273029',
    email: settings?.email || 'farizahmad112005@gmail.com',
    image: siteUrl ? `${siteUrl}/logo.png` : undefined,
    address: {
      '@type': 'PostalAddress',
      streetAddress: settings?.address || 'Market Place 204 1st Floor Near Crumble, Canal Road',
      addressLocality: 'Faisalabad',
      addressRegion: 'Punjab',
      addressCountry: 'PK',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 31.4504,
      longitude: 73.135,
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: String(settings?.opening_time || '10:00').slice(0, 5),
      closes: String(settings?.closing_time || '22:00').slice(0, 5),
    },
    priceRange: 'PKR',
    areaServed: {
      '@type': 'City',
      name: 'Faisalabad',
    },
    sameAs: [
      settings?.social_links?.instagram,
      settings?.social_links?.facebook,
      settings?.social_links?.tiktok,
    ].filter(Boolean),
  };
}

export { DEFAULT_DESCRIPTION, DEFAULT_KEYWORDS, SITE_NAME };
