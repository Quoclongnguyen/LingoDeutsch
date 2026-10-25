# Design System: Lingo Deutsch — German Study & Career Companion

> Source project: Google Stitch project `13171068280736042527`
> Scope: a personal German-learning journey from A1 to B2/C1, exam preparation, study in Germany, workplace German, daily-life integration, desktop and mobile
> Design direction: **Berlin Study Atelier**

## 1. Visual Theme & Atmosphere

Lingo Deutsch should feel like a quiet, premium German study atelier built around one real ambition: becoming ready to study, work, and live independently in Germany. It is focused enough for long evening sessions, practical enough for everyday bureaucracy and workplace communication, and warm enough to sustain a multi-year personal journey.

- **Density: 6/10 — Daily App Balanced.** Dashboards and analytics can be information-rich, while lessons and quizzes remove everything that competes with the current task.
- **Variance: 6/10 — Offset Asymmetric.** Marketing and overview screens use deliberate left-weighted composition, staggered modules, and unequal grid spans. Learning flows remain calmer and more linear.
- **Motion: 5/10 — Fluid and restrained.** Motion confirms progress, selection, recording, and completion; it never competes with study content.
- **Core qualities:** clear, calm, disciplined, tactile, practical, encouraging, adult-oriented, Germany-specific.
- **Visual hierarchy:** typography, spacing, dividers, and surface luminance establish hierarchy before elevation. Cards exist only when they group a meaningful task or state.
- **Accessibility:** body copy and interactive controls target WCAG AA or better. Meaning is never encoded by color alone.

Light mode is the default for daytime study; dark mode is an equal, manually selectable counterpart for evening sessions. Both modes preserve the same hierarchy, spacing, one-accent rule, and information density. The theme toggle must be visible in the persistent shell, remember the learner's preference, respect the system preference on first visit, and never flash the wrong theme during load. Avoid literal German-flag theming: black, red, and gold may appear in factual country imagery, but never as the interface palette.

## 2. Color Palette & Roles

Use one cool-neutral palette across the product. **Sea Glass is the only decorative/brand accent.** Success, warning, and error colors are reserved for semantic feedback and must never become decorative accents.

### Core neutrals

- **Night Canvas** (`#0F1214`) — Primary dark-mode viewport background.
- **Deep Surface** (`#171B1E`) — Navigation, large section bands, docked utilities.
- **Raised Surface** (`#22272B`) — Interactive modules, inputs, quiz options, menus.
- **High Surface** (`#2B3236`) — Hovered or selected neutral surfaces.
- **Mist Canvas** (`#F4F7F6`) — Primary light-mode viewport background.
- **Clear Surface** (`#FFFFFF`) — Light-mode raised modules and controls.
- **Ink** (`#18201F`) — Primary text on light backgrounds; never use pure black.
- **Chalk** (`#E8ECEB`) — Primary text on dark backgrounds.
- **Quiet Slate** (`#A7B0AE`) — Secondary text on dark backgrounds.
- **Muted Slate** (`#65706E`) — Secondary text on light backgrounds.
- **Structural Line** (`#46504E`) — Dark-mode borders and separators at controlled opacity.
- **Pale Line** (`#D9E0DE`) — Light-mode borders and separators.

### Theme behavior and contrast

- Light mode uses Mist Canvas, Clear Surface, Ink, Muted Slate, and Pale Line. It must feel bright but never stark or washed out.
- Dark mode uses Night Canvas, Deep Surface, Raised Surface, Chalk, Quiet Slate, and Structural Line. Never use pure black for canvas, surfaces, or text.
- The active theme control is a compact two-state `Sáng / Tối` segmented control or sun/moon icon button with an accessible text label and `aria-pressed` state.
- Preserve at least WCAG AA contrast for all body text, controls, borders that carry meaning, and focus indicators. Muted text is still readable; disabled text is not used for essential information.
- Switching themes changes only semantic tokens. Layout, component sizes, iconography, progress values, and content remain stable.

### Single accent

- **Sea Glass** (`#5CB8A6`) — Primary actions, active navigation, progress, focus rings, audio playback, selected learning path, and key data emphasis.

Do not introduce purple, indigo, electric blue, neon gradients, or colored outer glows. Hover states use opacity, surface luminance, border contrast, and movement while retaining the exact Sea Glass hue.

### Semantic feedback only

- **Success** (`#62B98C`) — Correct answers and completed lessons only.
- **Warning** (`#D6A85F`) — Time-sensitive or attention-needed states only.
- **Error** (`#D87373`) — Incorrect answers, validation failures, and recording errors only.

Every semantic state pairs color with an icon, label, border treatment, or explanatory message. Keep semantic colors out of charts unless the chart represents those exact states.

## 3. Typography Rules

Use a sans-serif-only pairing throughout this software product.

- **Display and headings:** `Plus Jakarta Sans`, fallback `Arial, sans-serif`. Tight tracking, compact leading, and weight-driven hierarchy.
- **Body and labels:** `Plus Jakarta Sans`, fallback `Arial, sans-serif`. Relaxed leading with a maximum reading width of `65ch`.
- **Phonetics, transcription, timestamps, and dense numeric data:** `JetBrains Mono`, fallback `ui-monospace, monospace`.
- **Banned:** Inter, generic serif fonts, decorative script fonts, and mixed type families by screen.

### Type scale

- **Display:** `clamp(2.5rem, 5vw, 4.75rem)`, weight 800, line-height 1.02, tracking `-0.04em`.
- **Page title:** `clamp(2rem, 3vw, 3rem)`, weight 750, line-height 1.12, tracking `-0.03em`.
- **Section heading:** `clamp(1.5rem, 2vw, 2rem)`, weight 700, line-height 1.2, tracking `-0.02em`.
- **Card heading:** `1.125rem`, weight 650, line-height 1.35.
- **Body large:** `1.125rem`, weight 400, line-height 1.65.
- **Body:** `1rem`, weight 400, line-height 1.55.
- **Body small:** `0.875rem`, weight 450, line-height 1.5.
- **Label:** `0.8125rem`, weight 650, line-height 1.2, tracking `0.02em`.
- **Phonetic:** `0.9375rem`, weight 500, line-height 1.45, tracking `0.035em`.

Headings use sentence case. Never use all caps for sentences. Reserve uppercase for very short metadata such as CEFR levels. Foreign-language glyphs must not be artificially letter-spaced.

## 4. Component Stylings

### Navigation

- Desktop uses a `256px` collapsible sidebar. Tablet uses a `72px` rail. Mobile uses a `64px` bottom navigation bar with safe-area padding.
- The active item uses Sea Glass text, a slim leading indicator, and a slightly brighter neutral surface; never a glow.
- Keep primary navigation labels stable between screens so learners build spatial memory.

### Buttons

- Primary buttons use Sea Glass fill, Ink text, `12px` radius, semibold labels, and a minimum `44px` hit area.
- Secondary buttons use a transparent or neutral surface with a one-pixel structural border.
- Ghost buttons appear only for low-priority utilities.
- Hover: raise contrast and translate upward by `1px`. Active: translate down by `1px` and scale to `0.98`.
- One primary action per decision area. Do not add a competing secondary “Learn more” action.

### Cards and panels

- Use cards only to bind content that behaves as one unit: a course, activity, quiz answer, audio player, or progress summary.
- Standard card radius is `16px`; major focus containers may use `20px`; small chips use `8px`.
- Default border is one pixel. Shadows are soft, short, and tinted toward the canvas rather than pure black.
- Dense analytics sections prefer border-top dividers and negative space over nested cards.
- Card hover may lift by `2px`; it must not glow or tilt.

### Course and lesson modules

- A course module combines CEFR level, current unit, lesson count, skill balance, and progress in one scan path.
- The current lesson receives the strongest hierarchy. Completed and locked states remain legible without relying on opacity alone.
- Progress tracks are `8px` high with fully rounded ends. Sea Glass is the only progress fill color.
- Organize the main path by `A1`, `A2`, `B1`, `B2`, and optional `C1`, then branch into real goals such as university, Ausbildung, interviews, workplace communication, and Goethe/telc preparation.
- Each unit ends with a practical outcome such as introducing yourself, booking an appointment, understanding a rental listing, writing a formal email, or handling an interview question.

### German vocabulary cards

- Always display a noun with its article and plural: `der Termin · die Termine`, never the noun alone.
- Show one natural German example sentence, a concise Vietnamese explanation, and optional English only as a fallback reference.
- Visually separate separable verb prefixes, reflexive markers, prepositions, and governed cases without using multiple decorative colors.
- Use small mono labels for grammatical metadata such as `Akk.`, `Dat.`, `trennbar`, `stark`, and `B1`.
- A spaced-repetition state shows `New`, `Learning`, `Review`, or `Mastered` as text plus shape, not color alone.

### Vocabulary workspace

- Vocabulary is a primary destination, not a hidden tool. Its top level contains `Đến hạn`, `Kho từ`, and `Bộ từ` views.
- The overview begins with one compact summary strip, not four disconnected cards: total words, retained words, learning words, and due today. Each metric has a label, exact count, and small icon.
- `Kho từ` provides search plus focused filters for CEFR level, word class, review state, and source module. Search matches German headword, plural, and Vietnamese meaning.
- Desktop uses a readable table with columns for German, Vietnamese meaning, word class, example, review state, and next review. Nouns always keep article and plural in the first cell. On mobile, each row becomes a labeled stacked record.
- The primary action is `Thêm từ`; `Nhập nhiều từ` is secondary. Bulk import always shows a validation preview before saving.
- `Bộ từ` supports personal sets and automatic lesson sets. A set shows its purpose, word count, due count, last practiced time, and one `Ôn ngay` action. Do not include a public marketplace, shop, ranking, classroom, upgrade, or paid package.
- Empty states explain how to add the first word from a lesson or manually; never show a spinner or a large unused blank canvas.

### Vocabulary review session

- Present one recall decision at a time. The prompt may be German-to-Vietnamese, Vietnamese-to-German, cloze, or audio recall, but the current mode is stated clearly.
- Before reveal, show the prompt, audio when relevant, optional hint, queue position, and a safe exit that preserves progress.
- After reveal, show article, headword, plural, word class, concise Vietnamese meaning, one natural German example, and a short grammar note only when useful.
- Recall actions are `Lại`, `Khó`, `Tốt`, and `Dễ`, each with a predicted next interval. They use text, shape, and semantic state rather than four decorative colors.
- Keyboard shortcuts may be `1–4`; all actions remain usable by mouse, touch, screen reader, and switch control.
- Completion summarizes reviewed items, difficult words, and the next due time without fabricated percentages or confetti.

### Quiz options

- Quiz options use a one-pixel border, `16px` radius, and `16px 20px` padding.
- Selected state: Sea Glass border plus a subtle Sea Glass-tinted inner surface.
- Correct and incorrect states appear only after submission and pair semantic color with an icon and short explanation.
- Keyboard shortcuts may appear in compact mono badges; all options remain fully operable without a keyboard.

### Audio and pronunciation

- The playback control has a minimum `44px` circular target, a readable elapsed/remaining time pair, and a waveform that never becomes decoration.
- The active waveform segment uses Sea Glass; inactive bars use Quiet Slate.
- Recording state uses a calm breathing ring based on `transform` and `opacity`, accompanied by the explicit label “Recording”.
- Speed controls use discrete values such as `0.8×`, `1×`, and `1.2×` with the current value visibly selected.
- Pronunciation activities prioritize German vowel length, umlauts, `ch`, `r`, final consonant devoicing, and sentence stress.
- When useful, show IPA in JetBrains Mono and a mouth-position note in plain Vietnamese. Never present Vietnamese-style phonetic spelling as the authoritative pronunciation.

### Grammar practice

- Grammar exercises expose one decision at a time: word order, article/case, adjective ending, verb form, or preposition.
- Sentence-building uses reorderable tokens with a keyboard-accessible alternative and a clear destination line.
- Feedback explains the rule in one concise sentence and highlights the exact grammatical relationship, not only the wrong word.
- Case tables are progressive: reveal only the rows needed for the current level rather than showing a dense full paradigm by default.

### Germany-life scenarios

- Scenario modules use realistic contexts: Anmeldung, Ausländerbehörde, housing, health insurance, university, Ausbildung, public transport, banking, workplace meetings, and interviews.
- Present dialogue as alternating, clearly labeled turns with audio controls attached to each German utterance.
- Important formal phrases include register labels such as `formell`, `neutral`, or `umgangssprachlich`.
- Administrative content must include a visible “Check current official requirements” note because rules and forms can change.

### Inputs and forms

- Place labels above inputs and errors below. Do not use floating labels.
- Inputs use `12px` radius, `12px 16px` internal padding, and a clear Sea Glass focus ring.
- Placeholder text never substitutes for a label.
- Validation is inline, specific, and announced to assistive technology.

### Data visualization

- Charts use neutral series distinguished by line style, weight, pattern, or direct labels; Sea Glass marks the primary series only.
- Put exact values in tooltips and summaries. Use JetBrains Mono for dense numbers.
- Never invent suspiciously round metrics such as `99.99%` or `50%` for placeholder data.

### Loading, empty, and error states

- Loading uses skeletons that match the final layout dimensions. No generic circular spinners.
- Empty states show the next useful action and a composed product-relevant illustration or diagram.
- Errors stay close to the failed control and explain recovery in plain language.

## 5. Layout Principles

- Use a mobile-first CSS Grid architecture. Avoid percentage math and `calc()`-driven columns.
- Keep desktop content within a centered `1200px` maximum width, excluding persistent navigation.
- Desktop: 12-column grid, `24px` gutters, `32px` outer margins.
- Tablet: 8-column grid, `16px` gutters, `24px` outer margins.
- Mobile: 4-column grid, `16px` gutters and margins.
- Base spacing follows a `4px` rhythm: `4`, `8`, `12`, `16`, `24`, `32`, `48`, `64`, `96`.
- Section spacing uses `clamp(3rem, 8vw, 6rem)`.
- No elements overlap. Every text, image, control, and badge owns a clean spatial zone.
- Full-height layouts use `min-height: 100dvh`, never `100vh` or `h-screen`.

### Product information architecture

The product is personal-learning-first. Do not include a course marketplace, pricing, subscriptions, packages, instructor sales pages, promotional announcements, commercial support chat, or admin navigation in learner screens.

- **Today / Hôm nay:** the single home destination. Show the next lesson, reviews due, the current A1 milestone, and one practical daily goal.
- **Learn / Học:** the structured A1 path organized as CEFR Level → Module → Lesson → Activity.
- **Vocabulary / Từ vựng:** the primary review destination. It combines words due now, the personal word bank, and vocabulary sets. Grammar mistakes and difficult sentences may enter the same scheduler but remain visibly labeled.
- **Practice / Luyện tập:** listening, situational dialogue, sentence building, quiz, and later speaking practice.
- **Progress / Tiến độ:** evidence-based progress by module, retained vocabulary, grammar accuracy, study consistency, and practical scenario readiness.
- **Contextual tools:** Dictionary, Verb Conjugator, and Article Finder live in a compact tools drawer and open from words inside lessons. They are not equal-weight primary navigation destinations.

Desktop uses a compact `232px` sidebar for these five destinations. Mobile replaces it with a five-item bottom navigation bar. Tool pages preserve the same shell and return the learner to the originating lesson when closed.

### Core screen blueprints

- **Today Dashboard:** use an asymmetric `7/5` grid. The dominant left module is “Continue A1”; the right rail contains reviews due and the current weekly goal. Below, show one real-life scenario and recent learning evidence. Do not use three equal statistic cards.
- **A1 Learning Path:** show vertically sequenced modules with explicit practical outcomes, completion state, estimated effort, and the next unlocked lesson. Keep later modules visible but quiet.
- **Lesson Player:** one activity at a time with compact progress, German content first, Vietnamese support on demand, audio attached to the exact utterance, immediate feedback, and a clear exit that preserves progress.
- **Vocabulary Library:** use a compact summary strip above search and filters, then a dense but readable word table. Keep `Thêm từ` primary and `Nhập nhiều từ` secondary. Show useful empty and populated states.
- **Vocabulary Review:** display one prompt at a time, then reveal article, noun, plural, audio, one natural example, concise Vietnamese meaning, and four recall controls with next-interval labels. Search and filtering stay outside the active review session.
- **Grammar Library:** A1 topic filters above a calm accordion list. Each topic opens to a short rule, contrastive examples, one compact table only when necessary, and a direct practice action.
- **Situation Practice:** topic chips select real-life contexts. Each dialogue card pairs a German prompt with audio, register label, Vietnamese meaning, and a plausible response. Avoid emoji-based categorization.
- **Listening Practice:** prioritize one scored listening activity and its history. Podcast, audiobook, and video libraries are future enhancements, not empty “coming soon” boxes.
- **Progress:** show a restrained weekly timeline, retained vocabulary, grammar error patterns, and completed scenario outcomes. Avoid vanity metrics and fabricated precision.

### Reference translation rules

- Preserve the reference product's clarity: persistent navigation, stable page headers, CEFR filters, history access, accordion grammar, bilingual examples, and audio next to language content.
- Do not copy its logo, name, cream-and-red palette, icon set, commercial banners, support widget, course sales, package system, exact card arrangement, text, or imagery.
- Consolidate fragmented utilities into the learning loop: Learn → Practice → Save difficulty → Vocabulary review → Progress.
- Replace large unused canvas areas with meaningful content width and responsive whitespace.
- Use one consistent icon family and the single Sea Glass accent; do not assign a new color to every feature.

### Marketing hero

- Use a left-aligned or split-screen composition with intentional asymmetric whitespace. Centered heroes are banned.
- The headline may place one small contextual image—such as a Berlin street sign, study desk, train platform, or German phrase card—between words as inline visual punctuation on desktop.
- Inline imagery must sit at type height and never overlap letters. On mobile, move it below the headline.
- Use one primary CTA. Do not add scroll arrows, bouncing chevrons, or “Scroll to explore”.

### Application shell

- Dashboard priorities flow from “today's German session” to the next real-life milestone, spaced-repetition review, and CEFR progress context.
- Avoid the generic row of three equal cards. Use a two-column asymmetric grid, a `7/5` split, or a full-width primary module with a narrower supporting rail.
- Lesson focus screens reduce the shell to the current task, compact progress, and an obvious exit path.

### Responsive behavior

- Below `768px`, every multi-column arrangement collapses to a single readable flow.
- No horizontal page scrolling. Wide charts use an accessible summary or internal, clearly signposted scroll region only when unavoidable.
- Body text never drops below `1rem`; compact metadata may use `0.875rem`.
- All touch targets are at least `44px × 44px`.
- Desktop navigation becomes a clean mobile menu or bottom navigation without losing destinations.
- Tables convert to labeled key-value rows or stacked records; do not squeeze columns.

## 6. Motion & Interaction

- Default spring feel: `stiffness: 100`, `damping: 20`.
- Standard durations: `140ms` for press/focus feedback, `220ms` for surface transitions, and `360ms` for page or panel entrances.
- Lists and learning modules reveal in a subtle cascade with `40–60ms` stagger; never mount a large list as one abrupt block.
- Animate only `transform` and `opacity`. Never animate `top`, `left`, `width`, or `height`.
- Perpetual motion is limited to meaningful active states: recording breath, current audio position, active synchronization, or a gently advancing study timer.
- Do not animate idle decoration. Never use linear easing for interface transitions.
- Hover feedback must also have focus-visible and touch equivalents.
- Under `prefers-reduced-motion: reduce`, remove looping motion, stagger, parallax, and scale effects; preserve immediate state changes.

## 7. German Learning Architecture

### Personal goal model

- Onboarding asks for the learner's current level, target date, intended route to Germany, weekly time budget, and priority situations.
- The product converts those answers into a visible but editable roadmap. It never promises a visa, admission, job, or exam pass.
- Separate language readiness from administrative readiness. The app may track both, but official requirements must link to or name the responsible authority.

### Core learning loop

1. **Understand:** encounter a short German dialogue, text, or audio clip in context.
2. **Notice:** focus on one vocabulary, pronunciation, or grammar pattern.
3. **Practice:** complete controlled exercises with immediate, specific feedback.
4. **Produce:** speak or write a response relevant to study, work, or daily life.
5. **Review:** schedule difficult items through spaced repetition.
6. **Apply:** complete a scenario task such as composing an email or answering an interview prompt.

### Level progression

- **A1:** identity, numbers, time, food, directions, appointments, basic forms, essential pronunciation.
- **A2:** housing, health, travel, education, routine workplace exchanges, everyday written messages.
- **B1:** independent daily life, longer conversations, official appointments, applications, structured opinions, Goethe/telc task formats.
- **B2:** university and professional communication, meetings, presentations, detailed writing, interviews, domain-specific vocabulary.
- **C1 optional:** academic reading, seminars, nuanced argument, formal reports, and advanced professional communication.

### Progress model

- Measure consistency, vocabulary retention, listening comprehension, speaking practice, writing output, and scenario readiness separately.
- Show evidence behind every estimate: completed tasks, review accuracy, recent speaking samples, and assessed writing.
- CEFR readiness is phrased as an estimate, never as certification.

## 8. Content Voice

- Write like a calm German tutor and practical mentor: concise, direct, specific, and encouraging without hype.
- Early levels use concise Vietnamese support beside German. As proficiency rises, German becomes primary and Vietnamese becomes available on demand.
- Prefer “Weiterlernen”, “Diesen Laut noch einmal üben”, and “6 Wörter wiederholen” over vague calls to action.
- Keep instructions close to the activity they govern.
- Use authentic German names, places, institutions, proficiency levels, and plausible progress values. Do not use “John Doe”, “Acme”, or “Nexus”.
- Use correct German capitalization, umlauts, `ß`, articles, plural forms, and formal/informal address. Do not silently replace `ä`, `ö`, `ü`, or `ß` unless teaching that transliteration explicitly.
- Avoid AI marketing clichés including “Elevate”, “Seamless”, “Unleash”, and “Next-Gen”.

## 9. Anti-Patterns — Never Do

- No emojis in interface copy, controls, navigation, or empty states.
- No Inter and no generic serif fonts.
- No pure black (`#000000`).
- No purple/blue neon aesthetic, neon gradients, or outer glow shadows.
- No oversaturated accents or multiple decorative accent colors.
- No excessive gradient text in large headings.
- No custom mouse cursors.
- No overlapping elements or absolute-positioned content collisions.
- No centered hero for the marketing experience.
- No generic three-column row of equal cards.
- No decorative glassmorphism that weakens text contrast.
- No filler instructions such as “Scroll to explore” or “Swipe down”.
- No generic circular loading spinner when a structural skeleton is possible.
- No inaccessible color-only correct/incorrect states.
- No broken image sources. Use owned assets, generated project assets, or deterministic placeholders during prototyping.
- No fabricated perfection metrics or empty motivational claims.
- No stereotypes such as lederhosen, beer, pretzels, or flag-heavy decoration as a substitute for real German context.
- No treating Germany, Austria, and Switzerland as linguistically or culturally identical; label regional variants when relevant.
- No legal, visa, university-admission, or employment claims presented as guaranteed or permanently current.
- No vocabulary nouns without articles and plural forms when a plural exists.
- No isolated grammar tables without a practical sentence or scenario.

## 10. Stitch Generation Guardrails

When generating or editing a Lingo Deutsch screen in Stitch:

1. Preserve the single Sea Glass accent and cool-neutral surface ladder. Generate light mode by default and provide an equally legible dark counterpart through the persistent theme control.
2. Preserve Plus Jakarta Sans plus JetBrains Mono; never substitute Inter.
3. Name the specific German flow and viewport in the prompt: CEFR dashboard, lesson, vocabulary library, spaced-repetition review with articles, grammar drill, pronunciation, scenario, exam practice, job preparation, results, or analytics; desktop or mobile.
4. State the primary action and the single most important information hierarchy.
5. Request asymmetric grid composition for marketing and overview screens, but quiet linear composition for lessons and quizzes.
6. Require visible hover, active, focus-visible, disabled, loading, empty, error, selected, correct, and incorrect states where relevant.
7. Require mobile collapse below `768px`, `44px` touch targets, no overlap, and no horizontal page scroll.
8. Reject any output that introduces purple neon, multiple accent colors, equal three-card rows, centered marketing heroes, or vague placeholder copy.
9. Require authentic German content with correct articles, capitalization, umlauts, register, and realistic scenarios; use Vietnamese support appropriate to the learner's level.
10. Clearly distinguish language-learning guidance from changeable official requirements for study, work, residence, or visas.
11. Vocabulary screens must include a meaningful populated state, a purposeful empty state, and a review path; never reproduce commerce, upgrade, ranking, community, or classroom features from references.
