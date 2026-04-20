# Formelle krav til aflevering

Nedenfor er hvad der typisk kan indgå i de **tre hovedfiler** (case, produktrapport, procesrapport). Det er **jeres ansvar** at vurdere, hvad der er relevant for jeres case.

!!! tip "Sprog"

    Skriv på **dansk eller engelsk** – men hold **samme sprog** på tværs af dokumenterne (med mindre andet er aftalt).

---

## Casebeskrivelse / projektoplæg

**Projektoplægget** indeholder et **scenarie** med én eller flere **problemstillinger**, som I skal undersøge og finde mulige løsninger på.

---

## Produktrapport

### Overordnet indhold

- Kort **projektbeskrivelse** med **målet** – evt. blokdiagrammer eller skitser.
- **Domænemodel** – nøgleobjekter og relationer.
- **Funktionelle krav**
- **Ikke-funktionelle krav**

### Kravspecifikation

Beskriver **hvad** løsningen skal indeholde, forståeligt for en **kunde uden teknisk baggrund**. Det handler om **hvad**, ikke **hvordan**.

#### 1. Projektbeskrivelse

- Kort overblik over **formål** og **mål** samt hvilken problemstilling I adresserer.
- Eventuelle **blokdiagrammer** eller **skitser** til overblik over komponenter og datastrømme.

#### 2. Domænemodel

- Beskriver de vigtigste **objekter** og **relationer**.
- Ofte som **UML** – også hvis I kombinerer flere delsystemer.

#### 3. Funktionelle krav

- Hvad systemet **skal kunne** – punkter eller **brugerhistorier** (*Som bruger vil jeg kunne …*), så de kan **testes**.

Eksempler:

- Login / logout  
- CRUD på data  
- Rapporter eller statistik  
- Billedupload  

#### 4. Ikke-funktionelle krav (FURPS+)

| Bogstav | Område | Eksempler |
|---------|--------|-----------|
| **F** | Functionality | Sikkerhed, integrationer ud over rene brugerhistorier |
| **U** | Usability | Navigation, UI, hurtig onboarding |
| **R** | Reliability | Oppetid, stabilitet, fejlbeh., fx 99,9 % |
| **P** | Performance | Svartider, belastning, skalering, fx \< 2 s |
| **S** | Supportability | Vedligehold, testbarhed, modularitet, dokumentation |

#### 5. Afgrænsning

Hvad er **bevidst ikke med** – så forventninger er afstemt (fx *ingen CI/CD i v1*, *ingen tredjepartsintegration i v1*).

### Vejledning

**Brugermanual** til løsningen med **illustrationer**, skærmbilleder og klar opbygning.

### Produktdokumentation

Teknisk dokumentation til **programmører** – så projektet kan **videreudvikles**.

Anbefalet indhold:

- **Konceptuel løsning** der opfylder kravene  
- Opdeling i **objekter** med tydelige ansvarsområder  
- **Sekvensdiagram** (interaktion mellem objekter)  
- **Klassediagram** (navne, felter, metoder)  

Argumentér for **teknologivalg** – **hvorfor**, ikke kun **hvad**.

!!! abstract "Spejl med skabelonen"

    Den detaljerede **MkDocs-skabelon** til produktrapporter finder du under **Skabelon · Produkt** – den følger samme tankegang som kravene ovenfor.

---

## Procesrapport

**MAGS’ struktur** til procesrapporten (det I typisk afleverer som selvstændigt dokument) omfatter:

- **Projektplanlægning** – **estimeret og realiseret** tidsplan, gerne **Gantt**  
- **Logbog**  
- **Konklusion**

!!! note "Bekendtgørelse vs. MAGS-skabelon"

    Bekendtgørelsen nævner også **problemformulering** som del af procesrapporten. Hos MAGS ligger problemformulering og kravspecifikation i praksis i **uge 1 / case** og **ikke** som et separat kapitel i Word-skabelonen til procesrapport — derfor er proces-skabelonen her opdelt i **tre** kapitler.

### Projektplanlægning

**Estimeret tidsplan i Gantt-format** skal **godkendes ved udgangen af uge 1** (sammen med jeres problemformulering og øvrige uge-1-krav — se [tidsplan](tidsplan.md)). I **procesrapporten** dokumenterer I Gantt og godkendelse under projektplanlægning. Senere tilføjer I den **realiserede** plan og afvigelser — typisk **estimat fra dag 1** og **udført** sidestillet.

Værktøjer:

- Google Sheets / Excel ([links](links.md))  
- GitHub Projects **Roadmap**  
- Eller **Mermaid Gantt** som supplement her i MkDocs ([tidsplan](tidsplan.md)) — som **primær** uge-1-Gantt bruges oftest Sheets/Excel eller screenshot til procesrapporten  

### Logbog

Løbende fra **dag ét**:

- Hvad blev lavet **hvornår**  
- **Uforudsete** hændelser  
- **Beslutninger** om ændring af mål eller fremgangsmåde  

### Konklusion

- **Resultat** af projektet  
- Hvilke **mål** er nået / ikke nået – og **hvorfor**  

!!! abstract "MkDocs-skabelon"

    Under **Skabelon · Proces** finder du felter til **projektplanlægning**, **logbog** og **konklusion**.

---

## Sidetal (lovgrundlag – resume)

For **individuelle** projekter må **procesrapport** og **produktrapport** typisk **hver** være **maks. 25 sider** ekskl. bilag og logbog. For **grupper** tillægges der **op til fem sider pr. lærling** til **hver** rapport – se den fulde formulering under [Eksamen → Lovgrundlag](eksamen.md).
