import { User } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/server";

export type PublicBanner = {
  id: string;
  title: string;
  image_url: string;
  link_url: string | null;
};

export async function getOptionalAuthContext(): Promise<{
  user: User | null;
  isAdmin: boolean;
}> {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      if (userError) {
        console.error("Failed to fetch current user:", userError.message);
      }
      return { user: null, isAdmin: false };
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      console.error("Failed to fetch profile:", profileError.message);
    }

    return { user, isAdmin: profile?.is_admin === true };
  } catch (error) {
    console.error("Failed to initialize auth context:", error);
    return { user: null, isAdmin: false };
  }
}

export async function getSafeActiveBanners(): Promise<PublicBanner[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("banners")
      .select("id, title, image_url, link_url")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Failed to fetch banners:", error.message);
      return [];
    }

    return (data ?? []).filter(isValidBanner);
  } catch (error) {
    console.error("Failed to initialize banners query:", error);
    return [];
  }
}

export type PublicHighlightCard = {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  link_url: string | null;
  category: string;
  badge_text: string | null;
};

export async function getSafeActiveHighlightCards(): Promise<PublicHighlightCard[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("highlight_cards")
      .select("id, title, description, image_url, link_url, category, badge_text")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Failed to fetch highlight cards:", error.message);
      return [];
    }

    return (data ?? []).filter(isValidHighlightCard);
  } catch (error) {
    console.error("Failed to initialize highlight cards query:", error);
    return [];
  }
}

function isValidHighlightCard(value: unknown): value is PublicHighlightCard {
  if (!value || typeof value !== "object") return false;
  const card = value as Record<string, unknown>;
  return (
    typeof card.id === "string" &&
    typeof card.title === "string" &&
    typeof card.image_url === "string" &&
    card.image_url.trim().length > 0
  );
}

function isValidBanner(value: unknown): value is PublicBanner {
  if (!value || typeof value !== "object") {
    return false;
  }

  const banner = value as Record<string, unknown>;
  return (
    typeof banner.id === "string" &&
    typeof banner.title === "string" &&
    typeof banner.image_url === "string" &&
    banner.image_url.trim().length > 0 &&
    (typeof banner.link_url === "string" || banner.link_url === null)
  );
}
