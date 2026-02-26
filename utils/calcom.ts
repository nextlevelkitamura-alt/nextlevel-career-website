type CalComMetadata = Record<string, string | null | undefined>;

export function buildCalComUrl(slug: string, metadata: CalComMetadata = {}) {
    const params = new URLSearchParams();
    params.set("theme", "light");

    for (const [key, value] of Object.entries(metadata)) {
        if (!value) continue;
        params.set(`metadata[${key}]`, value);
    }

    return `https://cal.com/${slug}?${params.toString()}`;
}
