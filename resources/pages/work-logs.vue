<template>
  <div
    width="100%"
    class="fill-height"
  >
    <v-row justify="end">
      <v-btn
        color="blue darken-2"
        dark
        class="mt-2 mr-5 mb-2"
        @click="createNewWorkLog()"
      >
        <i class="material-icons">add</i>
        <span class="pl-2">
          Zalogovat čas
        </span>
      </v-btn>
    </v-row>
    <CreateWorkLogDialog
      ref="createWorkLogDialog"
    />
    <v-card class="elevation-1">
      <v-row
        justify="start"
      >
        <v-col
          cols="2"
          class="ml-5"
        >
          <v-select
            v-model="filter.authorId"
            :items="authorItems"
            label="Autor"
            clearable
          />
        </v-col>
        <v-col cols="2">
          <v-select
            v-model="filter.costCategoryId"
            :items="costCategoryItems"
            label="Kategorie"
            clearable
          />
        </v-col>
      </v-row>
      <v-data-table
        :headers="headers"
        :items="workLogs"
        :items-per-page="10"
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
            <td class="text-left element pr-8">
              {{ item.author.fullName }}
            </td>
            <td class="text-right element pr-8">
              {{ item.started }}
            </td>
            <td class="text-right element pr-8">
              {{ item.timeSpent }}
            </td>
            <td class="text-left element">
              {{ item.description }}
            </td>
            <td class="text-left element">
              {{ item.costCategoryId }}
            </td>
            <td class="justify-center layout px-0">
              <v-icon
                small
                @click.stop="editItem(item)"
              >
                edit
              </v-icon>
              <v-icon
                small
                class="ml-2"
                @click.stop="deleteItem(item)"
              >
                delete
              </v-icon>
            </td>
          </tr>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<script>
  import { mapState } from 'vuex';
  import CreateWorkLogDialog from '../components/workLogs/dialogs/CreateWorkLogDialog';
  import moment from 'moment';

  export default {
    name: 'WorkLogs',
    components: {
      CreateWorkLogDialog,
    },
    data () {
      return {
        filter: {
          authorId: '',
          costCategoryId: '',
          startDate: '',
          endDate: '',
        },
        expandedRowId: null,
      };
    },
    computed: {
      ...mapState([
        'workLogs',
        'error',
        'users',
        'costCategories',
      ]),
      headers () {
        return [
          {
            text: 'Autor',
            align: 'left',
            sortable: true,
            value: 'author',
            isVisible: true,
          },
          {
            text: 'Zahájení práce',
            align: 'right',
            sortable: true,
            value: 'started',
            isVisible: true,
          },
          {
            text: 'Strávený čas',
            align: 'right',
            sortable: true,
            value: 'timeSpent',
            isVisible: true,
          },
          {
            text: 'Popis',
            align: 'left',
            sortable: true,
            value: 'description',
            isVisible: true,
          },
          {
            text: 'Kategorie',
            align: 'left',
            sortable: true,
            value: 'costCategoryId',
            isVisible: true,
          },
          {
            text: 'Akce',
            align: 'center',
            sortable: false,
            value: 'action',
            isVisible: true,
          },
        ];
      },
      costCategoryItems () {
        return [];
      },
      authorItems () {
        return this.users.map(user => ({
          text: `${user.firstName} ${user.lastName}`,
          value: user.id.toString(),
        }));
      },
    },
    watch: {
      filter: {
        handler() {
          this.$store.dispatch('getWorkLogs', this.filter);
        },
        deep: true,
      },
    },
    async created() {
      await Promise.all([
        this.$store.dispatch('getWorkLogs', this.filter),
        this.$store.dispatch('getUsers'),
        // this.$store.dispatch('getCostCategories'),
      ]);
    },
    methods: {
      async editItem(item) {

      },
      async deleteItem(item) {
        await this.$store.dispatch('deleteWorkLog', item.id);
      },
      createNewWorkLog() {
        this.$refs.createWorkLogDialog.openDialog();
      },
    },
  };
</script>
