// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-12-01",

  future: {
    compatibilityVersion: 4,
  },

  // SPA mode — no SSR needed for a private comic reader.
  // Eliminates server/client auth duality (same pattern as TransMule).
  ssr: false,

  experimental: {
    // Disable app manifest to avoid #app-manifest import errors in SPA mode
    appManifest: false,
  },

  components: [
    { path: "~/components", pathPrefix: false },
  ],

  app: {
    head: {
      title: "Sequent — Comic Reader",
      link: [
        {
          rel: "icon",
          type: "image/png",
          href: "/favicon.ico",
        },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap",
        },
      ],
    },
  },

  devServer: {
    port: 3232,
    host: "0.0.0.0",
  },

  nitro: {
    preset: "node-server",
  },

  // In SPA mode, Vite handles the dev server — proxy /api to backend
  // and allow connections from any domain
  vite: {
    server: {
      allowedHosts: true,
      proxy: {
        "/api": {
          target: "http://localhost:3233",
          changeOrigin: true,
        },
      },
    },
  },

  typescript: {
    strict: true,
  },

  devtools: { enabled: true },
});
