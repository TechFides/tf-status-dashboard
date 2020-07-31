<template>
  <div
    width="100%"
    class="fill-height"
  >
    <v-card class="elevation-1">
      <v-row
        justify="start"
      >
        <v-col cols="2" class="ml-5">
          <v-select
            v-model="filter.absenceState"
            :items="absenceStateEnumItems"
            label="Stav nepřítomnosti"
            clearable
          />
        </v-col>
        <v-col cols="2">
          <v-select
            v-model="filter.absenceType"
            :items="absenceTypeEnumItems"
            label="Typ nepřítomnosti"
            clearable
          />
        </v-col>
      </v-row>
      <v-data-table
        :headers="headers"
        :items="officeAbsences"
        :items-per-page="999"
        item-key="id"
        hide-default-footer
        fill-height
        single-expand
        must-sort
        class="elevation-1 fullscreen"
        @item-expanded="getRowId"
      >
        <template
          v-slot:item="{item, expand, isExpanded}"
        >
          <tr
            @click.stop="expand(!isExpanded)"
            :class="getRowClass(item.absenceState.name, item.description)"
          >
            <td class="text-right element pr-8">
              {{ item.absenceStart }}
            </td>
            <td class="text-right element">
              {{ item.absenceEnd }}
            </td>
            <td class="text-right element pr-8">
              {{ item.created }}
            </td>
            <td class="text-left element">
              {{ item.absenceApprover }}
            </td>
            <td class="text-left element">
              {{ item.absenceState.value }}
            </td>
            <td class="text-left element">
              {{ item.absenceType.value }}
            </td>
            <td class="text-right element">
              {{ `${item.absenceHoursNumber}h` }}
            </td>
            <td class="justify-center layout px-0">
              <v-icon
                small
                @click="deleteItem(props.item)"
              >
                delete
              </v-icon>
            </td>
            <td class="text-left px-0">
              <v-icon
                v-if="item.description"
                class="mr-2"
              >
                {{ isExpanded ? "mdi-chevron-up" : "mdi-chevron-down" }}
              </v-icon>
            </td>
          </tr
            >
        </template>
        <template
          v-slot:expanded-item="{ headers }"
        >
          <td
            :colspan="headers.length"
            class="pr-0 pl-8"
            :class="getRowClass(officeAbsenceDetailItems.absenceState.name)"
            v-if="officeAbsenceDetailItems.description"
          >
            <span class="expanded-column">{{ 'Popis nepřítomnosti:' }}</span>
            <span>{{ officeAbsenceDetailItems.description }}</span>
          </td>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<script>
  import { mapState } from 'vuex';

  export default {
    name: 'OfficeAbsences',
    data () {
      return {
        filter: {
          absenceType: '',
          absenceState: '',
        },
        statisticsMonthDialog: {
          isOpen: false,
          month: `${new Date().getFullYear()}-${new Date().getMonth() + 1}`,
        },
        userInfoDialog: {
          id: null,
          previousXp: null,
          bonusXp: null,
          isOpen: false,
          sumXpProjects: null,
          sumHoursWorked: null,
        },
        expandedRowId: null,
        selectedDate: new Date(),
      };
    },
    computed: {
      ...mapState([
        'officeAbsences',
        'error',
        'absenceTypeEnums',
        'absenceStateEnums',
      ]),
      headers () {
        return [
          {
            text: 'Zahájení nepřítomnosti',
            align: 'right',
            sortable: true,
            value: 'absenceStart',
            isVisible: true,
          },
          {
            text: 'Ukončení nepřítomnosti',
            align: 'right',
            sortable: false,
            value: 'absenceEnd',
            isVisible: true,
          },
          {
            text: 'Datum odeslání žádosti',
            align: 'right',
            sortable: true,
            value: 'created',
            isVisible: true,
          },
          {
            text: 'Schvalovatel',
            align: 'left',
            sortable: false,
            value: 'absenceApprover',
            isVisible: true,
          },
          {
            text: 'Stav nepřítomnosti',
            align: 'left',
            sortable: false,
            value: 'absenceState',
            isVisible: true,
          },
          {
            text: 'Typ nepřítomnosti',
            align: 'left',
            sortable: false,
            value: 'absenceType',
            isVisible: true,
          },
          {
            text: 'Počet hodin nepřítomnosti',
            align: 'right',
            sortable: false,
            value: 'absenceHoursNumber',
            isVisible: true,
          },
          {
            text: 'Akce',
            align: 'center',
            sortable: false,
            value: 'action',
            isVisible: true,
          },
          {
            text: '',
            align: 'center',
            sortable: false,
            value: 'expandAction',
            isVisible: true,
          },
        ];
      },
      officeAbsenceDetailItems () {
        return this.officeAbsences.find(o => o.id === this.expandedRowId);
      },
      absenceTypeEnumItems () {
        return this.absenceTypeEnums.map(absenceTypeEnum => ({
          text: absenceTypeEnum.value,
          value: absenceTypeEnum.id,
        }));
      },
      absenceStateEnumItems () {
        return this.absenceStateEnums.map(absenceStateEnum => ({
          text: absenceStateEnum.value,
          value: absenceStateEnum.id,
        }));
      },
    },
    async fetch ({ store }) {
      await Promise.all([
        store.dispatch('getOfficeAbsences'),
        store.dispatch('getAbsenceTypeEnums'),
        store.dispatch('getAbsenceStateEnums'),
      ]);
    },
    watch: {
      filter: {
        handler() {
          this.$store.dispatch('getOfficeAbsences', this.filter);
        },
        deep: true,
      },
    },
    methods: {
      getRowId(row) {
        this.expandedRowId = row.item.id;
      },
      getRowClass(absenceStateName, hasDescription) {
        const className = hasDescription ? 'expanded-row color' : 'color';
        switch (absenceStateName) {
          case 'APPROVED':
            return `${className}-approved`;
          case 'REJECTED':
            return `${className}-reject`;
          case 'AWAITING_CANCELLATION_APPROVAL':
            return `${className}-cancellation-waiting`;
          case 'DONE':
            return `${className}-done`;
          case 'CANCELED':
            return `${className}-canceled`;
          case 'WAITING_FOR_APPROVAL':
            return `${className}-approval-waiting`;
          default:
            return '';
        }
      },
      deleteItem(item) {

      },
    },
  };
</script>

<style scoped>
  .expanded-row {
    cursor: pointer !important;
  }
  .no-available-data {
    display: flex;
    justify-content: center;
    color: rgba(0,0,0,.38);
    height: 48px;
    align-items: center;
  }
  .expanded-column {
    color: rgba(0,0,0,.6);
    font-size: 0.8rem;
    font-weight: bold;
  }
  .color-approved {
    background-color: #c7ffc9;
  }
  .color-reject {
    background-color: #ffd3d3;
  }
  .color-cancellation-waiting {
     background-color: #feffc8;
   }
  .color-done {
    background-color: #b7e2f1;
  }
  .color-canceled {
    background-color: #e0e0e0;
  }
  .color-approval-waiting {
    background-color: #feffc8;
  }
</style>
