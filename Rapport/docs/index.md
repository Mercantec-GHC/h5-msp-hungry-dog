---
hide:
  - navigation
---

<div class="svend-hero" markdown="1">

# Svendeprøve · H6

**Skabeloner og overblik til MAGS** – produktrapport, procesrapport og hele forløbet samlet ét sted.

[Videre til H6-forløbet :material-school:](forlobet/overblik.md){ .md-button .md-button--primary }
[Produktskabelon :material-file-document-outline:](skabelon/01-forside-metadata.md){ .md-button }
[Processkabelon :material-chart-timeline:](skabelon-proces/01-projektplanlaegning.md){ .md-button }

</div>

## Sådan bruger du det

1. **Læs [H6-forløbet](forlobet/overblik.md)** – tidsplan, krav, eksamen og links.
2. **Skriv i `docs/skabelon/`** (produkt) og **`docs/skabelon-proces/`** (proces) – ét kapitel pr. fil.
3. **Preview lokalt:**

    ```bash
    pip install -r requirements-docs.txt
    mkdocs serve
    ```

    Åbn <http://127.0.0.1:8000>.

4. **Byg til aflevering eller hosting:**

    ```bash
    mkdocs build
    ```

    Output i `site/`.

!!! tip "Mercantec · H6"

    Baggrund og officielle beskeder: [H6 på Mercantec](https://mercantec.notion.site/h6).

## To rapporter – kort

| Rapport | Typisk indhold |
|---------|----------------|
| **Produkt** | Kravspec, domænemodel, dokumentation af løsningen, diagrammer, bilag |
| **Proces** | **Projektplanlægning** (estimat/realisering + **Gantt**), **logbog**, **konklusion** |

**Gantt:** Se [Tidsplan & Gantt](forlobet/tidsplan.md) – interaktiv **Mermaid**-graf du kan kopiere til procesrapporten.

Pladsholdere: <span class="svend-placeholder">[UDFYLD]</span>.
