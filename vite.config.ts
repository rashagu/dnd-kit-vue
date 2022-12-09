import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(),vueJsx()],
  resolve:{
    alias:{
      "@dnd-kit-vue/core": "/packages/core/src/",
      "@dnd-kit-vue/modifiers": "/packages/modifiers/src/",
      "@dnd-kit-vue/sortable": "/packages/sortable/src/",
      "@dnd-kit-vue/utilities": "/packages/utilities/src/",
      "@dnd-kit-vue/accessibility": "/packages/accessibility/src/",
    }
  }
})
