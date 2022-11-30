import { defineConfig } from "vitest/config";
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    transformMode: {
      web: [/.[tj]sx$/],
    },
    alias:{
      "@dnd-kit-vue/core": "/packages/core/src/",
      "@dnd-kit-vue/modifiers": "/packages/modifiers/src/",
      "@dnd-kit-vue/sortable": "/packages/sortable/src/",
      "@dnd-kit-vue/utilities": "/packages/utilities/src/",
      "@dnd-kit-vue/accessibility": "/packages/accessibility/src/",
    }

  },

});
