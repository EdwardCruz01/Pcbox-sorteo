import { defineConfig } from "vite";

export default defineConfig({
  // GitHub Pages sirve el proyecto bajo /Pcbox-sorteo/; Vercel y el servidor
  // local lo sirven desde la raíz del dominio.
  base: process.env.GITHUB_ACTIONS ? "/Pcbox-sorteo/" : "/",
  server: { host: "127.0.0.1", port: 8080, strictPort: true },
  preview: { host: "127.0.0.1", port: 4173, strictPort: true },
  build: { outDir: "dist", emptyOutDir: true },
});
