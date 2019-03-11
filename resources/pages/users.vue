<template>
  <v-layout column justify-center align-end>
    <v-btn @click="createNewUser()" color="primary" dark class="mb-2">
      <i class="material-icons pad"> person_add</i>
      Nový uživatel
    </v-btn>

    <v-dialog v-model="dialog" max-width="500px" transition="scale-transition">
      <v-card>
        <v-card-title>
          <span class="headline">{{ modalTitle }}</span>
        </v-card-title>

        <v-form ref="form">
          <v-card-text>
            <v-container grid-list-md>
              <v-layout wrap column>
                <v-flex xs12 sm6 md4>
                  <v-text-field :rules="[rules.required]" v-model="modalItem.username"
                                label="Přihlašovací jméno"></v-text-field>
                </v-flex>
                <v-flex xs12 sm6 md4>
                  <v-text-field type="password" v-model="modalItem.password"
                                label="Heslo"></v-text-field>
                </v-flex>
                <v-flex xs12 sm6 md4>
                  <v-text-field :rules="[rules.required]" v-model="modalItem.firstName" label="Jméno"></v-text-field>
                </v-flex>
                <v-flex xs12 sm6 md4>
                  <v-text-field :rules="[rules.required]" v-model="modalItem.lastName" label="Příjmení"></v-text-field>
                </v-flex>
                <v-flex xs12 sm6 md4>
                  <v-text-field type="number" v-model="modalItem.totalExp"
                                label="Expy"></v-text-field>
                </v-flex>
                <v-flex xs12 sm6 md4>
                  <v-select
                          label="Role"
                          :items="roleItems"
                          multiple
                          v-model="modalItem.roles">
                  </v-select>
                </v-flex>
                <v-flex xs12 sm6 md4>
                  <v-checkbox
                    label="Aktivní"
                    v-model="modalItem.isActive"
                  ></v-checkbox>
                </v-flex>
              </v-layout>
            </v-container>

            <v-alert
              transition="fade-transition"
              :value="error.isVisible"
              type="error"
            >
              {{ error.message }}
            </v-alert>

          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" flat @click.native="close">Zrušit</v-btn>
            <v-btn color="blue darken-1" flat @click.native="save">Uložit</v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>

    <v-card class='elevation-1 fullscreen'>
      <v-layout align-center justify-end>
        <v-flex xs4>
          <v-card-title>
            <v-text-field v-model="filteringText" append-icon="search" label="Hledej..." single-line hide-details>
            </v-text-field>
          </v-card-title>
        </v-flex>
      </v-layout>

      <v-data-table
        :headers='headers'
        :items='filteredUsers'
        item-key="id"
        hide-actions
        fill-height
        must-sort
        class='elevation-1 fullscreen'
      >
        <template slot='items' slot-scope='props'>
          <td class='text-xs-center element'>{{ getFullName(props.item.firstName, props.item.lastName) }}</td>
          <td class='text-xs-center element'>{{ props.item.username }}</td>
          <td class='text-xs-center element'>{{ userRoles(props.item) }}</td>
          <td class='text-xs-center element'>{{ props.item.level }}</td>
          <td class='text-xs-center element'>{{ props.item.totalExp }}</td>
          <td class='text-xs-center element'>{{ isUserActive(props.item.isActive, false) }}</td>
          <td class="justify-center layout px-0">
            <v-icon
              small
              class="mr-2"
              @click="editItem(props.item)"
            >
              edit
            </v-icon>
            <v-icon
              small
              @click="deleteItem(props.item)"
            >
              delete
            </v-icon>
          </td>

        </template>
      </v-data-table>
    </v-card>
  </v-layout>
</template>

<script>
import { mapState, mapMutations } from 'vuex';

const roleTranslation = {
  user: 'Uživatel',
  admin: 'Administrátor',
};

export default {
  async fetch ({ store, params }) {
    await Promise.all([
      store.dispatch('getUsers'),
      store.dispatch('getRoles'),
    ]);
  },
  computed: {
    ...mapState([
      'users',
      'roles',
      'error',
    ]),
    ...mapMutations([
      'setErrorState',
    ]),
    headers: function () {
      return [
        {
          text: 'Jméno',
          align: 'center',
          sortable: true,
          value: 'firstName',
        },
        {
          text: 'Přihlašovací jméno',
          align: 'center',
          sortable: true,
          value: 'username',
        },
        {
          text: 'Role',
          align: 'center',
          sortable: true,
          value: 'roles',
        },
        {
          text: 'Level',
          align: 'center',
          sortable: true,
          value: 'level',
        },
        {
          text: 'Expy',
          align: 'center',
          sortable: true,
          value: 'totalExp',
        },
        {
          text: 'Aktivní',
          align: 'center',
          sortable: true,
          value: 'isActive',
        },
        {
          text: 'Akce',
          align: 'center',
          sortable: false,
          value: 'actions',
        },
      ];
    },
    filteredUsers () {
      return this.users.filter((element) => {
        const uppercasedFilterText = this.filteringText.toUpperCase();

        return element.username.toUpperCase().match(uppercasedFilterText) ||
          this.getFullName(element.firstName, element.lastName).toUpperCase().match(uppercasedFilterText) ||
          this.isUserActive(element.isActive, true).match(uppercasedFilterText) ||
          this.userRoles(element).toUpperCase().match(uppercasedFilterText) ||
          element.level.toString().match(this.filteringText) ||
          element.totalExp.toString().match(this.filteringText);
      });
    },
    roleItems () {
      return this.roles.map(r => ({
        text: roleTranslation[r.slug],
        value: r.slug,
      }));
    },
  },
  data () {
    return {
      dialog: false,
      modalTitle: '',
      rules: {
        required: value => !!value || 'Povinné.',
      },
      modalItem: {
        id: null,
        firstName: '',
        lastName: '',
        password: '',
        totalExp: 0,
        isActive: true,
        username: '',
        roles: ['user'],
      },
      defaultModalItem: {
        id: null,
        firstName: '',
        lastName: '',
        password: '',
        totalExp: 0,
        isActive: true,
        username: '',
        roles: ['user'],
      },
      filteringText: '',
    };
  },
  methods: {
    isUsernameUnique () {
      const userExist = this.users.find(user => user.username === this.modalItem.username);
      if (userExist) {
        this.$store.commit('setErrorState', {
          isVisible: true,
          field: 'username',
          validation: 'unique',
          message: 'Uživatelské jméno již existuje.',
        });
      }

      return !(userExist);
    },
    createNewUser () {
      this.modalItem = { ...this.defaultModalItem };
      this.modalTitle = 'Nový uživatel';
      this.dialog = true;
    },
    editItem (item) {
      this.modalItem = {
        id: item.id,
        firstName: item.firstName,
        lastName: item.lastName,
        totalExp: item.totalExp,
        isActive: item.isActive === 1,
        username: item.username,
        roles: item.roles,
      };

      this.modalTitle = 'Upravit uživatele';
      this.dialog = true;
    },
    async deleteItem (item) {
      const confirmed = confirm(`Opravdu chcete smazat uživatele ${item.firstName} ${item.lastName}?`);

      if (confirmed) {
        await this.$store.dispatch('deleteUser', item.id);
        await this.$store.dispatch('getUsers');
      }
    },
    close () {
      this.dialog = false;
      this.modalItem = { ...this.defaultModalItem };
      this.$store.commit('clearErrorState');
    },
    async save () {
      const action = this.modalItem.id ? 'editUser' : 'createUser';

      // Known validation only on username (unique value)
      if (this.isUsernameUnique()) {
        await this.$store.dispatch(action, this.modalItem);
        !this.error.isVisible && close();
      }
    },
    isUserActive (isActive, toUpper) {
      const result = isActive ? 'ano' : 'ne';

      return toUpper ? result.toUpperCase() : result.toLowerCase();
    },
    getFullName (firstName, lastName) {
      return `${firstName} ${lastName}`;
    },
    userRoles(user) {
      return this.roles
              .filter(r => user.roles.includes(r.slug))
              .map(r => roleTranslation[r.slug])
              .join(', ');
    },
  },
};
</script>

<style scoped>
.fullscreen {
  width: 100%;
  height: 100%;
}

.element {
  font-size: 1.5em !important;
}

.header {
  font-size: 2em !important;
}

.pad {
  padding-right: 5px;
}
</style>
