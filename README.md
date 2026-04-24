# Vendégforgalmi előrejelző rendszer

Mockup demo dashboard szálláshelyek és fürdők vendégforgalmának előrejelzéséhez. React + Vite + Recharts + Google Maps JavaScript API.

## Funkciók

- **Szálláshely előrejelzés** — 10 balatoni település, interaktív Google Maps térkép, KPI kártyák, heti chart YoY összehasonlítással, napi naptár, vendégösszetétel
- **Szálláshely kategóriák** — 9 kategória (Panzió, Magán/egyéb, Hotel 1★–5★, Kemping, Közösségi szálláshely) 5 metrikán keresztül (ADR, RevPAR, Vendég, Vendégéjszaka, Átl. szálláshelyi költés)
- **Fürdők előrejelzés** — top 15 magyar fürdő, jegyértékesítés és kiegészítő szolgáltatások forecast, fürdőkörnyéki városok, top 5 küldőpiac YoY növekedéssel

## Lokális futtatás

```bash
npm install
npm run dev
```

Megnyílik: `http://localhost:5173`

## Google Maps API kulcs

A térkép működéséhez Google Maps JavaScript API kulcs kell. A `src/BalatonDashboard.jsx` fájl tetején cseréld le:

```js
const GOOGLE_MAPS_API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY_HERE';
```

> **Figyelem:** soha ne commit-old a valós API kulcsodat publikus repóba. A Google Cloud Console-ban mindig állíts be HTTP referrer restriction-t (pl. `https://<felhasznalonev>.github.io/*`), hogy más ne tudja használni.

## Telepítés GitHub Pages-re

1. **Repo neve:** módosítsd a `vite.config.js`-ben a `base` mezőt a tényleges repo nevedre:
   ```js
   base: '/<repo-neved>/',
   ```

2. **Build + deploy:**
   ```bash
   npm run build
   npm run deploy
   ```
   A `gh-pages` csomag automatikusan a `gh-pages` branch-re tolja a `dist/` tartalmát.

3. **GitHub repo beállítások:** Settings → Pages → Source: `Deploy from a branch` → branch: `gh-pages` / `(root)` → Save.

4. **Élesítés után** add hozzá az új URL-t (pl. `https://botondboros.github.io/forecast-dashboard/*`) a Google Maps API kulcs HTTP referrer restriction-jéhez.

Pár perc múlva elérhető: `https://<felhasznalonev>.github.io/<repo-neved>/`

## Tech stack

- React 18, Vite 5
- Recharts 2 (charts)
- Lucide React (icons)
- Google Maps JavaScript API

## Adatok

Minden megjelenített szám placeholder. A valódi rendszer a következő forrásokat használná: NTAK (Nemzeti Turisztikai Adatszolgáltató Központ), OMSZ (időjárás), MNB (devizaárfolyam), helyi fürdő POS-rendszerek (jegyértékesítés és kiegészítő szolgáltatások).
