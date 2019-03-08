<template>
  <div v-if="$auth.$state.loggedIn">
    Přihlášen jako {{ $auth.user.first_name }} {{ $auth.user.last_name}}
    <v-btn @click="logout">Odhlásit</v-btn>
  </div>
  <v-dialog v-else v-model="isOpen" @keydown.enter="login" @keydown.esc="closeLoginDialog"
            max-width="600px">
    <v-btn slot="activator">Přihlásit</v-btn>
    <v-card>
      <v-card-title>
        <span class="headline">Přihlásit</span>
      </v-card-title>
      <v-card-text>
        <v-container grid-list-md>
          <v-layout wrap>
            <v-flex xs12>
              <v-text-field autofocus v-model="data.username" label="Přihlašovací jméno"
                            required></v-text-field>
            </v-flex>
            <v-flex xs12>
              <v-text-field v-model="data.password" label="Heslo" type="password" required></v-text-field>
            </v-flex>
          </v-layout>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" flat @click="closeLoginDialog">Zavřít</v-btn>
        <v-btn color="blue darken-1" flat @click="login">Přihlásit</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
  export default {
    name: 'login-dialog',
    data () {
      return {
        isOpen: false,
        data: {
          username: '',
          password: '',
        },
      };
    },
    methods: {
      closeLoginDialog () {
        this.isOpen = false;
        this.data = {
          password: '',
          username: '',
        };
      },
      login () {
        this.$auth.loginWith('local', {
          data: {
            username: this.data.username,
            password: this.data.password,
          },
        });
      },
      logout () {
        this.closeLoginDialog();
        this.$auth.logout();
      },
    },
  };
</script>

<style scoped>
</style>
