<template>
  <div
    width="100%"
    class="fill-height"
  >
    <v-row justify="end">
      <v-btn
        color="blue darken-2"
        :dark="!loading"
        class="mt-2 mr-5 mb-2"
        :loading="loading"
        :disabled="loading"
        @click="positionSynchronization()"
      >
        <v-icon class="mr-2">
          mdi-autorenew
        </v-icon>
        Synchronizace pozic
      </v-btn>
    </v-row>
    <v-card class="elevation-1">
      <v-data-table
        :headers="headers"
        :items="positions.items"
        :items-per-page="100"
        :footer-props="{'items-per-page-options': [20, 50, 100, -1]}"
        item-key="id"
        fill-height
        single-expand
        must-sort
        class="elevation-1 fullscreen"
      >
        <template
          v-slot:item="{item}"
        >
          <tr>
            <td
              class="text-left element pr-8"
            >
              {{ item.name }}
            </td>
            <td class="text-left element">
              {{ positionPermissions(item) }}
            </td>
            <td class="text-left element">
              {{ positionCostCategories(item) }}
            </td>
            <td class="justify-center layout px-0">
              <v-icon
                small
                @click.stop="addPermissions(item)"
              >
                edit
              </v-icon>
            </td>
          </tr>
        </template>
      </v-data-table>
      <AddPermissionDialog
        ref="refAddPermissionDialog"
      />
    </v-card>
  </div>
</template>

<script>
  import { mapState } from 'vuex';
  import AddPermissionDialog from '../components/position/dialogs/AddPermissionDialog';

  export default {
    name: 'Posiction',
    components: {
      AddPermissionDialog,
    },
    data () {
      return {
        loading: false,
      };
    },
    computed: {
      ...mapState([
        'positions',
      ]),
      headers: function () {
        return [
          {
            text: 'Název pozice',
            align: 'left',
            sortable: true,
            value: 'name',
          },
          {
            text: 'Oprávnění',
            align: 'left',
            sortable: true,
            value: 'permissions',
          },
          {
            text: 'Kategorie',
            align: 'left',
            sortable: true,
            value: 'costCategories',
          },
          {
            text: 'Akce',
            align: 'center',
            sortable: true,
            value: 'action',
          },
        ];
      },
    },
    async created() {
      await this.$store.dispatch('positions/getPositions');
      await this.$store.dispatch('permissions/getPermissions');
    },
    methods: {
      addPermissions (item) {
        this.$refs.refAddPermissionDialog.openDialog(item);
      },
      async positionSynchronization () {
        this.loading = true;
        await this.$store.dispatch('positions/positionSynchronizations');
        this.loading = false;
      },
      positionPermissions (position) {
        return position.permissions ? position.permissions
          .map(p => p.name)
          .join(', ') : '';
      },
      positionCostCategories (position) {
        return position.costCategories ? position.costCategories
          .map(p => p.name)
          .join(', ') : '';
      },
    },
  };
</script>

<style scoped>
  .time-spent-sum {
    font-weight: bold;
    font-size: 1.3rem;
  }
</style>
