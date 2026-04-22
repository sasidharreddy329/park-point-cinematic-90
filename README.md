# Park Point 🚗

A premium parking discovery & booking platform built with React, Vite, Tailwind, and Lovable Cloud (Supabase).

## 🚀 Local development

```bash
npm install
npm run dev
```

The app runs on [http://localhost:8080](http://localhost:8080).

## 📦 Production build

```bash
npm run build
npm run preview
```

The static site is emitted to `dist/`.

---

## ☁️ Deploying anywhere (GitHub Pages, Render, Netlify, Vercel)

The Supabase publishable (anon) key and URL are **safe to ship in client bundles** and are inlined into the build via `vite.config.ts`. You do **not** need to configure any environment variables on the host — the app will connect to the Lovable Cloud backend out of the box.

> If you ever rotate your Supabase project, update the `FALLBACK_*` constants at the top of `vite.config.ts` (or set `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY` as build-time env vars on your host).

### Render (recommended — zero config)

1. Push this repo to GitHub.
2. On [render.com](https://render.com): **New → Static Site → connect your repo**.
3. Render auto-detects `render.yaml`. Click **Create Static Site**.
4. Done. Render will run `npm install && npm run build` and serve `dist/` with SPA routing.

### Netlify

1. Push to GitHub.
2. On Netlify: **Add new site → Import from Git → pick the repo**.
3. `netlify.toml` configures the build (`npm run build` → `dist`) and SPA redirects automatically.

### Vercel

1. Push to GitHub.
2. On Vercel: **New Project → Import** the repo. `vercel.json` handles the rest.

### GitHub Pages

1. Push this repo to GitHub.
2. Repo **Settings → Pages → Source: GitHub Actions**.
3. The workflow at `.github/workflows/deploy.yml` builds and publishes on every push to `main`.
4. SPA deep-link refresh works thanks to `public/404.html` + the redirect script in `index.html`.

> If you deploy to a project subpath like `https://<user>.github.io/<repo>/`, the relative `base: "./"` in `vite.config.ts` keeps assets working without further changes.

---

## 🔒 What's safe to commit?

- ✅ The Supabase **anon/publishable key** and project URL — these are public by design and protected by Row-Level Security.
- ❌ Never commit a Supabase **service role key** or any private API secret.

## 🛠 Built with

- React 18 + Vite 5 + TypeScript
- Tailwind CSS + shadcn/ui
- Lovable Cloud (Supabase) — auth, database, storage
- Framer Motion, Three.js, Leaflet
