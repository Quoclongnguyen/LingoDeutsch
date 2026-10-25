---
name: stitch-ui-implementation
description: Implement or review Lingo Deutsch user interfaces from the approved Stitch designs and DESIGN.md. Use for pages, components, responsive layout, theming, interaction states, or accessibility; do not use for database-only work.
---

# Stitch UI implementation

Read `docs/DESIGN.md` and the applicable product flow in `docs/PRD.md`. Treat the Stitch screens as visual references and the documents as the maintainable contract.

## Visual invariants

- Use Plus Jakarta Sans and the documented mono treatment for phonetics and grammar metadata.
- Use Sea Glass as the single decorative accent.
- Implement semantic light and dark tokens; do not duplicate page markup per theme.
- Keep the five primary destinations stable: Hôm nay, Học, Từ vựng, Luyện tập, Tiến độ.
- Avoid pure black, purple/neon styling, decorative gradients, glow, glassmorphism, and equal-card dashboard grids.
- Do not copy commercial, marketplace, upgrade, ranking, classroom, community, or support-chat elements from references.

## Interaction and accessibility

- Support keyboard operation and visible focus states.
- Use at least `44 × 44px` targets for primary interactive controls.
- Pair status color with text, icon, or shape.
- Provide meaningful loading skeleton, empty, error, disabled, selected, and saved states.
- Prevent horizontal page scrolling; convert vocabulary tables to labeled records on narrow screens.
- Respect `prefers-reduced-motion` and animate only transform/opacity when motion is useful.

## Delivery

Build reusable components only where behavior or styling is genuinely shared. Verify the affected viewport in both themes and add component or end-to-end coverage for important interactions.
