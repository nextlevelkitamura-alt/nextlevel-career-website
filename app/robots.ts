import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://nextlevelcareer-official.com';

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: '/admin/', // Optional: Disallow admin routes if they exist and shouldn't be indexed
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
