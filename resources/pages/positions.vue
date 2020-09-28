<template>
  <div width="100%" class="fill-height">
    <v-row justify="end">
      <v-btn
        color="blue darken-2"
        :dark="!loading"
        class="mt-2 mr-5 mb-2"
        :loading="loading"
        :disabled="loading"
        @click="positionSynchronization()"
      >
        <v-icon class="mr-2"> mdi-autorenew </v-icon>
        Synchronizace pozic
      </v-btn>
    </v-row>
    <v-card class="elevation-1">
      <v-data-table
        :headers="headers"
        :items="positions.items"
        :items-per-page="100"
        :footer-props="{ 'items-per-page-options': [20, 50, 100, -1] }"
        item-key="id"
        fill-height
        single-expand
        must-sort
        class="elevation-1 fullscreen"
      >
        <template v-slot:item="{ item }">
          <tr>
            <td class="text-left element pr-8">
              {{ item.name }}
            </td>
            <td class="text-left element">
              <div v-if="item.permissions.length" class="cost-category-wrapper">
                <div
                  v-for="n in item.permissions.length < chipsNumber ? item.permissions.length : chipsNumber"
                  :key="item.permissions[n - 1].id"
                  class="cost-category"
                >
                  {{ item.permissions[n - 1].name }}
                </div>
                <v-tooltip top>
                  <template v-slot:activator="{ on, attrs }">
                    <div v-if="item.permissions.length > chipsNumber" class="cost-category" v-bind="attrs" v-on="on">
                      {{ `+ ${item.permissions.length - chipsNumber} dalších ` }}
                    </div>
                  </template>
                  <span>{{ getRestChipsPermissions(item.permissions) }}</span>
                </v-tooltip>
              </div>
            </td>
            <td class="justify-center align-center layout px-0">
              <v-checkbox :input-value="item.isPlayer" @change="setPlayer(item, !item.isPlayer)" />
            </td>
            <td class="text-left element">
              <div v-if="item.costCategories.length" class="cost-category-wrapper">
                <div
                  v-for="c in item.costCategories.length < chipsNumber ? item.costCategories.length : chipsNumber"
                  :key="item.costCategories[c - 1].id"
                  class="cost-category"
                >
                  {{ positionCostCategories(item.costCategories[c - 1].name) }}
                </div>
                <v-tooltip top>
                  <template v-slot:activator="{ on, attrs }">
                    <div v-if="item.costCategories.length > chipsNumber" class="cost-category" v-bind="attrs" v-on="on">
                      {{ `+ ${item.costCategories.length - chipsNumber} dalších ` }}
                    </div>
                  </template>
                  <span>{{ getRestChipsCostCategories(item.costCategories) }}</span>
                </v-tooltip>
              </div>
            </td>
            <td class="justify-center align-center layout px-0">
              <v-checkbox :input-value="item.sendFeeback" @change="setFeedback(item, !item.sendFeeback)" />
            </td>
            <td>
              <v-icon small class="ml-3" @click.stop="addPermissions(item)"> edit </v-icon>
            </td>
          </tr>
        </template>
      </v-data-table>
      <AddPermissionDialog ref="refAddPermissionDialog" />
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
  data() {
    return {
      loading: false,
      chipsNumber: 5,
    };
  },
  computed: {
    ...mapState(['positions']),
    headers: function () {
      return [
        {
          text: 'Název pozice',
          align: 'left',
          sortable: false,
          value: 'name',
        },
        {
          text: 'Oprávnění',
          align: 'left',
          sortable: false,
          value: 'permissions',
        },
        {
          text: 'Hráč',
          align: 'center',
          sortable: false,
          value: 'isPlayer',
        },
        {
          text: 'Work Kategorie',
          align: 'left',
          sortable: false,
          value: 'costCategories',
        },
        {
          text: 'Posílat feedback',
          align: 'center',
          sortable: false,
          value: 'sendFeedback',
        },
        {
          text: 'Akce',
          align: 'center',
          sortable: false,
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
    getRestChipsPermissions(permissions) {
      return permissions
        .slice(this.chipsNumber, permissions.length)
        .map(p => p.name)
        .join(', ');
    },
    getRestChipsCostCategories(costCategories) {
      return costCategories
        .slice(this.chipsNumber, costCategories.length)
        .map(p => this.positionCostCategories(p.name))
        .join(', ');
    },
    addPermissions(item) {
      this.$refs.refAddPermissionDialog.openDialog(item);
    },
    async positionSynchronization() {
      this.loading = true;
      await this.$store.dispatch('positions/positionSynchronizations');
      this.loading = false;
    },
    positionCostCategories(costCategory) {
      return costCategory.substring(costCategory.lastIndexOf('>') + 2, costCategory.length);
    },
    async setFeedback(item, sendFeedback) {
      const position = {
        id: item.id,
        sendFeedback,
      };

      await this.$store.dispatch('positions/setFeedback', position);
    },
    async setPlayer(item, isPlayer) {
      const position = {
        id: item.id,
        isPlayer,
      };

      await this.$store.dispatch('positions/setPlayer', position);
    },
  },
};
</script>

<style scoped>
.checkbox {
  display: flex;
}

.cost-category-wrapper {
  display: flex;
}

.cost-category {
  background-color: #e0e0e0;
  padding: 0.3rem 0.5rem;
  margin-right: 0.5rem;
  border-radius: 16px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
