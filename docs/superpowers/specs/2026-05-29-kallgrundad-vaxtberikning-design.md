# Källgrundad växtberikning — design

**Datum:** 2026-05-29
**Status:** Godkänd design (inväntar spec-granskning)
**Mål:** Berika växtdatan i kvadratodling med information som är källgranskad och verifierad — aldrig genererad ur modellens minne.

## Bakgrund

Katalogen har ~25–31 aktiva växter; bara ~12 är "berikade" med fyllig text.
`SITE_DESCRIPTION` utlovar "100+ växter". Det finns alltså både tunna fält på
befintliga växter och ett glapp mot nya växter.

Det finns redan en fungerande importväg:
`scripts/import-plants.ts` validerar en `plants.json` mot ett **Zod-schema** och
upsertar till Supabase (idempotent, slug-baserat, löser sällskapsplantering
bidirektionellt). Den vägen ändras **inte** — den är kontraktet.

Hård regel för projektet (se `memory/verified-data-only.md` och truth-kontraktet
i `src/lib/plant-faq.ts`): **fakta som når användare eller sökmotorer måste vara
verifierade; saknas underlag utelämnas påståendet hellre än uppfinns.**

## Kärnprincip: varför inte bara "en prompt"

En LLM som ombeds "generera verifierad data med källor" kan hallucinera **både
värdet och en trovärdig men felaktig citering**. Därför grundas datan inte i
modellens minne utan i **faktiskt hämtade webbsidor** — pipelinen körs i Claude
Code där `WebSearch`/`WebFetch` finns, citaten är riktiga URL:er som lästs, och
allt passerar en mänsklig granskningsgrind innan import.

## Godkända källor (käll-allowlist)

Rangordnas; svenska/klimatspecifika föredras.

| Källa | Auktoritativ för |
|---|---|
| Riksförbundet Svensk Trädgård | Odlingszoner (1–8), frosttålighet, svenska såfönster |
| SLU / Jordbruksverket | Skadegörare, sjukdomar, växtbiologi |
| Svenska fröföretag (Impecta, Runåbergs, Lindbloms, Nelson Garden m.fl.) | Dagar till skörd, sådd-offset, plantavstånd |
| Square Foot Gardening (Mel Bartholomew) | **Endast** `plants_per_sqft` (metodstandarden), korskollas mot svenskt plantavstånd |

Ingen grundning i bloggar/forum/oidentifierade källor. Citat utan namngiven
källa i allowlisten räknas inte som verifierat.

## Fält → källauktoritet

| Fält | Källa | Korsverifiering |
|---|---|---|
| `zones_min/max/note`, `frost_tolerant` | Svensk Trädgård | — |
| `sow_indoors_/direct_sow_/transplant_*_frost` | Svensk Trädgård + fröföretag | relativ sista frost, aldrig absolut månad |
| `days_to_maturity_min/max` | Fröföretag | sortvariation → spann; konflikt flaggas |
| `plants_per_sqft` | SFG | korskolla mot fröföretagens plantavstånd (cm); avvikelse flaggas |
| `pests`, `diseases` | SLU / Jordbruksverket | — |
| `companions`, `antagonists` | Endast med namngiven källa | folklore-skydd: annars utelämnas + flaggas |
| `description`, `tips` | Syntetiseras enbart ur redan verifierade fält + citerade fakta | inga nya påståenden |

## Pipeline (per växt)

1. **Gap-detektering** — läs live-DB (Supabase), lista null/tunna fält per växt → arbetslista.
2. **Käll-fanout** — för varje saknat fält: `WebSearch` mot godkänd källa → `WebFetch` den faktiska sidan.
3. **Extrahera + citera** — dra värdet + exakt stödcitat + URL. Aldrig ur minnet. Ingen källa hittad → fältet lämnas null och flaggas.
4. **Korsverifiera** — fältspecifik regel enligt tabellen ovan. Motstridiga källor → båda sparas + flaggas.
5. **Konfidens** — `hög` (≥2 godkända källor enas / 1 auktoritativ för fälttypen) · `medel` (1 ok källa) · `låg/omtvistad` (folklore, tunt underlag). **Låg auto-inkluderas aldrig** — endast till granskning.

## Output-artefakter

Per batch, under `data/plants/`:

1. **`plants.json`** — exakt befintligt Zod-schema (`import-plants.ts` oförändrat). Innehåller bara fält med konfidens ≥ medel **efter** din signoff.
2. **`review/<batch>.md`** — granskningsgrind. Per växt, per fält:
   - föreslaget värde · nuvarande DB-värde (diff) · käll-URL + citat · konfidens · ✓/✗-ruta för godkänn/avvisa.
3. **(valfritt senare)** maskinläsbar `review/<batch>.json` om vi vill automatisera signoff-spårning.

Källspåret lagras inte i DB nu (ingen migration). Dörren hålls öppen att senare
visa en kurerad "Källor"-sektion på växtsidan (E-E-A-T/SEO).

## Sanningsgarantier (icke förhandlingsbara)

- **Utelämna hellre än uppfinn** — saknas verifierat underlag, sätt fältet null.
- **Sådd relativ sista frost** — aldrig absolut datum/månad (zonberoende).
- **Sällskapsplantering** — inneboende omtvistat; inget påstås utan namngiven källa.
- **Prosa** introducerar inga fakta utöver de redan verifierade, citerade fälten.
- **Inget når DB:n ogranskat** — import körs först efter mänsklig ✓.

## Pilot → skala

1. **Pilot:** ~5 tunna befintliga växter. Du granskar rapporten. Vi justerar konfidens-ribban och rapportformatet.
2. **Fyll luckor:** resten av befintliga växters tunna fält.
3. **Nya växter:** generera nya poster mot 100+, samma grind. `plants_per_sqft` för nya växter härleds ur SFG + plantavstånd.

## Avgränsningar (YAGNI)

- Ingen schema-/DB-migration i denna omgång (källor lagras i granskningsfil, inte i DB).
- Ingen UI-förändring (ingen "Källor"-sektion än).
- Ingen automatisk import utan signoff.
- `import-plants.ts` och Zod-schemat ändras inte.

## Öppna frågor

Inga kvarvarande — alla designval fastställda i brainstorm 2026-05-29.
