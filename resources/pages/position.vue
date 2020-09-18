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
              <div
                v-if="item.permissions.length"
                class="cost-category-wrapper"
              >
                <div
                  v-for="c in item.permissions"
                  :key="c.id"
                  class="cost-category"
                >
                  {{ c.name }}
                </div>
              </div>
            </td>
            <td class="text-left element">
              <div
                v-if="item.costCategories.length"
                class="cost-category-wrapper"
              >
                <div
                  v-for="c in item.costCategories"
                  :key="c.id"
                  class="cost-category"
                >
                  {{ positionCostCategories(c.name) }}
                </div>
              </div>
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
      await this.$store.dispatch('costCategories/costCategoriesSynchronizations');
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
      positionCostCategories (costCategory) {
        return costCategory.substring(costCategory.lastIndexOf(">") + 2, costCategory.length);
      },
    },
  };
</script>

<style scoped>
  .cost-category-wrapper {
    display: flex;
  }

  .cost-category {
    background-color: #e0e0e0;
    padding: 0.3rem 0.5rem;
    margin-right: 0.5rem;
    border-radius: 16px;
  }
</style>
