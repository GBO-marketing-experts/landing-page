# GBO — Landing page

Static landing page for GBO Marketing Experts. Spanish by default (`/`),
English at `/en/`. Built from the annotated Miro board (`../miro_board.jpeg`);
**GBO's margin annotations are the content**, the "Agencia Paid Media"
screenshot was layout reference only.

## Run

```bash
npm install
npm run dev          # http://localhost:4321
npm run build        # -> dist/  (plain static HTML)
npm run check:i18n   # es.json / en.json key parity
```

Astro 7 + Tailwind 4. Everything is project-local — no global installs.
**Teardown:** `rm -rf /opt/Fonzo/gbo-landing`

## Where to change things

All copy lives in `src/i18n/es.json` (source of truth) and `src/i18n/en.json`.
Run `npm run check:i18n` after editing either — it fails if the key sets drift,
which is the only way a missing string could silently render blank.

| To change | Where |
|---|---|
| Any text | `src/i18n/es.json` + `en.json` |
| Brand colours / type scale | `src/styles/global.css` (`@theme` block) |
| Section order | `src/components/Landing.astro` |
| Client names | `shared.clients` in both dictionaries |

### Swap-in points (currently placeholders)

- **Case-study videos** — `src/components/Cases.astro`. Each card has
  `data-video-id=""`. Put a YouTube id there and replace the placeholder block
  with an iframe (or a click-to-load facade). Board asks for Centro Diagnóstico
  Mena (Video 1) and Colegio Le Bret / Valeria Segura (Video 2).
- **Client logos** — real, 12 of them, in `public/clientes/`. To add one: drop
  the file in, add an entry to `shared.clientLogos` in both dictionaries with a
  `treat` of `"plain"` (artwork is already light, or reads fine in grayscale) or
  `"dark"` (dark artwork that needs flattening to a white silhouette).
- **All CTAs are inert** — every one carries a `data-cta` hook:
  `data-cta="contact"`, `"email"`, `"social"`, `"client"`, `"legal"`.
  `grep -rn 'data-cta' src/` finds all of them. Decide destination
  (WhatsApp deep link / `mailto:` / form endpoint) and set the `href`.
  Note: GitHub Pages has no backend, so a real form needs a third-party
  endpoint (e.g. Formspree) or a WhatsApp/mailto link.
- **Team collage** — `src/components/Hero.astro` draws CSS circles as a stand-in
  for the "imagen estilo animación donde salgamos los del equipo" note. Replace
  the `tiles` array with real cropped portraits.

## Unconfirmed — needs GBO

The Miro export is 812px wide, so some annotations are below readable
resolution. These are best-guesses, not confirmed:

1. **Strip tagline** — read as "Vendrán por el equipo, te quedarás por los
   resultados." (`strip.tagline`)
2. **Contact email** — read as `hola@gbomkt.com` (`shared.email`). Appears twice
   (Contact + Footer), both from the same key.
3. **"TG"** — the supplied file is a bare monogram with no wordmark, so the alt
   text is just "TG". Needs the company's full name.
4. **Good Mind homeschool** — a full-colour badge with no mono version. It is
   shown grayscaled to match the wall, which softens it. A white/mono asset from
   the client would render properly.
5. **Aviso de Privacidad** — the board carries a full LFPDPPP notice for GBO
   Marketing Experts, San Andrés Cholula, Puebla. Footer link is inert; give me
   the text and it becomes `/aviso-de-privacidad`.

A higher-resolution board export closes 1 and 2 immediately.

## Hero carousel ("Somos GBO.")

SAMY-reference hero (samy.com/es): full-bleed looping imagery, statement
bottom-left, one short line bottom-right. We have stills, not video, so it is a
**Ken Burns carousel**: 5 photos crossfading every 5s with a slow zoom, plus a
masked word-rise entrance on "Somos GBO." — all behind
`prefers-reduced-motion` (static first photo, no rise).

- Photos: `public/carousel/carousel-1..5.webp` (1920w, ~540KB total), processed
  from `../Carousel1.zip`. They are **stock stand-ins** (Pexels/Unsplash) for the
  board's "imagen estilo animación donde salgamos los del equipo" — swap in real
  team/office shots by replacing the files, nothing else changes.
- The crossfade is a tiny JS interval toggling `.is-on` + CSS transitions
  (`HeroCarousel.astro`). It was first built as pure-CSS staggered infinite
  keyframes; that proved flaky (animation clock drifting from wall clock, blank
  frames), so it was replaced with the boring deterministic version. Don't
  "simplify" it back.
- The sub line reuses approved copy ("Una agencia con base en Puebla…"), no new
  claims. "Somos GBO." is a `<p>`, not a second `<h1>` — the SEO h1 stays
  "Una agencia de Marketing Digital que piensa en resultados."
- The old hero circle-collage was superseded by this and removed; the hero
  section below is now an editorial two-column text spread.

## Scroll-triggered heading rise

Every section heading (the h1 and all eight h2s) plays the SAMY scroll move:
its words climb out of overflow masks, staggered 60ms apart, once, when the
heading crosses 30% visibility. Mechanics:

- `RiseText.astro` splits heading text into per-word masks at build time. Word
  gaps are real spaces (not margins) so wrapped lines keep a clean left edge —
  don't swap them for `margin-left`, that reintroduces indented lines.
- One IntersectionObserver in `Landing.astro` adds `.is-in` and per-word
  delays; CSS transitions do the rest (`.srise` block in `global.css`).
- Progressive enhancement: the hidden state only exists under `html.js`, so
  no-JS visitors always see headings. `prefers-reduced-motion` shows them
  static.
- The load-time rise on "Somos GBO." (`.rise`) is separate and stays
  animation-based; `.srise` is the scroll variant. They look identical by
  design.

## Client logos

12 logos live in `public/clientes/`, all WebP except `midexacto.svg`. Originals
are in `../Clientes.zip` — these files are processed, so re-derive from the zip
rather than editing them.

The supplied files were wildly inconsistent, so three passes were applied:

1. **Background removal** — `CDM_Logo.png`, `Kiwi_NEtworkslogo.jpeg` and
   `Original Logo.png` were dark artwork baked onto an opaque light background,
   which shows as a grey box on the black wall. `scripts/whiten-logo.mjs`
   converts them to white-on-transparent, keeping anti-aliased edges that a CSS
   `invert()` filter destroys. Re-run it if similar files arrive:
   `node scripts/whiten-logo.mjs <in> <out.png>`
2. **Trim** — several had huge transparent padding (Azoul Fit 86%, Alensa 80%,
   CDM 75%), which made them render tiny next to tight wordmarks.
3. **Resize + WebP** — capped at 600×400 for a ~152px display slot.
   Total went from 1000KB to 244KB.

Sizing is one rule (`.client-logo` in `global.css`) capping both height and
width, so wide wordmarks and square marks carry similar optical weight. There is
no per-logo height config — don't reintroduce one.

The zip also contained `LOGO NEGRO.png` (Azoul Fit) and `Logo_Azul (1).webp`
(Home is Cool), which are second colourways of brands already included.

## Social links

Live, per GBO: Instagram, Facebook, TikTok — in `shared.socials`. **The board
listed YouTube and LinkedIn instead of TikTok**; GBO replaced that list, so those
two are deliberately absent. The TikTok URL was stripped of its `?_r=`/`?_t=`
share-tracking parameters.

These are the only live outbound links on the page; everything else is still an
inert `data-cta` placeholder.

## Cambios.md (Sep 2026) — applied revision

The document `../Cambios.md` (GBO's copy + design review) is applied:

- **Positioning reverted to "Agencia de Paid Media en Puebla"** — the doc
  explicitly decides Paid Media as the hook, with local SEO. This supersedes
  the earlier "Marketing Digital" instruction. Title tag:
  "Agencia de Paid Media en Puebla | GBO".
- **All unverifiable claims removed**: "10 años", "decenas de negocios",
  "+80 millones", the invented team roster, "primer lugar" in Google, and
  "retorno desde el primer día".
- **Home is Cool is the proof everywhere**: +10x case card (Reto / Qué hicimos /
  Resultado), hero proof line, case pills (Home is Cool · Mercapital · Alensa ·
  Soluciones Hídricas). Pending per the doc: validate numbers with Óscar,
  client permission, and whether $42k is pauta or pauta + fee.
- **Differentiator**: razón 04 is now "Trabajas directo con los socios".
- **Methodology is 4 steps** (Diagnóstico · Estrategia · Lanzamiento y pruebas ·
  Medición y reporte).
- **Platforms row**: Google Ads · Meta · Instagram · TikTok · LinkedIn. The
  "Google Partner" badge was removed until certification is confirmed.
- **Contact form** (nombre, empresa, WhatsApp, giro, presupuesto): submits via
  a mailto compose — the only zero-backend option on static hosting. Swap the
  handler in `Contact.astro` for a Formspree/endpoint POST when one exists.
- **Single CTA label "Hablemos"** everywhere, arrow instead of the dot, CTA
  visible on mobile next to the menu, and intermediate CTAs after "Por qué GBO"
  and "Así trabajamos".
- **Footer**: tagline "Work that moves people." + "Puebla, México".

### Deliberately NOT applied (conflicts — flagged for GBO)

- **Outfit/Poppins typography**: the doc assumes the site still uses the
  reference's serif. It doesn't — it uses **Satoshi + JetBrains Mono from the
  GBO brand folder** (Satoshi is embedded in GBO's own palette file). Changing
  to the deck fonts is a real decision for GBO, not a bug fix.
- **2×2 card grid for the razones**: kept the editorial numbered list (user's
  standing anti-boxy direction); numerals now render in the accent color.
- **Socials**: Instagram, Facebook, TikTok and LinkedIn are live (all real
  URLs). YouTube gets added when its URL exists — no dead links.
- **WhatsApp floating button**: blocked on the phone number (doc's own
  pendientes list). Highest-impact lead change once the number exists.
- **GA4 / Meta Pixel / Ads conversion tags**: blocked on account IDs.

## Positioning

GBO's board annotations say **"agencia de Paid Media"** in three places (hero,
"por qué elegirnos", methodology). GBO has since corrected this: the agency is an
**Agencia de Marketing Digital** — Paid Media is part of the business, not the
whole of it. Top-level headings, `<title>` and meta description therefore say
Marketing Digital; "Paid Media" is kept only where it is accurate (the
Google Ads + Social Ads section, and `cases.lead`). Do not "restore" the
annotation wording.

## Copy corrections applied

GBO's annotations had typos; these were fixed rather than shipped:
`Está es nuestra metología` → `Esta es nuestra metodología` ·
`ganacias` → `ganancias` · `cómo empezo` → `cómo empezó` ·
`cómo hemos llegando` → `cómo hemos llegado`.

English is a **marketing** translation, not literal — "Paid Media", "leads" and
"ROAS" stay in English. Worth a native-speaker pass.

## Hosting

Live on GitHub Pages: **https://gbomkt.github.io/**
Every push to `main` rebuilds and deploys via `.github/workflows/deploy.yml`.

`astro.config.mjs` sets `site: 'https://gbomkt.github.io'` and `base: '/'`
(the repo is the org's root site, so no subpath). All asset paths are
base-aware, so a future base change is config-only.

When a custom domain arrives: set `site` to the domain, `base` to `'/'`, and
add a `public/CNAME` file — nothing else changes, all paths are base-aware.

## Design notes

Palette and type were decoded from `../GBO/Paleta de colores.ai`:
backgrounds `#000000` / `#FFF8F8`, accent "Puntito" `#FF5757`, brights
`#38B6FF #FF914D #FFDE59 #8C52FF #C379B6`, gradient `#8C52FF → #C379B6 → #FF914D`.
Satoshi for display and body, JetBrains Mono for eyebrows and numerals.

Deliberate constraints, so edits don't drift:

- **Radii are binary** — fully-round pills or square edges. No mid-radius cards.
- **The gradient appears exactly 3 times** (hero "resultados", contact
  "conocerte", results "Millones") plus the menu CTA. It stops meaning anything
  if it goes on every heading.
- **Hairlines, not bordered boxes**, and full-bleed alternating black/paper
  bands with a faint grain overlay.
- Brights fail AA on light backgrounds — they are for large display type, dots
  and accents **on black** only. Body copy stays `#000` on paper or paper on
  `#000`.
- All motion sits behind `prefers-reduced-motion: reduce`.
