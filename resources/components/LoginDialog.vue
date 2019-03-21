<template>
  <div v-if="$auth.$state.loggedIn">
    Přihlášen jako {{ $auth.user.first_name }} {{ $auth.user.last_name}}
    <v-btn @click="logout">Odhlásit</v-btn>
  </div>
  <v-dialog
    transition="scale-transition"
    v-else
    v-model="isOpen"
    @keydown.enter="login"
    @keydown.esc="close"
    max-width="600px"
  >
    <v-btn slot="activator">Přihlásit</v-btn>
    <v-card ref="form">
      <v-card-title>
        <span class="headline">Přihlásit</span>
      </v-card-title>
      <v-card-text>
        <v-container grid-list-md>
          <v-layout wrap>
            <v-flex xs12>
              <v-text-field
                ref="username"
                autofocus
                v-model="data.username"
                label="Přihlašovací jméno"
                :rules="[rules.usernameRequired]"
              ></v-text-field>
            </v-flex>
            <v-flex xs12>
              <v-text-field
                ref="password"
                v-model="data.password"
                label="Heslo"
                type="password"
                :rules="[rules.passwordRequired]"
                required
              ></v-text-field>
            </v-flex>
          </v-layout>
          <v-alert
            transition="fade-transition"
            :value="error.isVisible"
            type="error"
          >
            {{ error.message }}
          </v-alert>
        </v-container>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" flat @click="close">Zavřít</v-btn>
        <v-btn color="blue darken-1" flat @click="submit">Přihlásit</v-btn>
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
        rules: {
          usernameRequired: value => !!value || 'Username is required',
          passwordRequired: value => !!value || 'Password is required',
        },
        error: {
          isVisible: false,
          message: '',
        },
      };
    },
    methods: {
      async login () {
        try {
          await this.$auth.loginWith('local', {data: this.data});
          this.reset();
        } catch (error) {
          this.error.isVisible = true;
          this.error.message = error.response && error.response.data && error.response.data.message;
        }
      },
      submit () {
        let arrayOfValidationStatuses = [];

        Object.keys(this.data).forEach(field => {
          arrayOfValidationStatuses.push(this.$refs[field].validate(true)); // Will also validate all fields.
        });

        if (!arrayOfValidationStatuses.includes(false)) {
          this.login();
        }
      },
      reset () {
        this.data.username = '';
        this.data.password = '';
        this.error.status = false;
        this.error.message = '';
      },
      close () {
        this.isOpen = false;
        this.reset();
      },
      logout () {
        this.close();
        this.$auth.logout();
      },
    },
  };
</script>

<style scoped>
</style>
