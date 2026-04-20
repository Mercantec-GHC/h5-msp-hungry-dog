# Procesrapport (H6 · Svendeprøve)

Den **aktuelle proces-skabelon** i MkDocs ligger her:

- **Kildefiler:** [`docs/skabelon-proces/`](docs/skabelon-proces/) — projektplanlægning (med **Gantt**), logbog, konklusion  
- **Overblik over krav:** [`docs/forlobet/formelle-krav.md`](docs/forlobet/formelle-krav.md)  
- **Tidslinje / Gantt-eksempel:** [`docs/forlobet/tidsplan.md`](docs/forlobet/tidsplan.md)

**Kør lokalt:**

```bash
pip install -r requirements-docs.txt
mkdocs serve
```

Åbn **<http://127.0.0.1:8000>** og vælg **Skabelon · Proces** i menuen.

Diagrammer bruger **Mermaid** (browser) — til PDF/papir kan du også eksportere Gantt fra **Google Sheets / Excel** ([links i docs](docs/forlobet/links.md)).

Se også [`ProduktRapport.md`](ProduktRapport.md) for den tekniske produktrapport.
