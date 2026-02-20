# Changelog

Tutte le modifiche degne di nota a questo progetto saranno documentate in questo file.

Il formato è basato su [Keep a Changelog](https://keepachangelog.com/it/1.1.0/)
e questo progetto aderisce a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.4.0] - 2026-02-20

### Fixed
- Risolto un bug critico che causava la sparizione della lista pazienti dopo l'inserimento di un appuntamento (ReferenceError in `renderPatients`).
- Assicurato l'aggiornamento automatico della lista pazienti dopo ogni salvataggio o eliminazione di appuntamenti.
- Ripristinati correttamente gli stili grafici originali dell'applicazione che erano andati persi durante l'aggiornamento a Tailwind CSS 4.
- Migliorata la configurazione di Tailwind CSS 4 per garantire la compatibilità con i componenti personalizzati e le classi di utilità.
- Corretta la configurazione di build per GitHub Pages (base path relativo) per evitare la perdita di stili e colori in produzione.
- Risolto il problema della visualizzazione errata su smartphone forzando la disattivazione dei vecchi Service Worker e ripristinando il corretto bundling dei CSS tramite Vite.
- Ottimizzato il Service Worker (v15) per operare in modalità pass-through durante la fase di risoluzione dei problemi di cache.

### Added
- Gestione dello stato dei pazienti (Attivo/Non attivo).
- Filtro nella lista pazienti per visualizzare pazienti "Attivi", "Non attivi" o "Tutti".
- Toggle "Attivo" nella scheda di creazione/modifica del paziente.
- Raffinatezza UX: i pazienti non attivi sono visualizzati con opacità ridotta solo quando è selezionato il filtro "Tutti" e un'etichetta "Inattivo" nella lista completa.
- Raffinatezza UX: i pazienti non attivi vengono esclusi dalla selezione per i nuovi appuntamenti.
- Supporto per la nuova proprietà `active` nelle funzioni di importazione ed esportazione JSON.

## [1.3.0] - 2026-02-01

### Added
- Introdotto il campo "Comune di residenza" nell'anagrafica dei pazienti.
- Aggiunta l'icona "Map Pin" (segnaposto) accanto al comune di residenza nelle card dell'agenda.
- Visualizzazione del Comune di residenza del paziente direttamente nella card dell'appuntamento in agenda.
- Allineamento orizzontale ottimizzato: Comune e Note ora iniziano esattamente sotto il cognome del paziente per una migliore leggibilità.

### Changed
- Aggiornato il Service Worker alla versione `v8` per forzare il refresh della cache e rendere le modifiche grafiche immediatamente visibili.
- Migliorata la struttura della card appuntamento utilizzando una griglia CSS a due colonne per separare l'orario dai dettagli del paziente.

## [1.2.0] - 2025-11-14

### Added
- Funzionalità "Suggerisci Orario" migliorata per rilevare slot liberi di 1 ora tra le 08:00 e le 18:00, escludendo la pausa pranzo (12:00-14:00).
- Supporto alle festività italiane (Capodanno, Pasqua, Ferragosto, ecc.) con evidenziazione in rosso nell'agenda.
- Indicatori visivi circolari per le ore totali giornaliere e settimanali con colorazione dinamica (grigio/verde/rosso).

### Changed
- Migrazione automatica dei dati: suddivisione del vecchio campo unico "Paziente" in "Nome" e "Cognome".
- Gestione della settimana: ora è possibile eliminare in blocco tutti gli appuntamenti di una settimana specifica.
- Service Worker aggiornato alla versione `v7`.

## [1.1.0] - 2025-11-01

### Added
- Funzionalità "Suggerisci Orario" migliorata per rilevare slot liberi di 1 ora tra le 08:00 e le 18:00, escludendo la pausa pranzo (12:00-14:00).

## [1.0.0] - 2025-10-26

### Added
- Rilascio iniziale di OSS Hero.
- Gestione Agenda settimanale (Lunedì-Domenica).
- Anagrafica Pazienti con ricerca e gestione ultima visita.
- Sistema di Report mensili con calcolo automatico delle ore per categoria (ASA, OSS, Consulenza, Extra).
- Funzione di Import/Export dati in formato JSON per il backup.
- Supporto PWA (Progressive Web App) per l'installazione su dispositivi mobili e funzionamento offline.
- Funzione "Copia Settimana" per replicare i turni dalle settimane precedenti.

### Fixed
- Risolto il conflitto di identificatori duplicati tra `index.js` e `index.tsx`.

---
*Nota: Le date precedenti al rilascio ufficiale sono indicative per la cronologia dello sviluppo.*
