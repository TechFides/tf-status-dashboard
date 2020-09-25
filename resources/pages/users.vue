<template>
  <v-layout
    column
    justify-center
    align-end
  >
    <v-btn
      color="blue darken-2"
      class="mb-2 button"
      :dark="!loading"
      :loading="loading"
      :disabled="loading"
      @click="userSynchronization()"
    >
      <v-icon class="mr-2">
        mdi-autorenew
      </v-icon>
      Synchronizace uživatelů
    </v-btn>

    <v-card class="elevation-1 fullscreen">
      <v-row
        align="center"
        justify="end"
      >
        <v-col cols="4">
          <v-card-title>
            <v-text-field
              v-model="filteringText"
              append-icon="search"
              label="Hledej..."
              single-line
              hide-details
            />
          </v-card-title>
        </v-col>
      </v-row>

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
        <template v-slot:item="props">
          <tr>
            <td class="text-left element">
              {{ getFullName(props.item.firstName, props.item.lastName) }}
            </td>
            <td class="text-left element">
              {{ props.item.email }}
            </td>
            <td class="text-left element">
              {{ props.item.absenceApprover.fullName }}
            </td>
            <td class="text-left element">
              {{ props.item.position }}
            </td>
            <td class="justify-center align-center layout px-0">
              <v-checkbox
                :input-value="props.item.isAdmin"
                @change="setIsAdmin(props.item, !props.item.isAdmin)"
              />
            </td>
            <td>
              <v-icon
                small
                class="ml-2"
                @click="setApprover(props.item)"
              >
                mdi-account-plus
              </v-icon>
            </td>
          </tr>
        </template>
      </v-data-table>
      <ApproverDialog ref="refApproverDialog" />
    </v-card>
  </v-layout>
</template>

<script>
import { mapState } from 'vuex';
import ApproverDialog from '../components/user/dialogs/ApproverDialog';

export default {
  components: {
    ApproverDialog,
  },
  data() {
    return {
      isAdmin: false,
      filteringText: '',
      loading: false,
    };
  },
  computed: {
    ...mapState(['users', 'errors']),
    headers: function () {
      return [
        {
          text: 'Jméno',
          align: 'left',
          sortable: true,
          value: 'firstName',
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
          text: 'Pozice',
          align: 'left',
          sortable: true,
          value: 'roles',
        },
        {
          text: 'Admin',
          align: 'center',
          sortable: true,
          value: 'isAdmin',
        },
        {
          text: 'Akce',
          align: 'center',
          sortable: true,
          value: 'action',
        },
      ];
    },
    filteredUsers() {
      return this.users.items.filter(element => {
        const uppercasedFilterText = this.filteringText.toUpperCase();

        return (
          this.getFullName(element.firstName, element.lastName).toUpperCase().match(uppercasedFilterText) ||
          this.isUserActive(element.isActive, true).match(uppercasedFilterText) ||
          this.userRoles(element).toUpperCase().match(uppercasedFilterText)
        );
      });
    },
  },
  async fetch({ store }) {
    await Promise.all([store.dispatch('users/getUsers')]);
  },
  methods: {
    async setIsAdmin(item, isAdmin) {
      const user = {
        id: item.id,
        isAdmin,
      };

      await this.$store.dispatch('users/setAdmin', user);
    },
    async setApprover(user) {
      this.$refs.refApproverDialog.openDialog(user);
    },
    async userSynchronization() {
      this.loading = true;
      await this.$store.dispatch('users/usersSynchronizations');
      this.loading = false;
    },
    isUserActive(isActive, toUpper) {
      const result = isActive ? 'ano' : 'ne';

      return toUpper ? result.toUpperCase() : result.toLowerCase();
    },
    getFullName(firstName, lastName) {
      return `${firstName} ${lastName}`;
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
