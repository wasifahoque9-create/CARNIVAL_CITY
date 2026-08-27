// Add this interface to your existing frontend/types/index.ts (anywhere near
// the other catalog types like Category / Product).

export interface Banner {
  id: number;
  tag: string | null;
  title: string;
  highlight: string | null;
  description: string | null;
  price: number | null;
  discount_text: string | null;
  cta_text: string | null;
  cta_link: string | null;
  secondary_cta_text: string | null;
  secondary_cta_link: string | null;
  image_path: string | null;
  fallback_emoji: string;
  sort_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}
