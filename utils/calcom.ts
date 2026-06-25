type CalComMetadata = Record<string, string | null | undefined>;
type CalComPrefill = {
    name?: string | null;
    email?: string | null;
    phone?: string | null;
};

const DEFAULT_CALCOM_CONSULT_SLUG = "career-nextlevel-j2gviw/sodan";

export function buildCalComUrl(
    slug: string,
    metadata: CalComMetadata = {},
    prefill: CalComPrefill = {},
) {
    const params = new URLSearchParams();
    params.set("theme", "light");
    params.set("locale", "ja");

    for (const [key, value] of Object.entries(metadata)) {
        if (!value) continue;
        params.set(`metadata[${key}]`, value);
    }

    if (prefill.name) {
        params.set("name", prefill.name);
    }
    if (prefill.email) {
        params.set("email", prefill.email);
    }
    if (prefill.phone) {
        params.set("phone", prefill.phone);
        params.set("attendeePhoneNumber", prefill.phone);
        params.set("metadata[phoneNumber]", prefill.phone);
    }

    return `https://cal.com/${slug}?${params.toString()}`;
}

export function buildPublicConsultationUrl(metadata: CalComMetadata = {}) {
    const slug =
        process.env.NEXT_PUBLIC_CALCOM_CONSULT_URL?.trim() ||
        DEFAULT_CALCOM_CONSULT_SLUG;

    return buildCalComUrl(slug, {
        clickType: "consult",
        ...metadata,
    });
}
