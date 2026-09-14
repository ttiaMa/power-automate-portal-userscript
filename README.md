# PA Enhanced

[Italiano](#italiano) · [English](#english)

## Italiano

Userscript per migliorare l’esperienza d’uso del portale Microsoft Power Automate su `make.powerautomate.com`.

Versione corrente: **1.4.10**.

### Funzioni principali

- Gestione avanzata delle tabelle: riordino, ridimensionamento, adattamento e possibilità di nascondere o ripristinare le colonne.
- Salvataggio automatico del layout delle tabelle e collegamento diretto alla scheda **Items** delle work queue.
- Espansione automatica dei risultati tramite **Show more**.
- Esportazione e importazione delle configurazioni salvate localmente.

### Installazione con Violentmonkey

#### 1. Installa e abilita Violentmonkey

- **Microsoft Edge:** [Violentmonkey su Microsoft Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/eeagobfjdenkkddmbclomhiblgggliao)
- **Google Chrome:** [Violentmonkey sul Chrome Web Store](https://chromewebstore.google.com/detail/violentmonkey/jinjaccalgkegednnccohejagnlnfdag)
- Altri browser: [Get Violentmonkey](https://violentmonkey.github.io/get-it/)

Dopo l'installazione:

1. Verifica che **Violentmonkey sia attivo** e visibile tra le estensioni del browser, preferibilmente fissandolo alla barra degli strumenti in alto a destra.
2. Nelle impostazioni dell'estensione, abilita **Consenti script utente**.
3. Consenti a Violentmonkey di leggere e modificare i dati su `https://make.powerautomate.com`.

#### 2. Installa PA Enhanced

1. Apri [`power-automate-table-manager.user.js`](https://github.com/ttiaMa/power-automate-portal-userscript/raw/main/power-automate-table-manager.user.js).
2. Verifica che Violentmonkey intercetti il file e mostri la schermata di installazione.
3. Controlla che il nome dello script sia **PA Enhanced** e premi **Installa**.
4. Apri o ricarica [Microsoft Power Automate](https://make.powerautomate.com/).
5. In basso a destra comparirà il pulsante **PA Enhanced**.

> Installando lo script dal link indicato sopra, Violentmonkey può gestire automaticamente gli aggiornamenti alle nuove versioni.

Se il file viene mostrato come semplice testo, apri Violentmonkey, premi **+**, scegli **Installa da URL** e usa:

```text
https://raw.githubusercontent.com/ttiaMa/power-automate-portal-userscript/main/power-automate-table-manager.user.js
```

### Note

Le configurazioni di PA Enhanced vengono salvate localmente tramite lo storage di Violentmonkey.

Lo script interviene esclusivamente sull'interfaccia del portale e non modifica i dati delle work queue.

---

## English

Userscript designed to improve the experience of using the Microsoft Power Automate portal at `make.powerautomate.com`.

Current version: **1.4.10**.

### Main features

- Advanced table management: reorder, resize, auto-fit, hide, and restore columns.
- Automatic saving of table layouts and a direct link to the **Items** view of work queues.
- Automatic expansion of results through **Show more**.
- Export and import of locally saved configurations.

### Installation with Violentmonkey

#### 1. Install and enable Violentmonkey

- **Microsoft Edge:** [Violentmonkey on Microsoft Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/eeagobfjdenkkddmbclomhiblgggliao)
- **Google Chrome:** [Violentmonkey on the Chrome Web Store](https://chromewebstore.google.com/detail/violentmonkey/jinjaccalgkegednnccohejagnlnfdag)
- Other browsers: [Get Violentmonkey](https://violentmonkey.github.io/get-it/)

After installation:

1. Make sure **Violentmonkey is enabled** and visible among your browser extensions, preferably pinned to the toolbar in the top-right corner.
2. In the extension settings, enable **Allow user scripts**.
3. Allow Violentmonkey to read and modify data on `https://make.powerautomate.com`.

#### 2. Install PA Enhanced

1. Open [`power-automate-table-manager.user.js`](https://github.com/ttiaMa/power-automate-portal-userscript/raw/main/power-automate-table-manager.user.js).
2. Make sure Violentmonkey detects the file and opens the userscript installation page.
3. Check that the script name is **PA Enhanced** and click **Install**.
4. Open or reload [Microsoft Power Automate](https://make.powerautomate.com/).
5. The **PA Enhanced** button will appear in the bottom-right corner.

> When the script is installed from the link above, Violentmonkey can automatically handle updates to newer versions.

If the file is displayed as plain text, open Violentmonkey, click **+**, choose **Install from URL**, and use:

```text
https://raw.githubusercontent.com/ttiaMa/power-automate-portal-userscript/main/power-automate-table-manager.user.js
```

### Notes

PA Enhanced configurations are stored locally through Violentmonkey storage.

The script only changes the portal interface and does not modify work queue data.
