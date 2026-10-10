# Dimplesluxe Rebuild — Phase 0 Audit

**Status:** in progress — codebase and checked-in schema reviewed; production Supabase, deployment configuration, and live payment journey still require verification.

## Confirmed foundations

- **Framework:** Next.js 14 / React 18 with Tailwind, Framer Motion, and Zustand.
- **Commerce:** existing catalogue, cart, checkout, Stripe Checkout routes, order confirmation, customer auth, search, product pages, and admin product/order/customer tooling.
- **Backend:** Supabase Auth, Postgres, Storage-backed product media, and RLS-oriented schema migrations.
- **Existing brand direction:** Playfair Display and Inter, with the established pink/rose signature (`#ec4899`), are already used throughout the storefront. The premium redesign will preserve that recognisable colour while replacing the generic gradient/card treatment with a richer, more editorial system.

## What can be retained

- Product, category, image, order, review, wishlist, and admin concepts.
- Existing Supabase and Stripe accounts/integrations, subject to production verification.
- The existing product-management/admin surface as a starting point for the operations redesign.
- GBP/NGN currency support as a business requirement.

## Rebuild decisions already clear

1. Treat product variants as first-class records rather than arrays on `products`. Length, texture, colour, availability, media, SKU, price, and stock must be independently controllable.
2. Add a complete-look model for curated bundle combinations and Hair Match recommendations.
3. Use a saved customer hair profile for quiz results, favourites, consultations, and easy reorders.
4. Replace hard-coded homepage testimonials and generic external imagery with managed Dimplesluxe editorial/UGC content.
5. Keep the current website live while the replacement is built in an isolated staging environment.

## Launch-critical reconciliation items

These are comparisons between the **checked-in migrations** and the current application code. They are not assertions about production until the live project is inspected.

- The client auth store reads from a `users` profile table, but no checked-in migration creates it.
- The Stripe webhook writes order/payment/analytics fields and tables not present in the checked-in schema, including `payment_status`, Stripe IDs, payment detail fields, and analytics/error records.
- The committed `orders.id` and `payments.order_id` are UUID-based, while the webhook converts an order UUID with `parseInt(...)` before inserting the payment record.
- The webhook references `formatPrice` without importing or defining it, then sends its email through a relative server-side `/api/send-email` request. Both need verified, durable replacements.
- Payment/webhook processing needs explicit idempotency before stock is reduced or payment records are written, so Stripe retries cannot produce duplicates or decrement stock twice.
- Current client-side cart item identity is product-only. The rebuild must distinguish selections such as the same product at different lengths, colours, or complete-look configurations.

## Verification still required

- No local environment file is present in this checkout. The deployment owner must safely confirm values and ownership for the Supabase, Stripe, base-URL, and transactional-email variables referenced by the app; credentials must never be committed to source control.
- Compare live Supabase schema, RLS policies, functions, storage buckets, and migrations against this repository.
- Verify Stripe mode, webhook event delivery, payment-method availability, tax/shipping settings, and a staging test order.
- Identify live hosting/deployment, environment-variable ownership, domain/DNS setup, analytics, email provider, and any WhatsApp/social integrations.
- Inventory legitimate product photography, videos, testimonials, policy copy, delivery zones, and fulfilment rules.
- Confirm which products and pricing variants are current; the seed migration contains example catalogue data and stock, so it cannot be assumed to represent production.

## Next checkpoint

Complete the production integration comparison, then lock the new data model and staging plan before storefront implementation starts.
