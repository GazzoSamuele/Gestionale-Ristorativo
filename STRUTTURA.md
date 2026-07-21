# Struttura del Progetto — Gestionale Ristorativo

Documento di riferimento: posizionamento, ruoli, schermate, decisioni.
Riconciliato con i wireframe (revisione del 17 luglio 2026).
**Documento inclusivo**: tiene *tutto* (anche Fase 2, extra, progetti futuri).
Si taglia solo quando si arriva a programmare. **Non** è codice.

---

## 🎯 Posizionamento (il filtro per ogni decisione)

> **"Aiutare il personale a lavorare meglio, con schermate moderne e intuitive —
> senza quei gestionali vecchi di vent'anni con i bottoni grigi."**

**Non** è un POS, **non** è un sistema fiscale, **non** è un ERP, **non** è un gestionale HR.

Filtro: *"Questa aiuta il personale a lavorare meglio durante il servizio?"*
Sì → entra. Amministrazione / fisco / contabilità → fuori.

---

## 💼 Visione commerciale (modello di vendita)

Il progetto non è pensato solo come software: l'idea è **venderlo insieme a due prodotti
hardware** (il *bump bar* in cucina e la *macchina peluche/gadget*).

**Il modello è MODULARE, non a pacchetto unico:**

> **Gestionale = il prodotto base.**
> **Bump bar** e **macchina gadget** = **moduli opzionali**, che aumentano il valore per chi li vuole.

⚠️ **Regola non negoziabile: il software deve reggersi da solo.** Se il valore del gestionale
*dipende* dall'hardware, non lo puoi vendere a chi l'hardware non vuole — e all'inizio saranno
la maggioranza. Modulare = vendi a tutti, e chi vuole di più paga di più.

**Le due aggiunte non sono la stessa categoria** (importante non confonderle):

| | **Bump bar** | **Macchina peluche/gadget** |
| --- | --- | --- |
| Cos'è | **Accessorio** al software | **Prodotto/linea a sé** |
| Cosa fa | Rende il gestionale più comodo | Fa *marketing* per il ristorante |
| Cosa comporta | Comprarlo e configurarlo | Produrla, rifornirla, ripararla, stampare i gadget |
| A chi si vende | A chi già compra il gestionale | Anche a chi il gestionale non lo vuole |

**Perché la macchina ha una sua logica** (non è un gadget scollegato): chiude il **ciclo di
fidelizzazione** → *il cliente mangia → riceve un gettone → lo usa sulla macchina → torna a
mangiare*. È il **punto fisico** dove il sistema di fidelizzazione (tessera punti, gettoni,
ruota della fortuna) tocca il cliente.

⚠️ **L'hardware cambia il tipo di azienda che sei**: un bug software si risolve da remoto in
dieci minuti, una macchina rotta richiede qualcuno che salga in auto. Assistenza, ricambi,
magazzino, garanzia. Non è un motivo per non farlo — è un motivo per **saperlo prima**.

---

## Principi guida

- **Si separa in superficie, si condivide in profondità** — UI/rotte separate per area,
  ma logica e dati (in `src/lib/`) unici e condivisi.
- **YAGNI** — le cartelle si creano quando si costruisce quella schermata.
- **I tre livelli**: schermate → rotte · funzionalità → componenti · integrazioni esterne → Fase 2.
- **Report (retrospettivo) = Titolare** · **strumento vivo = Operatore**.
- **Vista servizio ≠ vista editor/config** — sempre separate.
- **Azioni distruttive** — mai sempre a schermo; conferma + permesso.
- **Dato strutturato**, non immagine/testo libero, per tutto ciò che va contato/tracciato.

---

## Layout generale

- L'intera app è **una dashboard**; **navigazione in basso**, tutti i dispositivi,
  richiudibile, responsive curato a ogni breakpoint. Massima larghezza al contenuto.
- Il pannello sotto-schede va **ancorato alla voce genitore** (non fluttuante centrato).
- **Disciplina verticale**: ogni pixel d'altezza deve guadagnarsi il posto.
- 🔧 **Verde doppio** da risolvere: è sia stato "libero/pronto" sia "voce attiva" →
  voce attiva in neutro ad alto contrasto.

**Dispositivi target:**
| Dispositivo | Schermo | Chi | Rete |
| --- | --- | --- | --- |
| Monitor fisso cassa | Largo (16:9) | Responsabile | **Cavo ethernet** |
| Tablet cassa | Stretto | Responsabile / dipendenti | Wifi |
| Telefono personale | Stretto | Personale (timbratura) | Wifi/dati |
| Display cucina | ~tablet | Cucina *(parcheggiato)* | Wifi |

---

## Ruoli e Aree — 3 ruoli, 2 aree

| Ruolo | Area | Cosa fa |
| --- | --- | --- |
| **Titolare** (Super Admin) | `titolare` | Osserva da remoto, sola lettura + gestione menu/prezzi |
| **Responsabile** (Admin) | `operatore` | Area operativa completa |
| **Operatore** | `operatore` | Ristretto: sposta tavoli, assegna prenotazioni |

Il cliente **non** è utente dell'app, ma è un **dato** (prenotazioni, buoni sconto).

---

## Struttura delle rotte (riconciliata con i wireframe)

```
src/app/
├── login/                      ← unica, condivisa
│
├── operatore/                  ← AREA OPERATIVA (6 voci top-level)
│   ├── (home)                  → riassunti di ogni postazione (si disegna per ultima)
│   ├── sala/
│   │   ├── tavoli              → pianta spaziale, SERVIZIO (+ "Modifica sala" = editor a pannello, + "Walk-in")
│   │   ├── stato-tavoli        → quadro di stato: chi deve pagare / chi deve arrivare  [ex "gestisci-sala"]
│   │   ├── menu                → consultazione menu + bevande (SOLA LETTURA)
│   │   └── tessere-punti       → fidelizzazione cliente (nel v1)
│   ├── ordini/
│   │   ├── traccia             → stato ordini (Kanban o tabella — DA DECIDERE)
│   │   └── crea-asporto        → compositore (dish-picker) → "manda in cucina"
│   ├── prenotazioni/           → [PROMOSSA a top-level]
│   │   ├── agenda              → calendario, crea/modifica prenotazioni
│   │   └── gestisci            → arrivi del giorno + status tavoli (lettura)
│   ├── cucina/
│   │   ├── asporti / sala      → KDS "mole di lavoro" (ticket, filtrati per fonte)
│   │   └── magazzino           → scorte (quantità, limite minimo) [ex "consumi"]
│   └── personale/              → presenze live (chi c'è ora)
│
└── titolare/                   ← AREA TITOLARE (sola lettura + gestione menu) — 5 pagine
    ├── (home)                  → riassunti + stato "in tempo reale · agg. hh:mm"
    ├── segnalazioni/           → casella note dal Responsabile (badge)
    ├── zone-di-lavoro/         → dashboard SALA + CUCINA UNITE (numeri, real-time)
    ├── menu/                   → GESTIONE dati piatti (nome+prezzo) + STORICO venduto
    └── analytics/              → UNA pagina con schede/tab
```

**Perché Sala e Cucina unite in "Zone di lavoro"**: il Titolare **non lavora in un reparto**,
guarda il locale *nel suo insieme* — "com'è la sala" e "com'è la cucina" sono due facce della
stessa domanda (*"come sta andando stasera?"*). Separarle lo farebbe rimbalzare tra due pagine
per un'idea che è unica. Stessa logica per cui il Personale sta *sopra* i reparti.
⚠️ **Ma tenerle visivamente distinte** dentro la pagina: si deve capire a colpo d'occhio
"questo blocco è sala, questo è cucina" senza leggere.

Ogni area ha il proprio `layout.tsx`: cornice + **cancello** sul ruolo.

**Menu — chi scrive e chi legge (dato unico, condiviso):**
| | Chi | Cosa |
| --- | --- | --- |
| **Scrive** i piatti (crea/modifica/prezzo) | Titolare | gestione dati + storico venduto |
| **Legge** i piatti (ordinare/consultare) | Operatore | sola lettura (Ordini, Sala/menu, Cucina) |

---

## Dettaglio delle sezioni — AREA OPERATIVA

### Home
Riassunti di ogni postazione. **Si disegna per ultima** (dipende dalle altre).

### Sala
- **Pianta spaziale** dei tavoli (idea forte) + contatori Totali/Liberi/Occupati.
- **`tavoli`** = servizio. L'**editor** vive in un **pannello "Modifica sala"** che si apre su
  richiesta (elimina tavolo lì dentro, con conferma + permesso solo Responsabile) — così la
  vista servizio resta pulita. ✅ applicato
- **`stato-tavoli`** (ex "gestisci-sala") = **quadro di stato**, non editor: chi deve ancora
  **pagare**, chi deve ancora **arrivare**, tabella con numero tavolo · nome prenotazione ·
  stato · ora · pagamento sì/no.
  - 💰 **Il pagamento qui è uno *stato*, non una cassa**: sapere *se* un tavolo ha saldato è
    un bisogno operativo legittimo (nessuno esce senza pagare). Restano **fuori**: calcolo del
    conto con tasse, metodi di pagamento, scontrini fiscali.
  - ⚠️ "Tavoli che devono ancora arrivare" si sovrappone alla faccia *arrivi* delle
    Prenotazioni → non gestire la stessa cosa in due posti.
- ✅ **Azione "Walk-in"** nel pannello destro: siedi chi arriva senza prenotazione.
- **Scheda tavolo** (info vive, non solo "N POSTI"): numero, nome+ora prenotazione,
  **presenti/capienza** ("2/4"), stato, **da quanto è seduto** (turnover, prima fila).
- **Walk-in**: "occupa tavolo" senza prenotazione; il timer turnover parte comunque.
  *Prenotato ≠ occupato* (concetti distinti a livello dati).
- ✅ **Edge-case chiusi** (decisi prima di costruire — sono decisioni sul *modello dati*):
  1. **Capienza = indicazione, non vincolo** → se si superano i posti il sistema **avvisa**
     ma lascia fare (in sala una sedia si aggiunge; un software che dice no mentre la sala
     dice sì viene aggirato). Nessun blocco a livello di dati.
  2. **Unione tavoli: NON si modella.** Una comitiva non ha bisogno di due tavoli uniti: ha
     bisogno di **un tavolo grande** — e un tavolo da 20 è un tavolo come uno da 2.
     ✅ Così **"un tavolo" = "un posto dove siedono le persone"** resta 1:1 e si evita il
     concetto più costoso del modello. Se un domani servirà davvero, si aggiunge.
  3. **Due campi per i coperti**: *prenotati* (previsione) e *presenti* (realtà), entrambi
     conservati. 💡 Non sono due colonne della stessa tabella: i **prenotati** vivono sulla
     *Prenotazione*, i **presenti** sull'*occupazione del tavolo* → conferma che *prenotato*
     e *occupato* sono **entità distinte** (un walk-in ha presenti ma nessun prenotato).

### Ordini
- **Traccia** (stato ordini) + **Crea asporto** (dish-picker → "manda in cucina"). Separati.
- ❌ **Niente cassa**: no Tax, no metodi di pagamento, no "Pay Bills". "Place Order" = "manda in cucina".
- ❓ **Kanban o tabella** per il tracking (Kanban meglio a colpo d'occhio; se tabella, stato evidentissimo).
- Colori stato: **mai il colore da solo** → colore + etichetta + posizione.
- **WhatsApp/Glovo fuori dal v1**: il bisogno vero è *inserimento asporto rapido con orario*
  (già in "crea asporto"). "Non perderlo" = **badge + card in 'da gestire'**, non finestra passiva.
  Integrazione chat = Fase 2 (API ufficiali).

### Prenotazioni *(sezione a sé, importante)*
Ha **due facce**:
- **Agenda** (calendario) → *pianificare*: crea/modifica/consulta prenotazioni nel tempo.
- **Arrivi / porta** → *smaltire la fila*: nei momenti di calca, con più gruppi che arrivano
  insieme e la fila fuori, serve vedere le prenotazioni di **stasera** ordinate per orario,
  nomi grandi e scansionabili, un tocco per **"arrivato → siedi"**, e a colpo d'occhio
  *chi è dentro / chi aspetti / chi è in ritardo*. Ottimizzata per **velocità**.
- 💡 In quel momento la fila mescola *prenotati attesi* + *walk-in in attesa* (idea "lista d'attesa", da valutare v1).
- **Confine con la Sala**: qui si *scrivono/organizzano* le prenotazioni; in Sala si *siedono*.
  Ogni dato una sola casa: prenotazione qui, stato tavolo in Sala.

### Cucina — è un KDS, non un POS
- **`asporti` / `sala`** = coda di cucina (ticket), filtrata per fonte.
- Ticket: stato (Ready/In Progress/Completed) + Dine In/Takeaway + item + tavolo +
  **timer "da quanto aspetta"** (non orario assoluto; cifre tabulari) + **note/allergie in evidenza**.
- ❌ Sul ticket **niente** prezzi/Total/"Pay Bills" (è cassa).
- **`magazzino`** (ex tabella "consumi") = scorte: immagine, nome, **quantità + limite minimo
  insieme** (es. "12 / min 10") con **unità di misura**, fornitore.
  - **Non è un catalogo, è un allarme**: ordinato per **urgenza** (in esaurimento in cima),
    non per nome. Deve rispondere in 2 secondi a *"cosa sta finendo?"*.
  - **Aggiornamento scorte — deciso**: l'obiettivo è **automatico** (piatto venduto → scala
    gli ingredienti), ma richiede le **ricette** → **rimandate a dopo il v1**, e le inserirà
    il **responsabile di cucina** (⚠️ è il ruolo parcheggiato in extra #8: le due cose
    viaggiano insieme).
  - **Nel v1 quindi le scorte si aggiornano a mano**: l'azione di **rettifica quantità** è
    il meccanismo principale, non un extra → va resa comoda.
  - Serve **comunque** anche con l'automatico, perché: **inventario periodico**
    (in cucina non si cucina al grammo → i numeri derivano sempre dal reale) e **sprechi**
    (roba buttata/rotta/andata a male, che le vendite non scalano).
- 🔧 "Consumi totale giornaliero" (retrospettiva) → **Analytics del Titolare**.
- 💡 Riferimenti giusti: cercare **"KDS / Kitchen Display System"**, non "POS dashboard".

### Personale *(sezione **top-level**, confermata)*
**Perché top-level e non dentro Sala:** il personale **attraversa i reparti** (camerieri *e*
cuochi). Dentro "Sala" dovresti o duplicare le presenze anche sotto Cucina, o tenere dati di
cucina in una sezione "sala". Ciò che riguarda tutti i reparti sta *sopra* i reparti.
Coerente anche con l'uso reale: si controlla **prima del servizio**, non "in sala".

- **A cosa serve** (dall'esperienza): a inizio serata il Responsabile deve sapere **che brigata
  ha a disposizione**; se qualcuno è assente o in ritardo **senza motivo**, va segnalato al
  Titolare.
- **Presenze live** (chi c'è ora): il dipendente si autentica dal proprio telefono (passkey).
  Tabella: nome dipendente · presente oggi · **ora d'arrivo** (dalla timbratura).
- ⚠️ Scope rigido: **niente HR** (no ore, buste paga, gestione/approvazione ferie).
- **Ferie/permessi/malattia** → **sola lettura**, mai accettazione. **Deciso**: si **aggancia
  l'app HR di terze parti** già in uso nel locale, mostrando gli **ultimi permessi/ferie presi**
  per aiutare il Responsabile a organizzare i giorni e le settimane a venire →
  **Fase 2** (dipendenza esterna). Nel **v1** = **solo presenze live**.
- **Segnalazioni al Titolare** — il Titolare è **remoto per progetto**, quindi serve un canale:
  - ✅ **Canale di segnalazione**: un **modale semplice** per scrivere *"questo è successo"*
    (es. ritardo/assenza ingiustificata, comunicazioni). Nessuna approvazione, nessuno stato.
  - ❌ **Sistema di richieste con approvazione** (richiesta → approva/nega → stato): è **HR**, fuori.
  - ⚠️ **Conseguenza**: la segnalazione deve **atterrare da qualche parte nell'area Titolare**
    → serve una **casella segnalazioni** lì (vedi sotto).
  - ⚠️ Registrare **ritardi/assenze** dei dipendenti sono **dati personali sui lavoratori**:
    oltre al GDPR, in Italia il monitoraggio dei dipendenti ha regole sue. Da trattare con cura.

### Tessere punti *(sotto Sala — **nel v1**)*
Obiettivo dichiarato: raccogliere dati sui clienti per **migliorare servizio e prodotti**.
- **Ricerca cliente** + scheda con: nome · **data prima prenotazione** · **punti totali** ·
  **punti mancanti al premio**. Poi **elenco premi e sconti**.
- 🔧 **Gerarchia da invertire**: nel momento d'uso hai il cliente davanti → i *suoi* dati
  devono dominare; il catalogo premi è materiale di consultazione, secondario.
- **Chi scrive / chi legge** (come il Menu): l'**elenco premi** è *configurazione* → esiste già
  una versione a parte per modificarli. ❓ Aperto: la modificano **solo il Titolare** o **anche
  il Responsabile**? (è un permesso: i premi costano soldi)
- 🔑 **Il momento dell'attribuzione** (è qui che questi sistemi falliscono): quando il cliente
  paga, qualcuno deve **collegare la visita a un cliente** perché il punto si registri. Se il
  gesto è lento, nel pieno del servizio non lo si fa → dati a metà, peggio di nessun dato.
  ❓ Da definire: cosa fa esattamente il Responsabile in quel momento.
- ⚠️ **Buco noto**: la tessera prende l'identità **dalla prenotazione**, ma un **walk-in non ha
  prenotazione** → niente nome, niente punti. O si escludono i walk-in (scelta legittima) o
  serve un modo rapido di prendere il nome al conto.
- ⚠️ **GDPR**: nome cliente + storico visite + punti = **profilazione** di dati personali.

---

## Dettaglio delle sezioni — AREA TITOLARE *(da disegnare)*

- **Home** ✅ *(fatta)* — 4 numeri grandi in cima (tavoli occupati "14/22" · coperti stasera ·
  ordini in attesa · **venduto serata**) + 3 pannelli (zone di lavoro · personale presente ·
  segnalazioni con badge).
  - 💡 **Indicatore "in tempo reale · agg. 20:41"**: senza, il Titolare da casa non saprebbe se
    sta guardando *adesso* o dati fermi. Da tenere.
  - 🔗 Bei collegamenti trasversali: allarme magazzino che risale dalla cucina, "2 assenti →
    vedi segnalazioni".
- **📥 Segnalazioni** — dove atterrano le note scritte dal Responsabile (ritardi/assenze,
  comunicazioni). *Necessaria*: il Titolare è remoto, senza questa il canale non ha sbocco.
  Con **badge numerico** (è qualcosa che *ti aspetta*).
  - ⚠️ Mostrare un giudizio tipo "ritardo ingiustificato" = dato personale sul lavoratore.
    Assicurarsi che sia un **fatto**, non un'opinione.
- **Zone di lavoro** — dashboard **Sala + Cucina unite**: tavoli prenotati, ordini in attesa,
  totale serata, turnover · ordini in esecuzione, utilizzo cibo/bevande/materiali.
  - ⚠️ Un nome solo: *"Zone di lavoro"* ovunque (non "Luoghi di lavoro" nelle card).
- **Menu** ✅ *(fatta)* — **una sola tabella** che unisce *gestione* (prezzo, Modifica per riga)
  e *storico venduto* (venduti, ricavo), raggruppata per categoria (Primi/Secondi/Bevande),
  con **filtro periodo**.
  - 💡 **Ottima fusione**: il titolare vede "Carbonara €12 → 98 vendute → €1.176" e ha subito
    la risposta a *"questo piatto funziona?"*, col pulsante Modifica **lì accanto**. Dato e
    azione nello stesso posto, invece che in due pagine.
  - 🔧 Da correggere: **"Guadagno" → "Ricavo"** (il guadagno sarebbe al netto del costo
    ingredienti, che è **fuori perimetro**) · togliere il "Modifica piatto" globale in alto
    (ridondante con quello per riga) · aggiungere **disponibile sì/no** (togliere un piatto
    esaurito **senza cancellarlo**, o si perde lo storico) · **ordinamento** per venduti.
- **Analytics** ✅ *(fatta)* — una pagina a **schede**: prenotazioni · ordini+Glovo · turnover ·
  materie prime · **venduto** · **consumi giornalieri**. Filtro periodo.
  - 👏 **"valore ordini · non incasso fiscale"** scritto **a schermo**: la distinzione non è solo
    applicata, è dichiarata a chi guarda. Da tenere.
  - Buone aggiunte non richieste: **scontrino medio per coperto**, **giorno migliore**,
    **+12% vs settimana scorsa** (un numero da solo non dice se è una buona settimana).
  - 🔧 Ancora da sistemare: valuta in **€** (non $) · numeri **coerenti** con quelli del Menu ·
    asse del grafico nella scala giusta (se mostra venduto, non può fermarsi a 30) ·
    classifica **ordinata** per il criterio dichiarato.
  - 💡 Da valutare: vista **"meno venduti"** (sapere cosa *non* vende è azionabile: si toglie
    dal menu) · poter ordinare per **quantità o ricavo** (il più venduto ≠ il più redditizio:
    il vino a €5 fa volume, gli spaghetti a €9 fanno ricavo).

**Stato: area Titolare completata (5/5 pagine).** Si è visto un salto: correzioni non più solo
applicate ma **anticipate** (indicatore "in tempo reale", filtri segnalazioni, scontrino medio,
disclaimer fiscale — nessuna richiesta).

---

## Revisione wireframe — cosa il confronto ha rivelato

Confronto lista ↔ wireframe ↔ Notion. Buchi e correzioni emersi:

- **Personale e Magazzino** mancavano dalla nav → aggiunti (Personale top-level, Magazzino sotto Cucina).
- **Prenotazioni** promossa da sotto-sala a **top-level**.
- **Menu** diviso: gestione+storico → Titolare; consultazione → Operatore (sola lettura).
- **Area Titolare** ancora tutta da disegnare.
- Contraddizioni corrette: WhatsApp fuori dal v1 · Cucina da POS a KDS · Consumi → Titolare.

**Pattern ricorrenti (le lezioni):**
1. I riferimenti pescati sono **POS** → trascinano dentro la **cassa** (fuori perimetro). Scegliere per categoria giusta.
2. **Dato strutturato** vs non (PDF, chat): ciò che va contato dev'essere dato.
3. **Report → Titolare**, strumento vivo → Operatore.
4. **Servizio ≠ editor**.
5. **GDPR** ovunque ci siano dati cliente (prenotazione col telefono, tessere punti).

---

## Decisioni trasversali (dal brainstorming)

1. **4 stati** per schermata: pieno · vuoto · caricamento · errore.
2. **Avvisi = badge numerico** (niente toast, niente suono) sulla voce Ordini.
3. **Toast in alto a destra** (non litiga con la barra in basso).
4. **Login** = passkey su telefono personale; monitor cassa = Responsabile fisso tutta la serata.
   (⚠️ passkey in Auth.js v5 sperimentale; piano B: PIN.)
5. **Rete** = server locale nel ristorante (mini-PC + PostgreSQL); cassa via **cavo ethernet**;
   ⚠️ **backup obbligatorio**. Solo `DATABASE_URL` cambia nel codice.
6. **Nessuna chiusura giornata/cassa** (fisco fuori perimetro). Stats per **timestamp**.
7. **Multi-utente contemporaneo** — più persone lavorano **insieme** su dispositivi diversi
   (il Responsabile organizza la sala, un cameriere la consulta, il cuoco fa l'inventario).
   Conseguenze da onorare:
   - Le schermate devono **aggiornarsi da sole**: se il cuoco segna un piatto pronto, lo
     schermo del cameriere lo deve sapere senza ricaricare (**TanStack Query** — era già nello
     stack). L'indicatore *"agg. hh:mm"* della Home Titolare diventa utile **ovunque**.
   - ❓ Serve una **regola per le modifiche simultanee** (due camerieri sullo stesso tavolo).
     Non è il caos del local-first (lì il problema era l'offline): qui il server è **fonte unica
     di verità**, quindi è risolvibile — ma la regola va decisa.
8. **Login: due porte diverse**
   - **Staff** → *"Chi inizia il turno?"*: griglia profili + QR/passkey, PIN come alternativa.
     💡 Unifica **login e timbratura** in un solo gesto (in un ristorante sono lo stesso momento).
     ⚠️ È un pattern da **dispositivo condiviso** (cassa, tablet ingresso); sul telefono
     personale la griglia dei colleghi non serve (ed è meglio anche per la privacy).
   - **Titolare** → **schermata separata**, autenticazione più severa: vede tutto (dati economici
     e sul personale) e si collega **da fuori**. Non compare mai nella griglia dello staff.
   - ⚠️ Il punto debole di un account non è quasi mai il login: è il **recupero** ("ho perso il
     telefono"). Se si irrobustisce qualcosa, si irrobustisce quello. La passkey è già
     resistente al phishing — "più severo" spesso significa solo "più scomodo".
   - ⚠️ **Il rischio grosso è architetturale, non di form**: perché il Titolare guardi da casa,
     il **server locale dev'essere raggiungibile da internet** — è lì che vive il pericolo di
     intrusione. Da risolvere con **VPN** o un **ponte in cloud** che non esponga la macchina
     del locale.

---

## Fase 2 (dopo il cuore — da fare, non tagliate)

- **Buoni sconto** (pagina riservata al **solo Titolare**): creazione buoni sconto +
  **tabella clienti con sconti attivi**. ⚠️ Salva dati personali dei clienti → **GDPR**
  (consenso, informativa, cancellazione).
- **Fidelizzazione**:
  - **Recensioni** (assicurarsi che il cliente le faccia).
  - **Tessera punti** senza iscrizione (dati presi dalla prenotazione), sconto al
    raggiungimento di un massimale in base al numero di volte che il cliente viene a mangiare.
- **Gettoni sconto** per la volta successiva:
  - Gettone **virtuale** su WhatsApp → apre un sito con una **ruota della fortuna** per vincere sconti.
  - Gettone **fisico** → da inserire in una **macchina con peluche/gadget** (stampati in 3D) del ristorante.
- **WhatsApp** (integrazione ufficiale, Business API): ricezione ordini/asporti,
  messaggi precompilati, gettone virtuale.
- **Glovo / delivery da terzi**: ricezione e gestione ordini.
- **Integrazione app HR di terze parti**: mostrare in sola lettura ferie/permessi/malattia già confermate.

---

## Extra parcheggiati (da pensare bene)

- 🅿️ **Display cucina + ruolo "Responsabile di cucina"** — display a muro (larghezza tablet),
  ruolo che vede **solo** asporti in uscita e ordini in sala. *Non serve un gestionale a
  parte: è la schermata Cucina già progettata + un ruolo con permessi ristretti.*
- 🅿️ **Zona upload PDF menu** — trascinare il file del menu "pubblicitario", solo da mostrare,
  **senza** leggerne i dati.
- 🅿️ **Pulsante fisico "piatto pronto" in cucina** — pulsantiera robusta, igienica, lavabile,
  che lo chef preme (anche col gomito) per segnare una pietanza come pronta, senza toccare
  il touchscreen con le mani unte.
  - 💡 **Ha già un nome: "bump bar"** — è lo standard nei KDS professionali, proprio per questo
    motivo. Buona parola chiave per cercare riferimenti.
  - ✅ **Molto più fattibile della macchina dei peluche**: un bump bar si presenta al computer
    come una **tastiera USB** → premere un tasto = inviare un carattere, e un'app web sa già
    ascoltare la tastiera. Si compra e si collega: **software normale + accessorio**, non un
    progetto hardware su misura.
  - ⚠️ **Principio**: è un **acceleratore, non un sostituto**. L'azione "pronto" deve
    funzionare **comunque a schermo** — se il bump bar manca o si rompe, la cucina continua.

---

## Progetti separati (dopo la conclusione di questo)

Non fanno parte di questo progetto: si faranno **dopo**. Pensati per integrarsi con esso e
rendere l'app completa e competitiva rispetto a quelle esistenti.

1. **App per telefono per prendere gli ordini.**
2. **App personalizzata per il ristorante** — prenotare, info sulle serate a tema, buoni regalo.
3. **App gestione inventari e ordini fornitori** — programmazione ordini in calendario,
   limite scorte, visualizzazione prodotti in sconto dei fornitori. Comprende la
   **sezione Fornitori** (dall'idea #5), divisa in **due schermate**:
   - **Assistenza fornitore**: contatti di riferimento, creazione di **reclami** (prodotti o
     ordini sbagliati, ecc.).
   - **Ordine**: diviso **per categoria**, mostra i prodotti disponibili. Ogni prodotto ha:
     **immagine**, **nome**, **quantità in magazzino**, **limite minimo obbligatorio**,
     **nome del fornitore**.

---

## Riepilogo delle 8 idee valutate

| # | Idea | Esito |
| --- | --- | --- |
| 1 | Navigazione in basso | ✅ Approvata — tutti i dispositivi, responsive curato |
| 2 | Terzo ruolo Operatore | ✅ Approvata — 3 ruoli, 2 aree |
| 3 | Lista personale presente | ✅ Approvata — scope rigido (solo presenze; ferie in Fase 2) |
| 4 | Kanban ordini 3 stati | ✅ Approvata — colore + etichetta + posizione (Kanban/tabella da decidere) |
| 5 | Sezione Fornitori | 🔀 Spaccata — magazzino/scorte nel cuore (sotto Cucina); ordine + assistenza + reclami nel progetto separato #3 |
| 6 | Buoni sconto | ⏭️ Fase 2 — attenzione GDPR |
| 7 | Menu | ✅ Piatti come **dati** (gestione → Titolare) · 🅿️ upload PDF come extra |
| 8 | Display cucina + ruolo cucina | 🅿️ Extra parcheggiato |

---

## ❓ Decisioni ancora aperte

1. **Ordini tracking**: Kanban o tabella?
2. **Impostazioni + identità utente**: dove vivono (sparite con la barra in alto)?
3. **Tessere punti — attribuzione**: cosa fa il Responsabile al pagamento per assegnare il punto?
   E i **walk-in** (senza prenotazione = senza identità) entrano o restano fuori?
4. **Tessere punti — permessi**: i premi li modifica solo il Titolare o anche il Responsabile?
5. **Modifiche simultanee**: la regola quando due persone toccano lo stesso dato.

*(Nessuna è bloccante per iniziare a programmare.)*

*(Chiuse: ferie/malattia → integrazione HR in **Fase 2**, v1 = solo presenze live ·
**Personale = top-level** · **Tessere punti = v1** · **Upload PDF menu** rimosso dall'area
operatore (resta extra parcheggiato lato Titolare) · **Segnalazioni** = modale semplice,
non workflow · **Pagamento** = stato sì/no, non cassa.)*
