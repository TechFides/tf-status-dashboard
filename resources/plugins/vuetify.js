import Vue from 'vue';
import Vuetify from 'vuetify';
import 'vuetify/dist/vuetify.min.css';
import '@mdi/font/css/materialdesignicons.css'; // Ensure you are using css-loader version "^2.1.1" ,

import colors from 'vuetify/es5/util/colors';

Vue.use(Vuetify);

export default ctx => {
  const vuetify = new Vuetify({
    theme: {
      light: true, // From 2.0 You have to select the theme dark or light here
      dark: false,
    },
    themes: {
      light: {
        primary: colors.blue.darken4,
      },
    },
  });

  ctx.app.vuetify = vuetify;
  ctx.$vuetify = vuetify.framework;
};
