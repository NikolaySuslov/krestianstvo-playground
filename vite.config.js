import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import { DOMElements, SVGElements } from "solid-js/web/dist/dev.cjs";
import Unocss from 'unocss/vite'
import { presetUno, presetAttributify } from 'unocss'
import mdx from '@mdx-js/rollup';
import remarkGfm from 'remark-gfm';

////DEV MODE
//import path from 'path'
////

export default defineConfig(({
  ////DEV MODE
  // resolve: {
  //   alias: {
  //     'krestianstvo': path.resolve(__dirname, './node_modules/krestianstvo/src/index.js'),
  //   }
  // },
  ///
  // server: {
  //   fs: {
  //     // Allow serving files from one level up to the project root
  //     allow: ['/'],
  //   }
  //   },
  plugins: [
    mdx({ jsxImportSource: 'solid-jsx', remarkPlugins: [remarkGfm] }),
    solidPlugin(
      {
        //ssr: false,
        solid: {
          moduleName: "solid-js/web",
          generate: "dynamic",
          renderers: [
            {
              name: "dom",
              moduleName: "solid-js/web",
              elements: [...DOMElements.values(), ...SVGElements.values()]
            },
            {
              name: "universal",
              moduleName: "@krestianstvo/solid-three",
              elements: []
            }
          ]
        }
      }

    ),
    Unocss({
      presets: [
        presetAttributify({ /* preset options */ }),
        presetUno()
      ]
    })],
  build: {
      target: 'esnext',
      polyfillDynamicImport: false,
      ssr: false,
      rollupOptions: {
        //plugins: [ includePaths(includePathOptions) ],
        manualChunks: {
          "@dimforge/rapier3d-compat": ['@dimforge/rapier3d-compat'],
          "three":["three"],
          "krestianstvo":["krestianstvo"]
        }
      }
    }
}));
