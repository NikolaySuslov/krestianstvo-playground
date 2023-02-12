import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import { DOMElements, SVGElements } from "solid-js/web/dist/dev.cjs";
import Unocss from 'unocss/vite'
import { presetUno, presetAttributify } from 'unocss'


////DEV MODE
import devtools from '@solid-devtools/transform'
//import path from 'path'
////

export default defineConfig(({
  ////DEV MODE
  // resolve: {
  //   alias: {
  //     //'krestianstvo': path.resolve(__dirname, '../krestianstvo-github/src/index.js'),
  //     //'@krestianstvo/solid-three': path.resolve(__dirname, '../solid-three-git/dist/index.mjs')
  //   }
  // },
  //
  // server: {
  //   fs: {
  //     // Allow serving files from one level up to the project root
  //     allow: ['/'],
  //   }
  //   },
  optimizeDeps: {
    // Add both @codemirror/state and @codemirror/view to included deps to optimize
    include: ['@codemirror/state', '@codemirror/view'],
  },
  plugins: [
    {
      ...(await import("@mdx-js/rollup")).default({
        jsxImportSource: "solid-js",
        jsx: true,
        providerImportSource: "solid-mdx"
      }),
      enforce: "pre"
    },
    ////DEV MODE
    devtools({
      name: true,
    }),
    ////
    solidPlugin(
      {
        //ssr: false,
        extensions: [".md", [".mdx", { typescript: true }]],
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
          "krestianstvo":["krestianstvo"],
          "@codemirror/state": ['@codemirror/state'],
          "@codemirror/view": ['@codemirror/view'],
          "solid-codemirror": ["solid-codemirror"]
        }
      }
    }
}));
