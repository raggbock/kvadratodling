# Bädd-planerare: ångra + dra-måla — design

**Datum:** 2026-05-30
**Status:** Godkänd design (inväntar spec-granskning)
**Mål:** Göra planerarens kärninteraktion snabb och förlåtande — dra för att måla flera rutor i ett svep, och en flernivå-ångra som gör alla ändringar trygga att utforska.

## Bakgrund

`src/app/gardens/[gardenId]/beds/[bedId]/BedPlanner.tsx` placerar växter en
ruta i taget (`handleCellClick`): optimistisk `setSlots` + en per-ruta-PUT mot
`/api/beds/[bedId]/slots`, med `pendingSaves` för spar-status. Presets nollar
bädden via en egen bulk-endpoint bakom en bekräftelse-dialog. Det finns ett
"Raderingsläge" (delete mode). Rutnätet ligger sedan #5 i en horisontell
scroll-wrapper på mobil. Det finns inget ångra; att fylla en bädd kräver ett
klick per ruta.

## Beslut (från brainstorm 2026-05-30)

- **Dra-måla är pekare-bara i v1** (mus/styrplatta/penna). På touch behålls
  tryck-placera (undviker konflikt med horisontell scroll). Alla får ångra.
- **Flernivå ångra-stack** (cap ~20 steg), ingen redo i v1.
- **Bulk-persistens** via en utökad slots-endpoint (inte parallella per-ruta-PUT:ar).

## Interaktionsmodell

- **Dra-måla:** `pointerdown` på en ruta startar ett drag; `pointerenter` på
  rutor medan pekaren hålls nere lägger till dem; `pointerup` (var som helst)
  avslutar. Drag är **lägesstyrt**: i planteringsläge målas vald växt, i
  raderingsläge raderas. Endast primär pekarknapp; `pointerType === 'touch'`
  ignoreras för drag (touch faller tillbaka på klick).
- **Enkelt klick:** oförändrat toggle-beteende (samma växt → töm rutan).
- En `pointerup`/`pointercancel`-lyssnare på `window` avslutar drag även om
  pekaren släpps utanför rutnätet.

## Ångra-arkitektur

Ren kärna i `src/lib/plannerActions.ts`:

```ts
export interface CellChange {
  key: string;                 // "row:col"
  before: SlotData | null;     // null = rutan var tom
  after: SlotData | null;      // null = rutan blir tom
}
export type Action = CellChange[];

export function applyChanges(slots: Map<string, SlotData>, changes: Action): Map<string, SlotData>;
export function invertChanges(changes: Action): Action;            // before<->after
export function pushAction(stack: Action[], action: Action, cap?: number): Action[]; // drop oldest över cap
```

- `SlotData` återanvänds från `BedPlanner` (flyttas till `plannerActions.ts`
  eller en delad typ så både filen och komponenten importerar den).
- Varje mutation (klick, dra-måla, preset, rensning) bygger en `Action` med
  faktiska `before`/`after` per påverkad ruta, **utelämnar no-op-rutor**
  (where before==after), appliceras optimistiskt, läggs på stacken och persisteras.
- **Ångra:** poppa senaste action, `invertChanges`, applicera, persistera de
  inverterade ändringarna. Knapp "↩ Ångra" (inaktiv när stacken är tom) +
  **Cmd/Ctrl+Z**. Tangentbordslyssnaren ignorerar när fokus är i ett textfält
  (sökrutan) och när inget finns att ångra.

## Persistens — utökad slots-endpoint

`PUT /api/beds/[bedId]/slots` utökas att ta **en array** av
`{ row, col, plantSlug: string | null }` och utföra upsert (plantSlug != null)
respektive radering (plantSlug == null) i **en** databasoperation
(transaktion/`upsert` + `delete` filtrerat). Klick, dra-måla, preset och ångra
går alla genom denna → konsekvent och atomiskt.

- Klient skickar alltid en array (ett klick = array med en post).
- Optimistiskt flöde: applicera `setSlots` → pusha action på stacken →
  persistera. **Vid persisteringsfel:** rulla tillbaka `setSlots` till `before`
  och **poppa action:en från ångra-stacken** (så stack och DB hålls i synk),
  och visa `saveError`.

*(Alternativ som valdes bort: parallella per-ruta-PUT:ar — ingen backend-ändring
men N requests och icke-atomiskt, vilket gör ångra opålitligt.)*

## Komponenter

- **`src/lib/plannerActions.ts`** (ny) — `CellChange`/`Action`-typer +
  `applyChanges`/`invertChanges`/`pushAction`. Ren, testad.
- **`src/lib/plannerActions.test.ts`** (ny) — enhetstester.
- **`src/app/.../slots/route.ts`** (ändrad) — array-/bulk-stöd.
- **`src/app/.../BedPlanner.tsx`** (ändrad) — `commit(changes)` som central
  mutationsväg; pointer-handlers för drag; ångra-handler + tangentbord;
  "↩ Ångra"-knapp; preset-apply registrerar sin Action.
- **`src/app/.../PresetMenu.tsx`** (ev. liten ändring) — `onApply` returnerar
  de ändrade cellerna så `BedPlanner` kan bygga en Action för ångra.

## Testning & QA

- **Enhetstester** (`plannerActions.test.ts`): `applyChanges` sätter/raderar
  rätt; `invertChanges` är en exakt invers (apply→invert→apply == ursprung);
  `pushAction` cappar och släpper äldsta; no-op-celler utelämnas.
- **Interaktions-QA:** temporär QA-route (samma knep som #3) som monterar
  `BedPlanner` med mock-data, för att känna på drag-måla + ångra + Cmd/Ctrl+Z
  och verifiera bulk-spar-anropet. Tas bort efteråt, committas aldrig.

## Avgränsningar (YAGNI)

- Ingen redo (åter-göra).
- Ingen touch-dra-måla (touch = tryck-placera).
- Ingen multi-select/kopiera-ruta/fyll-rad.
- Ångra-stacken är minnesintern (försvinner vid omladdning) — ingen persistens
  av själva historiken.

## Öppna frågor

Inga — besluten fastställda i brainstorm 2026-05-30.
