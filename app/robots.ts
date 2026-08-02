import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/studio/',
        '/collection/screen/m/',
        '/collection/screen/s/',
        '/collection/screen/p/',
        '/collection/screen/search',
        '/collection/screen/test/',
      ],
    },
    sitemap: 'https://mehmetyildiz.dev/sitemap.xml',
    host: 'https://mehmetyildiz.dev',
  };
}
