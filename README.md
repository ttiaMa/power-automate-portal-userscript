# PA Enhanced

Userscript per migliorare l’esperienza d’uso del portale Microsoft Power Automate su `make.powerautomate.com`.

Versione corrente: **1.4.10**.

## Funzioni principali

- Riordino delle colonne tramite trascinamento, mantenendo allineati intestazione e contenuto.
- Ridimensionamento manuale delle colonne e adattamento automatico con doppio clic.
- Salvataggio persistente di ordine, larghezze e colonne nascoste.
- Preferenze condivise tra le pagine **Items** delle diverse work queue.
- Possibilità di nascondere una colonna e ripristinarla subito tramite **Annulla**.
- Ripristino di tutte le colonne nascoste senza perdere ordine e larghezze.
- Apertura diretta della scheda **Items** dalla lista delle work queue.
- Clic automatici ripetuti e opzionali su **Show more** per espandere tutti gli elementi disponibili.
- Esportazione e importazione della configurazione.
- Pulsante **PA Enhanced** trascinabile, con ritorno automatico alla posizione predefinita quando la finestra del browser viene ridimensionata.

## Installazione con Violentmonkey

### 1. Installa Violentmonkey

- **Microsoft Edge:** apri [Violentmonkey su Microsoft Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/eeagobfjdenkkddmbclomhiblgggliao), premi **Ottieni** e conferma con **Aggiungi estensione**.
- **Google Chrome:** apri [Violentmonkey sul Chrome Web Store](https://chromewebstore.google.com/detail/violentmonkey/jinjaccalgkegednnccohejagnlnfdag), premi **Aggiungi** e conferma con **Aggiungi estensione**.

Al termine dell'installazione, apri `edge://extensions` in Edge oppure `chrome://extensions` in Chrome, seleziona **Dettagli** sotto Violentmonkey e attiva **Consenti script utente**. In **Accesso al sito**, consenti inoltre all'estensione di leggere e modificare i dati su `https://make.powerautomate.com`.

Se vuoi averla sempre a portata di mano, apri il menu **Estensioni** del browser e fissa Violentmonkey alla barra degli strumenti.

La pagina ufficiale con le versioni per Edge, Chrome, Firefox e altri browser è disponibile in [Get Violentmonkey](https://violentmonkey.github.io/get-it/).

### 2. Installa PA Enhanced

1. Apri il file [`power-automate-table-manager.user.js`](https://github.com/ttiaMa/power-automate-portal-userscript/raw/main/power-automate-table-manager.user.js).
2. Violentmonkey mostrerà la schermata di installazione dello userscript.
3. Controlla che il nome sia **PA Enhanced** e premi **Installa**.
4. Apri o ricarica [Microsoft Power Automate](https://make.powerautomate.com/).
5. In basso a destra comparirà il pulsante blu **PA Enhanced**.

#### Attiva gli aggiornamenti automatici

1. Installa PA Enhanced usando il collegamento indicato sopra, senza copiare manualmente il codice in un nuovo script: in questo modo Violentmonkey conserva l'indirizzo dal quale verificare le nuove versioni.
2. Apri la **Dashboard** di Violentmonkey e individua **PA Enhanced**.
3. Apri le impostazioni dello script e verifica che **Controlla aggiornamenti** sia attivo; normalmente è già abilitato dopo l'installazione.
4. Nelle impostazioni generali di Violentmonkey verifica che l'intervallo per il controllo degli aggiornamenti non sia disattivato.
5. Da questo momento non devi reinstallare lo script: Violentmonkey confronterà periodicamente `@version` e, quando sarà disponibile una versione più recente, la scaricherà tramite `@updateURL` e `@downloadURL`.

Gli indirizzi di aggiornamento sono già inclusi nei metadati di PA Enhanced e puntano sempre al file presente nel ramo `main` di questo repository.

Se il file viene mostrato come semplice testo, apri Violentmonkey, premi **+**, scegli **Installa da URL** e incolla:

```text
https://raw.githubusercontent.com/ttiaMa/power-automate-portal-userscript/main/power-automate-table-manager.user.js
```

## Aggiornamenti

Violentmonkey può verificare automaticamente gli aggiornamenti grazie agli indirizzi `@updateURL` e `@downloadURL` inclusi nello script.

Per controllare manualmente:

1. Apri la dashboard di Violentmonkey.
2. Individua **PA Enhanced**.
3. Apri il menu dello script e scegli **Controlla aggiornamenti**.

## Utilizzo

- Trascina il pulsante **PA Enhanced** per spostarlo in un punto libero della pagina; il pannello si apre vicino al pulsante e, dopo un ridimensionamento della finestra, entrambi tornano discretamente nella posizione predefinita.
- Passa il mouse sull’intestazione e trascina la maniglia `⋮⋮` per spostare la colonna.
- Trascina il bordo destro dell’intestazione per ridimensionarla.
- Fai doppio clic sul bordo destro per adattare la larghezza al contenuto visibile.
- Passa sull’intestazione e premi **Hide** per nascondere la colonna nella sola visualizzazione.
- La notifica resta visibile per 10 secondi e permette di annullare immediatamente l’operazione.
- Il pannello elenca le colonne nascoste; **Mostra tutte le colonne nascoste** le ripristina mantenendo ordine e larghezze.
- Con **Premi automaticamente Show more**, il tasto presente al termine della tabella viene cliccato più volte, con un intervallo tra i caricamenti, finché non restano altri elementi da espandere.
- Nella pagina principale **Work queues**, il collegamento **Items →** apre direttamente gli item della coda.
- Da tastiera, focalizza la maniglia e usa `Alt+Shift+←` oppure `Alt+Shift+→`.

## Viste e salvataggio

Il pannello mostra la vista corrente, ad esempio **Machines**, **Work queues** o **Items**. Nelle pagine Items non viene indicato il nome della coda perché lo stesso layout è condiviso tra tutte le work queue.

- **Ripristina questa vista** elimina le preferenze soltanto per la vista aperta.
- **Azzera tutto** elimina tutte le preferenze salvate da PA Enhanced.
- **Esporta layout** e **Importa layout** permettono di trasferire la configurazione.

Le preferenze restano nel browser tramite lo storage del gestore di userscript. Lo script non modifica i dati delle code: interviene soltanto sulla visualizzazione delle tabelle nella pagina.

## Compatibilità

Lo script è progettato per `https://make.powerautomate.com/*` ed è stato verificato sulle viste **Work queues**, **Work queue items** e sulle griglie Fluent UI analoghe, come **Machines**.

Power Automate è una SPA e alcune tabelle, in particolare Items, usano righe e colonne virtualizzate. PA Enhanced associa le celle tramite ruoli ARIA e chiavi semantiche e riapplica il layout quando React aggiorna la griglia.

## Problemi e suggerimenti

In caso di malfunzionamento:

1. Verifica che PA Enhanced sia abilitato nella dashboard di Violentmonkey.
2. Ricarica completamente Power Automate.
3. Prova **Ripristina questa vista** dal pannello.
4. Se il problema continua, apri una [segnalazione su GitHub](https://github.com/ttiaMa/power-automate-portal-userscript/issues) indicando pagina interessata, browser e screenshot.

