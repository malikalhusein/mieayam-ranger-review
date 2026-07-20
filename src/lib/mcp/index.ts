import { auth, defineMcp } from "@lovable.dev/mcp-js";
import searchReviews from "./tools/search-reviews";
import getReview from "./tools/get-review";
import listWishlist from "./tools/list-wishlist";
import submitWishlist from "./tools/submit-wishlist";
import moderateWishlist from "./tools/moderate-wishlist";

// Build the OAuth issuer from the Supabase project ref (Vite inlines this at build time).
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "mie-ayam-ranger-mcp",
  title: "Mie Ayam Ranger",
  version: "0.1.0",
  instructions:
    "Tools for Mie Ayam Ranger — a directory of Indonesian mie ayam outlet reviews. Use `search_reviews` and `get_review` to explore the review database. Use `list_wishlist` to see community-submitted outlet suggestions, `submit_wishlist` to add a new one, and `moderate_wishlist` (admin only) to approve/reject entries.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [searchReviews, getReview, listWishlist, submitWishlist, moderateWishlist],
});
