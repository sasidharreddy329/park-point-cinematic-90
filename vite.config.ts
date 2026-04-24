import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// Public Supabase credentials (anon key + URL are safe to ship in client bundles).
// These act as fallbacks so the app works on any host (GitHub Pages, Render, Vercel, Netlify…)
// even when the host doesn't inject VITE_* env vars at build time.
const FALLBACK_SUPABASE_URL = "https://zzadgoiwtgnxnlkjynol.supabase.co";
const FALLBACK_SUPABASE_PUBLISHABLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6YWRnb2l3dGdueG5sa2p5bm9sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyNDg5NTEsImV4cCI6MjA5MTgyNDk1MX0.zLAcMurGiNuEZBuylol2dlT5OR8Co6I_WdNLdrckVO8";
const FALLBACK_SUPABASE_PROJECT_ID = "zzadgoiwtgnxnlkjynol";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  const SUPABASE_URL = env.VITE_SUPABASE_URL || FALLBACK_SUPABASE_URL;
  const SUPABASE_PUBLISHABLE_KEY =
    env.VITE_SUPABASE_PUBLISHABLE_KEY || FALLBACK_SUPABASE_PUBLISHABLE_KEY;
  const SUPABASE_PROJECT_ID =
    env.VITE_SUPABASE_PROJECT_ID || FALLBACK_SUPABASE_PROJECT_ID;
  const previewPort = Number(process.env.PORT || env.PORT || 4173);

  // Base path resolution:
  // - GitHub Pages project sites are served from /<repo-name>/, so we need a matching base.
  // - Set VITE_BASE_PATH (e.g. "/park-point-cinematic-90/") in your GitHub Actions build step,
  //   OR rely on the auto-detected GITHUB_REPOSITORY env var that Actions sets for free.
  // - Render / Netlify / Vercel / Lovable serve from the root, so base stays "/".
  let base = env.VITE_BASE_PATH || "/";
  if (!env.VITE_BASE_PATH && process.env.GITHUB_ACTIONS && process.env.GITHUB_REPOSITORY) {
    const repo = process.env.GITHUB_REPOSITORY.split("/")[1];
    // user.github.io repos are served from root; project repos from /<repo>/.
    if (repo && !repo.endsWith(".github.io")) {
      base = `/${repo}/`;
    }
  }

  return {
    base,
    server: {
      host: "::",
      port: 8080,
      allowedHosts: true,
      hmr: {
        overlay: false,
      },
    },
    preview: {
      host: "::",
      port: previewPort,
      allowedHosts: true,
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
      dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
    },
    define: {
      // Inline env values so the production bundle never reads from a missing process.env.
      "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(SUPABASE_URL),
      "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY": JSON.stringify(SUPABASE_PUBLISHABLE_KEY),
      "import.meta.env.VITE_SUPABASE_PROJECT_ID": JSON.stringify(SUPABASE_PROJECT_ID),
    },
  };
});
