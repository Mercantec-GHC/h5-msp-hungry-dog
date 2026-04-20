# Produktrapport (H6 · Svendeprøve)

Den **aktuelle skabelon og preview** ligger i MkDocs:

- **Kildefiler:** mappen [`docs/skabelon/`](docs/skabelon/) (én fil pr. kapitel); procesrapport: [`docs/skabelon-proces/`](docs/skabelon-proces/)
- **Konfiguration:** [`mkdocs.yml`](mkdocs.yml)
- **Kør lokalt:**

  ```bash
  pip install -r requirements-docs.txt
  mkdocs serve
  ```

  Åbn derefter **<http://127.0.0.1:8000>** for den pæne UI med søgning og mørk/lys tilstand.

- **Statisk build:** `mkdocs build` → output i `site/` (kan zippes eller hostes)

### Én lang PDF (hele MkDocs-sitet, anbefalet)

Plugin’et **print-site** lægger **alt indhold** (efter `nav` i `mkdocs.yml`) sammen på **én webside** med indholdsfortegnelse, forside og nummererede overskrifter — velegnet til **én sammenhængende PDF**.

1. Kør `pip install -r requirements-docs.txt` (så `mkdocs-print-site-plugin` er med).
2. Start med **`mkdocs serve`** (anbefalet, så Mermaid osv. kører) eller brug `mkdocs build` og åbn `site/index.html`.
3. I menuen: vælg **“Hele sitet (PDF)”** — eller gå direkte til **<http://127.0.0.1:8000/hele-sitet/>** (lokalt) / `site/hele-sitet/index.html` (efter build).
4. Skift til **lys tilstand** i palette (PDF ser oftest bedst ud så — især kode og kontrast).
5. **Ctrl+P** → **Gem som PDF** / **Microsoft Print to PDF**.
6. Under **Flere indstillinger**: slå **Baggrundgrafik** (*Background graphics*) **til**. **Uden den** taber du typisk **farver**, **syntax-highlight**, **admonitions** og **grå kodebaggrund** — PDF’en bliver flad og sort‑hvid.
7. **Sidetal i browser‑PDF (CSS, Firefox):** Footer viser **`Side N`** (uden “ud af …”) — ren CSS kan ikke regne **Y = antal sider − 2**. **Forside** har ingen footer (`@page :first`); **toc** har ingen footer (`page: toc`); fra **første kapitel** nulstilles tælleren så **Side 1** typisk svarer til **PDF‑side 3**. **Chrome/Edge** viser ofte ikke `@page`‑footer.
8. **Fuld tekst `Side X ud af Y` med korrekt Y:** **`npm run pdf`** — **`Y` = samlet antal PDF‑sider minus de to første** (kun indholdssider). Første linje er **Side 1 ud af Y** på PDF‑side **3** som standard.
   ```bash
   cd Rapport
   npm install
   mkdocs serve
   ```
   Nyt terminal:
   ```bash
   cd Rapport
   npm run pdf
   ```
   Valgfrit — anden startside for **Side 1** (fx hvis toc fylder 2 sider, sæt **4**):
   ```bash
   npm run pdf -- http://127.0.0.1:8000/hele-sitet/ min_fil.pdf 4
   ```
   Eller miljø: `set PDF_START_PAGE=4` (Windows) / `PDF_START_PAGE=4` (Unix) før `npm run pdf`.
9. Vælg **A4** og passende marginer ved browser‑PDF.

### Udskrift / PDF (én side ad gangen)

1. Kør **`mkdocs serve`** (eller åbn **`site/index.html`** efter `mkdocs build`).
2. Gå til den side, du vil udskrive (gentag for hvert kapitel, hvis du vil have mange små PDF’er).
3. **Ctrl+P** → **Gem som PDF**.

Projektets `extra.css` skjuler header, sidemenu og søgning under print på almindelige sider, så du får mest indhold på papiret.

> Hele forløbet omkring H6: [Mercantec · H6](https://mercantec.notion.site/h6)

Du kan frit bruge denne fil i Obsidian som **hurtig hukommelse** – det meste indhold, du afleverer, bør stadig ligge under `docs/`, så MkDocs kan bygge det.
