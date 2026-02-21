# Changelog

Tutte le modifiche degne di nota a questo progetto saranno documentate in questo file.

Il formato è basato su [Keep a Changelog](https://keepachangelog.com/it/1.1.0/)
e questo progetto aderisce a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.1] - 2026-02-21

### Changed
- Migliorata la veste grafica dei pazienti inattivi: icona desaturata, badge "Inattivo" in stile pillola raffinata e colori attenuati per nome e comune.

## [1.3.0] - 2026-02-21

### Added
- Gestione dello stato dei pazienti (Attivo/Inattivo).
- Filtro nella lista pazienti per visualizzare "Attivi", "Non attivi" o "Tutti".
- I pazienti inattivi sono ora esclusi dal menu a tendina della creazione appuntamenti.
- Visualizzazione differenziata per i pazienti inattivi (opacità ridotta e badge "Inattivo").
- Il campo `isActive` è incluso nelle operazioni di importazione ed esportazione JSON.

## [1.2.1] - 2026-02-20

### Fixed
- Risolto un errore `ReferenceError: patient is not defined` nella visualizzazione dell'elenco pazienti.

## [1.2.0] - 2024-05-24

### Added
- Aggiunta l'icona "Map Pin" (segnaposto) accanto al comune di residenza nelle card dell'agenda.
- Visualizzazione del Comune di residenza del paziente direttamente nella card dell'appuntamento in agenda.
- Allineamento orizzontale ottimizzato: Comune e Note ora iniziano esattamente sotto il cognome del paziente per una migliore leggibilità.

### Changed
- Aggiornato il Service Worker alla versione `v8` per forzare il refresh della cache e rendere le modifiche grafiche immediatamente visibili.
- Migliorata la struttura della card appuntamento utilizzando una griglia CSS a due colonne per separare l'orario dai dettagli del paziente.

## [1.1.0] - 2024-05-23

### Added
- Introdotto il campo "Comune di residenza" nell'anagrafica dei pazienti.
- Funzionalità "Suggerisci Orario" migliorata per rilevare slot liberi di 1 ora tra le 08:00 e le 18:00, escludendo la pausa pranzo (12:00-14:00).
- Supporto alle festività italiane (Capodanno, Pasqua, Ferragosto, ecc.) con evidenziazione in rosso nell'agenda.
- Indicatori visivi circolari per le ore totali giornaliere e settimanali con colorazione dinamica (grigio/verde/rosso).

### Changed
- Migrazione automatica dei dati: suddivisione del vecchio campo unico "Paziente" in "Nome" e "Cognome".
- Gestione della settimana: ora è possibile eliminare in blocco tutti gli appuntamenti di una settimana specifica.
- Service Worker aggiornato alla versione `v7`.

## [1.0.0] - 2024-05-20

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
