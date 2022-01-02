import { defineUserConfig } from 'vuepress'
import type { DefaultThemeOptions } from 'vuepress'

export default defineUserConfig<DefaultThemeOptions>({
  lang: 'en-US',
  title: 'Hello VuePress',
  description: 'Just playing around',

  themeConfig: {
    logo: 'https://vuejs.org/images/logo.png',
  },
})
