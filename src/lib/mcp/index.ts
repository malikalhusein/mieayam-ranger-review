import { auth, defineMcp } from "@lovable.dev/mcp-js";
import searchReviews from "./tools/search-reviews";
import getReview from "./tools/get-review";
import listWishlist from "./tools/list-wishlist";
import submitWishlist from "./tools/submit-wishlist";
import moderateWishlist from "./tools/moderate-wishlist";
import getReviewTemplate from "./tools/get-review-template";
import previewScore from "./tools/preview-score";
import createReview from "./tools/create-review";
import updateReview from "./tools/update-review";
import attachReviewImage from "./tools/attach-review-image";
import publishReview from "./tools/publish-review";
import discardDraft from "./tools/discard-draft";

// Build the OAuth issuer from the Supabase project ref (Vite inlines this at build time).
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "mieayam-ranger-review",
  title: "mieayam-ranger-review",
  version: "0.3.0",
  instructions:
    "Tools for Mie Ayam Ranger — Indonesian mie ayam outlet reviews. Explore with `search_reviews` and `get_review`. To publish a review from chat: call `get_review_template`, collect missing scores from the user, call `preview_score`, confirm with the user, then `create_review` (saves an unpublished draft; reuse the same request_id on retry), show the summary and ask for explicit approval, then `publish_review` (or `discard_draft` to cancel); add photos with `attach_review_image` (pass chat photos as base64); fix mistakes with `update_review`. Writing reviews requires an admin account. Wishlist: `list_wishlist`, `submit_wishlist`, `moderate_wishlist` (admin).",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    searchReviews, getReview, listWishlist, submitWishlist, moderateWishlist,
    getReviewTemplate, previewScore, createReview, publishReview, discardDraft, updateReview, attachReviewImage,
  ],
});
