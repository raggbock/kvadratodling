# SEO-strategi för Kvadratodling

Levande dokument. Uppdatera när vi släpper saker, ändrar prioritet eller hittar
nya keywords som funkar.

## Mål

Bli **förstavalet på svenska för pallkrage-planering**. Sekundärt: dra in
trafik på generella "när så X"-frågor som leder till produkten.

## Tekniska grundbultar (fas 1 — klar)

- [x] **Dynamisk `/sitemap.xml`** — alla 108 publika växtsidor + `/`, `/catalog`. Revalidate 3600s.
- [x] **`/robots.txt`** — tillåter publika rutter, blockerar `/auth/`, `/gardens/`, `/settings`, `/api/`.
- [x] **`metadataBase`** i layout + `title`-template — alla relativa OG-URL:er resolvar mot canonical-domänen.
- [x] **OpenGraph + Twitter Card defaults** — alla sidor får snyggt social preview.
- [x] **Canonical-URL:er** — sätter `<link rel="canonical">` per sida (`/`, `/catalog`, `/catalog/<slug>`).
- [x] **JSON-LD strukturerad data:**
  - Hemsida: `Organization` + `WebSite` (med `SearchAction` så Google kan visa sökruta i SERP)
  - `/catalog`: `BreadcrumbList` + `ItemList` (alla 108 växter)
  - `/catalog/[slug]`: `Article` + `BreadcrumbList`
- [x] **Härledd `<meta description>`** — när `plant.description` är tomt bygger vi en från strukturerade fält (per-ruta, sol, vatten, zon, dagar till skörd).
- [x] **Per-växt keywords** — `plant.common_name`, engelska namnet, scientific, "odla X", "X pallkrage", "när så X", + plant.tags.

## Att göra härnäst

### Fas 2 — Content depth (innehållsproduktion)

| Prio | Vad | Hur | Trafikmål |
|---|---|---|---|
| Hög | Längre beskrivningar per växt (300+ ord, idag 1–2 meningar) | Cowork eller egna texter. Sektioner: "Om", "Sådd", "Skötsel", "Skadegörare", "Skörda" | Ranka på "odla {växt}", "{växt} pallkrage" |
| Hög | `/sallskapsplantering` hub-sida | Översikt + företal + länkar till alla växtsidors compat | Ranka på "sällskapsplantering" |
| Hög | `/pallkrage` — vad och varför | 800–1200 ord. Mått, byggnation, varför kvadratmetoden | Ranka på "pallkrage", "pallkrage mått" |
| Medel | `/odlingszoner` — svensk zon-karta | Lyft `SwedenZoneMap`-komponenten + lägg till stadinformation | Ranka på "växtzon Sverige", "växtzon Stockholm" |
| Medel | `/odlingsschema` — publik schema-vy | Reuse `ScheduleView` utan login, parameter via URL | Ranka på "odlingsschema", "när så" |

### Fas 3 — Verktyg & widgets (driver backlinks)

- [ ] Publik frostkalkylator: ange ort → få sista frost
- [ ] "Vad ska jag göra idag?"-widget för ett valt zon utan login
- [ ] **Delbar trädgård**: `/g/<garden-slug>` read-only public view. Användare delar sin pallkrage i FB-grupper → backlinks
- [ ] Dynamiska OG-bilder per växt via `opengraph-image.tsx` (Next.js ImageResponse)
- [ ] Pinterest-friendly bilder per preset (1000×1500 portrait) — pinterest är *enormt* för gardening

### Fas 4 — Länkbygge & PR

- [ ] Submit till svenska sökmotorer (Google Search Console, Bing)
- [ ] Pinterest business-konto, posta presets
- [ ] Guestpost på Allt om Trädgård, Odla.nu
- [ ] r/sweden, r/SwedenHobby (gardening-relaterade trådar)
- [ ] Lokala FB-grupper (Pallkrageodling Sverige etc.)

## Att mäta

- **Google Search Console** — connect efter första sitemap-deploy
- **PostHog**: utm_source=digest events finns redan, lägg till utm_source=pinterest, utm_source=fb när vi börjar
- **Vercel analytics** för rena pageviews per route

## Keyword-bucket (start)

**Primära (vi ska äga):**
- pallkrage
- kvadratodling
- sällskapsplantering
- odlingsschema sverige

**Sekundära (high-intent, varje växt):**
- odla [växt] (108 sidor × varianter)
- [växt] pallkrage
- när så [växt]

**Long-tail (organisk plockfrukt):**
- vad ska jag plantera i [månad]
- vilka växter trivs ihop
- pallkrage 4×4 vs 4×8
- "[växt] försådd"
- "[växt] zon Z3 / Z4 / Z5"

**Tools-keywords (för fas 3 widgets):**
- frostkalkylator
- växtzon karta
- pallkrage räknare

## OG-bilder

Default OG-bild ska finnas på `/public/assets/og-default.png` (1200×630). Idag
saknas — om den inte finns serverar Next ändå metadatan utan bild. Skapa
manuellt eller via canva/figma med:
- Logotyp + "Kvadratodling"
- Tagline: "Planera din pallkrage kvadrat för kvadrat"
- Bakgrund: pallkragens grön (#16a34a → #ecfdf5 gradient)

För dynamiska per-växt OG-bilder, se fas 3.
