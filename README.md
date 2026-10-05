[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/VzyEqkSI)
# Exam #N: "My Highlights"
## Student: s334017 Incardona Vincenzo 

## React Client Application Routes

- Route `/`: Pagina principale (Home). Visualizza la lista dei riepiloghi pubblici accessibili a tutti gli utenti (anche non loggati).
- Route `/login`: Pagina di login. Permette l'accesso agli utenti registrati; se l'utente è già autenticato, reindirizza alla Home.
- Route `/my-summaries`: Dashboard personale (protetta). Mostra la lista dei riepiloghi creati dall'utente loggato, con opzioni per modificarli o eliminarli.
- Route `/view/:id`: Visualizzatore "Player" (pubblico). Mostra lo slideshow a tutto schermo delle pagine di un riepilogo specifico. Parametro `id`: identificativo del riepilogo.
- Route `/create`: Editor (protetto) in modalità creazione. Permette di configurare un nuovo riepilogo scegliendo titolo, tema e template.
- Route `/edit/:id`: Editor (protetto) in modalità modifica. Carica i dati di un riepilogo esistente permettendo all'autore di aggiornare titolo, visibilità e pagine. Parametro `id`: identificativo del riepilogo.
- Route `/copy/:id`: Editor (protetto) in modalità copia. Carica i dati di un riepilogo esistente per crearne una nuova versione salvandola come nuovo riepilogo. Parametro `id`: identificativo del riepilogo originale.
- Route `*`: Default route. Gestisce tutte le URL non esistenti reindirizzando automaticamente l'utente alla Home Page (`/`).

## API Server

- POST `/api/sessions`
  - **request parameters and request body content**: Oggetto JSON `{ username, password }`.
  - **response body content**: Oggetto JSON dell'utente autenticato `{ id, username }` in caso di successo, altrimenti errore 401.

- GET `/api/sessions/current`
  - **request parameters**: Nessuno.
  - **response body content**: Oggetto JSON dell'utente corrente `{ id, username }` se autenticato, altrimenti errore 401.

- DELETE `/api/sessions/current`
  - **request parameters**: Nessuno.
  - **response body content**: Nessuno (200 OK). Esegue il logout, distrugge la sessione e cancella il cookie.

- GET `/api/summaries`
  - **request parameters**: Nessuno.
  - **response body content**: Array JSON contenente la lista di tutti i riepiloghi pubblici.

- GET `/api/summaries/my`
  - **request parameters**: Nessuno (richiede autenticazione).
  - **response body content**: Array JSON contenente la lista dei riepiloghi creati dall'utente loggato.

- GET `/api/summaries/:id`
  - **request parameters:** `id` (identificativo del riepilogo).
  - **response body content:** Oggetto JSON contenente i metadati del riepilogo (titolo, autore, tema) e un array `pages` con il contenuto delle pagine.
    - Se il riepilogo è **pubblico**, restituisce i dati a chiunque.
    - Se il riepilogo è **privato**, restituisce i dati **solo** se l'utente richiedente è autenticato ed è il proprietario del riepilogo; altrimenti restituisce errore `401 Unauthorized`.

- GET `/api/player/:id`
  - **request parameters**: `id` (ID del riepilogo).
  - **response body content**: Dati del riepilogo formattati per la visualizzazione nel componente Player.

- GET `/api/themes`
  - **request parameters**: Nessuno.
  - **response body content**: Array JSON contenente tutti i temi disponibili `{ id, name }`.

- GET `/api/themes/:id/templates`
  - **request parameters**: `id` (ID del tema).
  - **response body content**: Array JSON dei template disponibili per quel tema specifico.

- GET `/api/backgrounds/:themeId`
  - **request parameters**: `themeId` (ID del tema).
  - **response body content**: Array JSON degli sfondi associati al tema `{ id, path, num_fields }`.

- GET `/api/templates`
  - **request parameters**: Nessuno.
  - **response body content**: Array JSON contenente la lista di tutti i template presenti nel sistema.

- GET `/api/templates/:id`
  - **request parameters**: `id` (ID del template).
  - **response body content**: Array JSON contenente le pagine predefinite (sfondi e testi default) di quel template.

- POST `/api/summaries`
  - **request parameters and request body content**: Oggetto JSON `{ title, themeId, visibility, originalAuthor, originalTitle, pages: [...] }`.
  - **response body content**: Oggetto JSON `{ id: Id }` il nuovo id del nuovo riepilogo creato.

- PUT `/api/summaries/:id`
  - **request parameters**: `id` (ID del riepilogo). Request body: `{ title, visibility, pages: [...] }`.
  - **response body content**: Oggetto JSON `{ message: 'Aggiornato con successo' }`.

- DELETE `/api/summaries/:id`
  - **request parameters**: `id` (ID del riepilogo).
  - **response body content**: Nessuno (204 No Content) se l'eliminazione ha successo.

### Tabelle del Database
Ecco lo schema del database SQLite utilizzato:

- **users**
  Memorizza le credenziali degli utenti ('id', 'username') e i dati per la sicurezza (hash della password e salt).

- **themes**
  Contiene l''id' e le categorie principali dei riepiloghi  Cibo e  Film (passati come 'name').

- **backgrounds**
  Contiene l''id' e 'theme_id'(chiave esterna) e contiene 'path' per i riferimenti alle immagini di sfondo disponibili per ogni tema e definisce quanti campi di testo (1, 2 o 3, 'num_fields') ogni immagine supporta.

- **templates**
  Definisce i "modelli di default" che un utente può scegliere per pre-compilare un riepilogo (es. "Film da Oscar"). Hanno un 'id' e 'theme_id' come chiave esterna. 'title' e 'description'.

- **template_pages**
  Contiene la struttura (pagine, sfondi e testi di default ('default_text_x')) associata a ogni template. Infatti ha come chiave esterna sia il 'background_id' che il 'template_id'. Contiene 'id' e anche un 'page_order' per l'ordinamento. 

- **summaries**
  Tabella principale che memorizza i riepiloghi creati dagli utenti ('title','visibility', 'creation_date') e anche 'original_author' per lasciare il riferimento in caso di copia di un riepilogo esistente.Contien 'id' e ha come chiavi esterne lo 'user_id' e 'theme_id'.

- **pages**
  Contiene il contenuto effettivo di ogni riepilogo utente: riferimento allo sfondo scelto, testi inseriti ('text_context_x') e ordine della pagina ('page_order'). COntiene 'id' e ha chiavi esterne 'background_id' e 'summary_id'

## Main React Components

- **`App` & `MyNavbar`**
  Il componente root (`App`) configura il routing e gestisce lo stato globale di autenticazione. Include la logica di navigazione (`MyNavbar`) per gestire i link elo stato di login/logout.

- **`Home` (`Main`)**
  Homepage che mostra la galleria dei riepiloghi pubblici. Adatta l'interfaccia in base allo stato dell'utente:
  - **Utente Ospite:** Può esclusivamente guardare i riepiloghi pubblici in slideshow(*Player*).
  - **Utente Loggato:** Oltre a visualizzare, ha accesso al pulsante "Copia" su ogni card, che permette di creare un nuovo riepilogo basato su quel contenuto..

- **`LoginForm`**
  Modulo di autenticazione che gestisce la validazione delle credenziali e comunica con l'API di sessione per effettuare il login dell'utente.

- **`MySummaries`**
  Dashboard privata dell'utente. Visualizza la lista dei propri riepiloghi e gestisce le operazioni di gestione diretta come l'eliminazione e il reindirizzamento alla modifica, indirizzando il routing verso l'Editor con i corretti parametri (ID e modalità).

- **`Editor`**
  Componente principale che adatta il proprio comportamento (inizializzazione e salvataggio) in base alla prop `mode` ('create', 'edit', 'copy').
  - **Create:** Inizializza un form vuoto o basato su un template. Esegue una `POST`.
  - **Edit:** Pre-carica i dati esistenti via API. Esegue una `PUT` per aggiornare lo stesso ID.
  - **Copy:** Pre-carica i dati esistenti ma resetta l'ownership. Esegue una `POST` per creare un nuovo record.

- **`Player`**
  Visualizzatore in modalità "sola lettura". Recupera i dati di un riepilogo e li presenta attraverso uno slideshow, permettendo la fruizione dei contenuti senza strumenti di modifica.

## Screenshot

### Creazione Riepilogo (Editor)
![Screenshot Editor](./img/Screenshot_create.png)

### Visualizzazione Slideshow (Player)
![Screenshot Player](./img/Screenshot_view.png)

## Users Credentials
  **username**, **password**
- mario rossi,   politecnico
- Vinz,          politecnico
- Incardona,     politecnico
