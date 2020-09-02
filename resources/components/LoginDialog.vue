<template>
  <div v-if="$auth.$state.loggedIn">
    Přihlášen jako {{ $auth.user.first_name }} {{ $auth.user.last_name }}
    <v-btn
      class="ml-8"
      @click="logout"
    >
      Odhlásit
    </v-btn>
  </div>
  <v-dialog
    v-else
    v-model="isOpen"
    transition="scale-transition"
    max-width="350px"
    @keydown.enter="login"
    @keydown.esc="close"
  >
    <template v-slot:activator="{ on, attrs }">
      <v-btn
        v-bind="attrs"
        v-on="on"
      >
        Přihlásit
      </v-btn>
    </template>
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
                v-model="data.username"
                autofocus
                label="Přihlašovací jméno"
              />
            </v-flex>
            <v-flex xs12>
              <v-text-field
                ref="password"
                v-model="data.password"
                label="Heslo"
                type="password"
                required
              />
            </v-flex>
            <v-flex xs12>
              <div>
                Přihlásit se přes
              </div>
              <v-btn
                href="/auth/google"
                class="google-button"
                color="light-blue lighten-1"
              >
                <v-icon
                  left
                >
                  mdi-google
                </v-icon> Google
              </v-btn>
            </v-flex>
          </v-layout>
          <v-alert
            transition="fade-transition"
            :value="error.isVisible"
            type="error"
            color="red darken-2"
          >
            {{ error.message }}
          </v-alert>
        </v-container>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn
          color="blue darken-1"
          text
          @click="close"
        >
          Zavřít
        </v-btn>
        <v-btn
          color="blue darken-1"
          text
          @click="submit"
        >
          Přihlásit
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
  export default {
    name: 'LoginDialog',
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
  .google-button {
    margin: 0.5rem 0 0 0;
    width: 100%;
    min-height: 45px;
    color: white;
  }

</style>
