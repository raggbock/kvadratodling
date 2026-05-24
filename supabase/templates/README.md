# Supabase email templates

Dessa mallar är *källan*. Supabase serverar dem från sin dashboard
(Auth → Email Templates), så när du ändrar något här måste du kopiera
in den nya HTML-koden i dashboarden för att den ska gå live.

## Installation

För varje mall:

1. Öppna https://supabase.com/dashboard/project/_/auth/templates
2. Välj rätt template-flik (se mappning nedan)
3. Klistra in innehållet från motsvarande `.html`-fil
4. Sätt rubriken (se "Subject" nedan) och spara

| Fil                    | Template-flik i dashboard | Subject                                          |
| ---------------------- | ------------------------- | ------------------------------------------------ |
| `magic_link.html`      | **Magic Link**            | `Logga in på Kvadratodling 🌱`                    |
| `confirm_signup.html`  | **Confirm signup**        | `Välkommen till Kvadratodling — bekräfta din e-post` |

## Sender

Sender konfigureras under **Auth → SMTP Settings** (Resend SMTP-credentials
via `smtp.resend.com:465`). Förslag på avsändare:

- **Sender name:** `Kvadratodling`
- **Sender email:** `noreply@kvadratodling.se` (eller `hej@kvadratodling.se`)

## Variabler som används

- `{{ .ConfirmationURL }}` — komplett länk inkl. token + redirect

Andra tillgängliga (ej använda just nu): `{{ .Token }}`, `{{ .TokenHash }}`,
`{{ .Email }}`, `{{ .SiteURL }}`, `{{ .RedirectTo }}`.

## Designnoter

- Inline styles överallt — Gmail/Outlook strippar `<style>`-block.
- Table-baserad layout för Outlook/Litmus-kompatibilitet.
- Max-bredd 520 px, fluid på mobil.
- Färger matchar appens `green-600` (#16a34a) och `green-50` (#f0fdf4).
- Light-mode lock via `color-scheme` meta — undviker att Gmail
  dark-mode-invertar bakgrunden och bryter knappkontrasten.
- Preheader-text dolt i `<div style="display:none">` så inbox-preview
  visar något läsbart istället för "Klicka på knappen…".
