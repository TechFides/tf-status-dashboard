'use strict';

const resolve = require('path').resolve;

module.exports = {
  /*
   ** Headers of the page
   */
  head: {
    title: 'TF-Hub',
    htmlAttrs: {
      lang: 'cs',
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 'TechFides Dashboard' },
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700|Material+Icons' },
    ],
  },
  plugins: ['~/plugins/auth-inject.js', '~/plugins/auth.js'],
  modules: ['@nuxtjs/axios', '@nuxtjs/auth', '@nuxtjs/vuetify', '@nuxtjs/device'],
  auth: {
    redirect: {
      login: false,
      logout: '/',
      callback: false,
      home: false,
    },
    strategies: {
      local: {
        endpoints: {
          login: { url: '/api/auth/login', method: 'post', propertyName: 'newToken' },
          logout: { url: '/api/auth/logout', method: 'post' },
          user: { url: '/api/auth/me', method: 'get', propertyName: 'data' },
        },
      },
    },
  },
  css: ['~/assets/style/variables.scss'],
  router: {
    middleware: 'authenticated',
  },
  /*
   ** Customize the progress bar color
   */
  loading: { color: '#3B8070' },
  /*
   ** Build configuration
   */
  build: {
    vendor: ['axios'],
    extractCSS: true,
    /*
     ** Run ESLint on save
     */
    extend(config, ctx) {
      if (ctx.isDev && ctx.isClient) {
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          exclude: /(node_modules)/,
        });
      }
    },
  },
  srcDir: resolve(__dirname, '..', 'resources'),
};
