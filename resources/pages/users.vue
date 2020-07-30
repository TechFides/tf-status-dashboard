<template>
  <v-layout
    column
    justify-center
    align-end
  >
    <v-btn
      color="blue darken-2"
      dark
      class="mb-2 button"
      @click="createNewUser()"
    >
      <i class="material-icons pad"> person_add</i>
      Nový uživatel
    </v-btn>

    <v-dialog
      v-model="dialog"
      max-width="750px"
      transition="scale-transition"
      :persistent="true"
    >
      <v-card>
        <v-card-title>
          <span class="headline">{{ modalTitle }}</span>
        </v-card-title>

        <v-form ref="form">
          <v-card-text>
            <v-container>
              <v-row>
                <v-col cols="6">
                  <v-text-field
                    v-model="modalItem.username"
                    :rules="[rules.required]"
                    label="Přihlašovací jméno"
                  />
                </v-col>
                <v-col cols="6">
                  <v-text-field
                    v-model="modalItem.password"
                    type="password"
                    label="Heslo"
                  />
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="6">
                  <v-text-field
                    v-model="modalItem.firstName"
                    :rules="[rules.required]"
                    label="Jméno"
                  />
                </v-col>
                <v-col cols="6">
                  <v-text-field
                    v-model="modalItem.lastName"
                    :rules="[rules.required]"
                    label="Příjmení"
                  />
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="6">
                  <v-text-field
                    v-model="modalItem.email"
                    :rules="[rules.required, rules.email]"
                    type="email"
                    label="E-mail"
                  />
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="6">
                  <v-select
                    v-model="modalItem.roles"
                    label="Role"
                    :items="roleItems"
                    multiple
                  />
                </v-col>
                <v-col cols="6">
                  <v-select
                    v-model="modalItem.absenceApproverId"
                    label="Schvalovatel"
                    :rules="[rules.required]"
                    :items="absenceApproverItems"
                  />
                </v-col>
              </v-row>
              <v-row>
                <v-col>
                  <v-checkbox
                    v-model="modalItem.isActive"
                    label="Aktivní"
                  />
                </v-col>
                <v-col>
                  <v-checkbox
                    v-model="modalItem.sendFeedback"
                    label="Posílat feedback"
                  />
                </v-col>
              </v-row>
            </v-container>
            <v-alert
              transition="fade-transition"
              :value="error.isVisible"
              type="error"
              color="red darken-2"
            >
              {{ error.message }}
            </v-alert>
          </v-card-text>

          <v-card-actions>
            <v-spacer />
            <v-btn
              color="blue darken-1"
              text
              @click.native="close"
            >
              Zrušit
            </v-btn>
            <v-btn
              color="blue darken-1"
              text
              @click.native="save"
            >
              Uložit
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>

    <v-card class="elevation-1 fullscreen">
      <v-layout
        align-center
        justify-end
      >
        <v-flex xs4>
          <v-card-title>
            <v-text-field
              v-model="filteringText"
              append-icon="search"
              label="Hledej..."
              single-line
              hide-details
            />
          </v-card-title>
        </v-flex>
      </v-layout>

      <v-data-table
        :headers="headers"
        :items="filteredUsers"
        :items-per-page="999"
        item-key="id"
        hide-default-footer
        fill-height
        must-sort
        class="elevation-1 fullscreen"
      >
        <template
          v-slot:item="props"
        >
          <tr>
            <td class="text-left element">
              {{ getFullName(props.item.firstName, props.item.lastName) }}
            </td>
            <td class="text-left element">
              {{ props.item.username }}
            </td>
            <td class="text-left element">
              {{ props.item.email }}
            </td>
            <td class="text-left element">
              {{ props.item.absenceApprover.fullName }}
            </td>
            <td class="text-left element">
              {{ userRoles(props.item) }}
            </td>
            <td class="text-center element">
              {{ isUserActive(props.item.isActive, false) }}
            </td>
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
          </tr>
        </template>
      </v-data-table>
    </v-card>
  </v-layout>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
import { EMAIL_REGEX } from '../constants';

const roleTranslation = {
  user: 'Uživatel',
  admin: 'Administrátor',
};

export default {
  data () {
    return {
      dialog: false,
      persistent: true,
      modalTitle: '',
      rules: {
        required: value => !!value || 'Povinné.',
        email: value => EMAIL_REGEX.test(value) || 'Neplatný e-mail.',
      },
      modalItem: {
        id: null,
        firstName: '',
        lastName: '',
        password: '',
        isActive: true,
        sendFeedback: true,
        username: '',
        absenceApproverId: null,
        roles: ['user'],
      },
      defaultModalItem: {
        id: null,
        firstName: '',
        lastName: '',
        password: '',
        isActive: true,
        sendFeedback: true,
        username: '',
        absenceApproverId: null,
        roles: ['user'],
      },
      filteringText: '',
    };
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
          align: 'left',
          sortable: true,
          value: 'firstName',
        },
        {
          text: 'Přihlašovací jméno',
          align: 'left',
          sortable: true,
          value: 'username',
        },
        {
          text: 'E-mail',
          align: 'left',
          sortable: true,
          value: 'email',
        },
        {
          text: 'Schvalovatel dovolené',
          align: 'left',
          sortable: true,
          value: 'absenceAprrover',
        },
        {
          text: 'Role',
          align: 'left',
          sortable: true,
          value: 'roles',
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
          this.userRoles(element).toUpperCase().match(uppercasedFilterText);
      });
    },
    roleItems () {
      return this.roles.map(r => ({
        text: roleTranslation[r.slug],
        value: r.slug,
      }));
    },
    absenceApproverItems () {
      return this.users.map(user => ({
        text: `${user.firstName} ${user.lastName}`,
        value: user.id,
      }));
    },
  },
  async fetch ({ store }) {
    await Promise.all([
      store.dispatch('getUsers'),
      store.dispatch('getRoles'),
    ]);
  },
  methods: {
    createNewUser () {
      this.modalItem = { ...this.defaultModalItem };
      this.modalTitle = 'Nový uživatel';
      this.dialog = true;
    },
    editItem (item) {
      this.modalItem = {
        id: item.id,
        email: item.email,
        firstName: item.firstName,
        lastName: item.lastName,
        isActive: item.isActive === 1,
        sendFeedback: item.sendFeedback === 1,
        username: item.username,
        roles: item.roles,
        absenceApproverId: item.absenceApprover.id,
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
      this.$refs.form.resetValidation();
      this.dialog = false;
      this.modalItem = { ...this.defaultModalItem };
      this.$store.commit('clearErrorState');
    },
    async save () {
      const action = this.modalItem.id ? 'editUser' : 'createUser';

      await this.$store.dispatch(action, this.modalItem);
      !this.error.isVisible && this.close();
    },
    isUserActive (isActive, toUpper) {
      const result = isActive ? 'ano' : 'ne';

      return toUpper ? result.toUpperCase() : result.toLowerCase();
    },
    getFullName (firstName, lastName) {
      return `${firstName} ${lastName}`;
    },
    userRoles (user) {
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
  font-size: 1.3em !important;
}

.button {
  margin: 6px 8px;
}

.pad {
  padding-right: 5px;
}
</style>
