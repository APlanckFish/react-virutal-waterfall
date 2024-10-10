import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import copyPlugin from "rollup-plugin-copy";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: resolve(__dirname, "src/VirtualWaterfall.tsx"),
      name: "VirtualWaterfall",
      fileName: "index",
    },
    rollupOptions: {
      external: ["react", "react-dom"],
      output: {
        globals: {
          react: "React",
        },
      },
      plugins: [
        copyPlugin({
          targets: [
            { src: "types/index.d.ts", dest: "dist" },
            { src: "types/List.d.ts", dest: "dist" },
            { src: "README.md", dest: "dist" },
          ],
          hook: "closeBundle",
          verbose: true,
        }),
      ],
    },
    terserOptions: {
      compress: {
        drop_console: true,
      },
    },
    minify: "terser",
  },
  assetsInclude: ["!**/*.svg"],
});
