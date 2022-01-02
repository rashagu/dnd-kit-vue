import { defineAsyncComponent } from 'vue'

export const layoutComponents = {
  "404": defineAsyncComponent(() => import("D:/sumw/myKu/ku1/node_modules/@vuepress/theme-default/lib/client/layouts/404.vue")),
  "Layout": defineAsyncComponent(() => import("D:/sumw/myKu/ku1/node_modules/@vuepress/theme-default/lib/client/layouts/Layout.vue")),
}
