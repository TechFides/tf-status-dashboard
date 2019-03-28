<template>
  <v-app light>
    <v-navigation-drawer
      :mini-variant.sync="miniVariant"
      :clipped="clipped"
      v-model="drawer"
      fixed
      app
    >
      <v-list>
        <v-list-tile
          router
          :to="item.to"
          :key="i"
          v-for="(item, i) in items"
          exact
        >
          <v-list-tile-action>
            <v-icon v-html="item.icon"></v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title v-text="item.title"></v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>
    <v-toolbar fixed app :clipped-left="clipped">
      <v-toolbar-side-icon @click="drawer = !drawer"></v-toolbar-side-icon>
      <v-toolbar-title v-text="title"></v-toolbar-title>
      <v-spacer></v-spacer>
      <login-dialog></login-dialog>
    </v-toolbar>
    <v-content>
      <nuxt/>
    </v-content>
    <v-navigation-drawer
      temporary
      :right="right"
      v-model="rightDrawer"
      fixed
    >
      <v-list>
        <v-list-tile @click.native="right = !right">
          <v-list-tile-action>
            <v-icon light>compare_arrows</v-icon>
          </v-list-tile-action>
          <v-list-tile-title>Switch drawer (click me)</v-list-tile-title>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>
    <v-snackbar
      :value="snackbar.isVisible"
      :color="snackbar.color"
      :multi-line="true"
    >
      {{ snackbar.message }}
      <v-btn
        dark
        flat
        @click="closeNotification"
      >Close</v-btn>
    </v-snackbar>
  </v-app>
</template>

<script>
import LoginDialog from '../components/LoginDialog';
import { mapState, mapMutations } from 'vuex';

export default {
  components: {
    LoginDialog,
  },
  computed: {
    ...mapState([
      'snackbar',
    ]),
    ...mapMutations([
      'clearNotification',
    ]),
    items () {
      const items = [
        {icon: 'apps', title: 'Dashboard', to: '/'},
        {icon: 'radio_button_unchecked', title: 'Standup', to: '/standup'},
        {icon: 'laptop_windows', title: 'Projekty', to: '/projects', availableFor: ['admin']},
        {icon: 'bar_chart', title: 'Statistiky', to: '/statistics', availableFor: ['admin', 'user']},
        {icon: 'face', title: 'Uživatelé', to: '/users', availableFor: ['admin']},
        {icon: 'schedule', title: 'Časy konání sitdownu', to: '/meeting-times', availableFor: ['admin']},
      ];

      return items.filter(item => {
        if (typeof item.availableFor === 'undefined') {
          return true;
        }

        if (this.$auth.user) {
          return this.$auth.user.roles.some(role => item.availableFor.includes(role.slug));
        }

        return false;
      });
    },
  },
  methods: {
    closeNotification () {
      this.$store.commit('clearNotification');
    },
  },
  data () {
    return {
      clipped: true,
      drawer: false,
      fixed: false,
      miniVariant: false,
      right: true,
      rightDrawer: false,
      title: 'From zero to hero!',
    };
  },
};
</script>
