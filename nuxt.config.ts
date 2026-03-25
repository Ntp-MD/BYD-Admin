export default defineNuxtConfig({
  devtools: { enabled: true },
  css: ['~/assets/styles/main.css'],
  vite: {
    server: {
      watch: {
        usePolling: false,
      },
      hmr: {
        overlay: true,
      },
      fs: {
        strict: false,
      },
    },
    build: {
      rollupOptions: {
        onwarn(warning, warn) {
          // Suppress certain warnings that might cause IPC issues
          if (warning.code === 'MODULE_LEVEL_DIRECTIVE') return;
          if (warning.message.includes('IPC connection')) return;
          warn(warning);
        },
      },
    },
  },
  app: {
    head: {
      title: 'BYD Admin Dashboard',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
      link: [
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
        },
      ],
    },
  },
  compatibilityDate: '2024-11-01',
})
