# PA Enhanced

Userscript per migliorare la gestione delle tabelle di Microsoft Power Automate su `make.powerautomate.com`.

Versione corrente: **1.4.5**.

## Funzioni principali

- Riordino delle colonne tramite trascinamento, mantenendo allineati intestazione e contenuto.
- Ridimensionamento manuale delle colonne e adattamento automatico con doppio clic.
- Salvataggio persistente di ordine, larghezze e colonne nascoste.
- Preferenze condivise tra le pagine **Items** delle diverse work queue.
- Possibilità di nascondere una colonna e ripristinarla subito tramite **Annulla**.
- Ripristino di tutte le colonne nascoste senza perdere ordine e larghezze.
- Apertura diretta della scheda **Items** dalla lista delle work queue.
- Clic automatico opzionale su **Show more** per espandere gli elementi mostrati.
- Esportazione e importazione della configurazione.

## Installazione con Violentmonkey su Microsoft Edge

### 1. Installa Violentmonkey

1. Apri la pagina [Violentmonkey su Microsoft Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/eeagobfjdenkkddmbclomhiblgggliao).
2. Premi **Ottieni**.
3. Conferma scegliendo **Aggiungi estensione**.
4. Se vuoi averla sempre a portata di mano, apri il menu **Estensioni** di Edge e fissa Violentmonkey alla barra degli strumenti.

La pagina ufficiale con le versioni per Edge, Chrome, Firefox e altri browser è disponibile in [Get Violentmonkey](https://violentmonkey.github.io/get-it/).

### 2. Installa PA Enhanced

1. Apri il file [`power-automate-table-manager.user.js`](https://github.com/ttiaMa/power-automate-portal-userscript/raw/main/power-automate-table-manager.user.js).
2. Violentmonkey mostrerà la schermata di installazione dello userscript.
3. Controlla che il nome sia **PA Enhanced** e premi **Installa**.
4. Apri o ricarica [Microsoft Power Automate](https://make.powerautomate.com/).
5. In basso a destra comparirà il pulsante blu **PA Enhanced**.

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

- Passa il mouse sull’intestazione e trascina la maniglia `⋮⋮` per spostare la colonna.
- Trascina il bordo destro dell’intestazione per ridimensionarla.
- Fai doppio clic sul bordo destro per adattare la larghezza al contenuto visibile.
- Passa sull’intestazione e premi **Hide** per nascondere la colonna nella sola visualizzazione.
- La notifica resta visibile per 10 secondi e permette di annullare immediatamente l’operazione.
- Il pannello elenca le colonne nascoste; **Mostra tutte le colonne nascoste** le ripristina mantenendo ordine e larghezze.
- Con **Premi automaticamente Show more**, se il tasto è presente al termine della tabella, verrà cliccato automaticamente per espandere gli elementi mostrati.
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

## Autori

**Mattia + Solaria**

