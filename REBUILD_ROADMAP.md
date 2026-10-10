# Dimplesluxe Premium Rebuild — Fast-Track Roadmap

## North-star outcome

Build a fast, mobile-first **luxury hair concierge** that retains Dimplesluxe's established brand colour, makes high-value hair purchases feel safe and personal, and converts customers from discovery to a complete recommended look.

The new storefront will be built and verified separately from production. The current site remains live until the replacement meets the launch gate.

## Working rules

- Ship in small, reviewable slices; never wait for the entire rebuild to see progress.
- Mobile purchase flow is the primary experience; desktop is polished alongside it.
- Reuse the existing Supabase backend where it is sound; migrate deliberately rather than recreate customer/order data.
- Use real product, client, and brand assets wherever possible. Premium design cannot rely on generic stock imagery.
- A phase closes only when its acceptance checks are complete.

## Phase 0 — Discovery and technical audit (1–2 working days)

### Deliverables

- Current-project map: framework, routes, components, dependencies, deployment, environment variables, and integrations.
- Supabase map: tables, auth, storage buckets, policies, edge functions, payments, and data ownership.
- Production journey audit: landing, product discovery, product page, cart, checkout, order confirmation, and post-purchase.
- Brand inventory: current colour tokens, logo files, typography, product/UGC media, and content gaps.
- Migration and risk register, including what can be reused safely.

### Acceptance checks

- We can run the project locally without modifying production.
- Every production dependency has an identified owner and replacement/retention decision.
- The new build has a safe environment strategy: local, staging, then production.

## Phase 1 — Luxury direction and conversion blueprint (2–3 working days)

### Deliverables

- Design system built around the existing signature brand colour: palette, type pairings, spacing, buttons, cards, forms, motion, and image treatment.
- Information architecture for shop, collections, product details, help, consultations, editorial, account, and VIP areas.
- Page-level wireframes and content plan for mobile and desktop.
- The “Find Your Luxe” quiz logic and “Build My Look” bundle rules.
- A prioritized feature scope: launch-critical, phase-two, and deliberately deferred.

### Acceptance checks

- One approved creative direction, rather than a mixture of trends.
- Each major page has one primary conversion action and clear secondary actions.
- Product, content, and policy gaps are listed before implementation begins.

## Phase 2 — Storefront foundation (5–7 working days)

### Deliverables

- Next.js application shell, responsive navigation, search, announcement bar, account entry, cart, and accessible UI primitives.
- Cinematic home page with editorial product storytelling, trust proof, transformations, and strong calls to action.
- Collection/browse experience with useful filters and elevated product cards.
- Premium product page: length/texture/colour variants, clear availability, visual scale, care, delivery/returns, real reviews, and complementary products.
- Cart and checkout hand-off, with a complete mobile purchase path.

### Acceptance checks

- A customer can discover, configure, add, and begin purchasing any in-stock product on a phone.
- Keyboard and screen-reader basics work; there are no broken routes, layout jumps, or placeholder purchase controls.
- Core pages meet agreed performance budgets on mobile.

## Phase 3 — Dimplesluxe signature experience (4–6 working days)

### Deliverables

- **Find Your Luxe:** a short visual matcher that recommends products based on desired style, texture, length, fullness, parting, budget, and urgency.
- **Build My Look:** complete-look bundles that pair bundles, closure/frontal, lengths, quantities, and a transparent total.
- Saved hair profile and one-tap reordering for returning customers.
- Consultation/custom-order flow with image uploads, preferred contact method, and an internal review queue.
- VIP/loyalty foundations: wishlist, saved looks, early-access hooks, and reorder reminders.

### Acceptance checks

- Quiz recommendations only show valid, available combinations.
- A complete recommended look can be added to cart in a single action.
- Consultation submissions are secure, traceable, and actionable by the team.

## Phase 4 — Backend, operations, and growth (3–5 working days)

### Deliverables

- Supabase schema/policies and storage flows finalized for products, product media, profiles, quiz results, wishlists, consultations, and operational notifications.
- Payment, inventory, order, discounts, delivery, and transactional email/WhatsApp integrations verified end to end.
- Lightweight content/admin workflows so the team can manage products, editorial content, transformations, and consultation replies without a developer.
- SEO metadata, structured product data, redirects, analytics events, consent, and error monitoring.

### Acceptance checks

- Test order, payment result, fulfilment notification, and customer confirmation are all verified.
- No public route can expose another customer’s profile, uploads, or orders.
- The team can change a price, inventory level, image, and featured collection safely.

## Phase 5 — Quality, migration, and launch readiness (3–4 working days)

### Deliverables

- Test pass across current mobile browsers, desktop, tablets, slow-network scenarios, and high-value purchase paths.
- Accessibility and performance fixes, image optimization, security review, and SEO preflight.
- Production data/content migration rehearsal and rollback plan.
- Launch checklist, support playbook, staff walkthrough, and client sign-off review.

### Launch gate

- Critical journey: browse → product → complete look → cart → payment → confirmation passes in staging.
- No high-severity errors, broken links, missing legal/policy routes, or data-policy failures.
- The client approves brand, catalogue, delivery/returns copy, and final launch content.

## Phase 6 — Controlled launch and optimization (launch day + 14 days)

### Deliverables

- Controlled production cutover with monitoring and rapid rollback capability.
- Daily review of errors, payments, search terms, drop-offs, consultation submissions, and conversion events during the first week.
- A focused optimization release based on actual shopper behaviour: copy, imagery, filters, quiz logic, checkout friction, and bundle recommendations.

### Success signals

- Fast, reliable mobile storefront and clean completed-order telemetry.
- Increased add-to-cart and checkout-start rate on featured products.
- Meaningful use of the matcher, complete-look builder, saved profile, and consultation flow.

## Progress cadence

- **Every completed slice:** working link/screenshot plus acceptance-check result.
- **Every phase:** concise change log, test evidence, known issues, and explicit go/no-go decision.
- **Source control:** one focused branch/commit set per feature slice; no production-only edits.

## Immediate next actions

1. Complete the codebase and Supabase audit.
2. Extract the existing brand system and production data model.
3. Produce the first approved luxury design direction and launch scope.
