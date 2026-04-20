# H6

Skabelon til MAGS svendeprøven. Overblik og krav: [H6 på Mercantec](https://mercantec.notion.site/h6).

## Notes

Valgfri Obsidian-noter. Vil I ikke bruge dem, så slet mappen `Notes` (og evt. `.obsidian`).

## Dokumentation (MkDocs)

Skriv i Markdown under [`Rapport/docs/`](Rapport/docs/). Preview:

```bash
cd Rapport
pip install -r requirements-docs.txt
mkdocs serve
```

Åbn [http://127.0.0.1:8000](http://127.0.0.1:8000).

**Docker** (samme mappe som `Dockerfile`):

```bash
cd Rapport
docker build -t h6-rapport .
docker run --rm -p 8000:8000 h6-rapport
```

PDF-export: `npm install` og `npm run pdf` i `Rapport` (kræver kørende docs-URL; se `Rapport/scripts/export-print-pdf.mjs`).
