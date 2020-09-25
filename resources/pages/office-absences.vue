<template>
  <div width="100%" class="fill-height">
    <v-row justify="end">
      <v-btn color="green darken-2" dark class="mt-2 mr-5 mb-2" @click="createNewAbsence()">
        <i class="material-icons">add</i>
        <span class="pl-2"> Nová žádost </span>
      </v-btn>
    </v-row>
    <CreateAbsenceDialog ref="createAbsenceDialog" />
    <CancelAbsenceDialog ref="cancelAbsenceDialog" />
    <v-card class="elevation-1">
      <v-row justify="start">
        <v-col cols="2" class="ml-5">
          <v-select v-model="filter.absenceState" :items="absenceStateEnumItems" label="Stav nepřítomnosti" clearable />
        </v-col>
        <v-col cols="2">
          <v-select v-model="filter.absenceType" :items="absenceTypeEnumItems" label="Typ nepřítomnosti" clearable />
        </v-col>
      </v-row>
      <v-data-table
        :headers="headers"
        :items="officeAbsences.items"
        :items-per-page="10"
        item-key="id"
        fill-height
        single-expand
        must-sort
        class="elevation-1 fullscreen"
        @item-expanded="getRowId"
      >
        <template v-slot:item="{ item, expand, isExpanded }">
          <tr
            :style="{
              backgroundColor: getRowColor(item.absenceState.name),
              cursor: item.generalDescription || item.approverDescription ? 'pointer' : '',
            }"
            @click.stop="expand(!isExpanded)"
          >
            <td class="text-right element pr-8">
              {{ item.absenceStart }}
            </td>
            <td class="text-right element pr-8">
              {{ item.absenceEnd }}
            </td>
            <td class="text-right element pr-8">
              {{ item.created }}
            </td>
            <td class="text-left element">
              {{ item.absenceApprover.fullName }}
            </td>
            <td class="text-left element">
              {{ item.absenceState.value }}
            </td>
            <td class="text-left element">
              {{ item.absenceType.value }}
            </td>
            <td class="text-right element pr-8">
              {{ `${item.absenceHoursNumber}h` }}
            </td>
            <td class="justify-center layout px-0">
              <v-icon
                v-if="item.absenceState.name === 'APPROVED' || item.absenceState.name === 'WAITING_FOR_APPROVAL'"
                small
                @click.stop="deleteItem(item)"
              >
                delete
              </v-icon>
            </td>
            <td class="text-left px-0">
              <v-icon v-if="item.generalDescription || item.approverDescription" class="mr-2">
                {{ isExpanded ? 'mdi-chevron-up' : 'mdi-chevron-down' }}
              </v-icon>
            </td>
          </tr>
        </template>
        <template v-slot:expanded-item="{ headers }">
          <td
            v-if="officeAbsenceDetailItems.generalDescription || officeAbsenceDetailItems.approverDescription"
            :colspan="headers.length"
            class="pa-2 pl-4"
            :style="{ backgroundColor: getRowColor(officeAbsenceDetailItems.absenceState.name) }"
          >
            <div class="expanded-row">
              <div class="expanded-column-generalLabel">
                {{ 'Obecný popis:' }}
              </div>
              <div class="expanded-column-text">
                {{ officeAbsenceDetailItems.generalDescription }}
              </div>
            </div>
            <div class="expanded-row mt-2">
              <div class="expanded-column-approverLabel">
                {{ 'Popis pro schvalovatele:' }}
              </div>
              <div class="expanded-column-text">
                {{ officeAbsenceDetailItems.approverDescription }}
              </div>
            </div>
          </td>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import CreateAbsenceDialog from '../components/officeAbsence/dialogs/CreateAbsenceDialog';
import CancelAbsenceDialog from '../components/officeAbsence/dialogs/CancelAbsenceDialog';

export default {
  name: 'OfficeAbsences',
  components: {
    CreateAbsenceDialog,
    CancelAbsenceDialog,
  },
  data() {
    return {
      filter: {
        absenceType: '',
        absenceState: '',
      },
      expandedRowId: null,
    };
  },
  computed: {
    ...mapState(['officeAbsences']),
    headers() {
      return [
        {
          text: 'Zahájení nepřítomnosti',
          align: 'right',
          sortable: true,
          value: 'absenceStartByNumber',
          isVisible: true,
        },
        {
          text: 'Ukončení nepřítomnosti',
          align: 'right',
          sortable: true,
          value: 'absenceEndByNumber',
          isVisible: true,
        },
        {
          text: 'Datum odeslání žádosti',
          align: 'right',
          sortable: true,
          value: 'createdByNumber',
          isVisible: true,
        },
        {
          text: 'Schvalovatel',
          align: 'left',
          sortable: true,
          value: 'absenceApprover.fullName',
          isVisible: true,
        },
        {
          text: 'Stav nepřítomnosti',
          align: 'left',
          sortable: true,
          value: 'absenceState.value',
          isVisible: true,
        },
        {
          text: 'Typ nepřítomnosti',
          align: 'left',
          sortable: true,
          value: 'absenceType.value',
          isVisible: true,
        },
        {
          text: 'Počet hodin nepřítomnosti',
          align: 'right',
          sortable: true,
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
    officeAbsenceDetailItems() {
      return this.officeAbsences.items.find(o => o.id === this.expandedRowId);
    },
    absenceTypeEnumItems() {
      return this.officeAbsences.absenceTypeEnums.map(absenceTypeEnum => ({
        text: absenceTypeEnum.value,
        value: absenceTypeEnum.id,
      }));
    },
    absenceStateEnumItems() {
      return this.officeAbsences.absenceStateEnums.map(absenceStateEnum => ({
        text: absenceStateEnum.value,
        value: absenceStateEnum.id,
      }));
    },
  },
  watch: {
    filter: {
      handler() {
        this.$store.dispatch('officeAbsences/getOfficeAbsences', this.filter);
      },
      deep: true,
    },
  },
  async fetch({ store }) {
    await Promise.all([
      store.dispatch('officeAbsences/getAbsenceTypeEnums'),
      store.dispatch('officeAbsences/getAbsenceStateEnums'),
    ]);
  },
  async created() {
    await Promise.all([
      this.$store.dispatch('officeAbsences/getOfficeAbsences'),
      this.$store.dispatch('officeAbsences/getApprovers'),
    ]);
  },
  methods: {
    getRowId(row) {
      this.expandedRowId = row.item.id;
    },
    getRowColor(absenceStateName) {
      switch (absenceStateName) {
        case 'APPROVED':
          return '#c7ffc9';
        case 'REJECTED':
          return '#ffd3d3';
        case 'REJECT_CANCELLATION':
          return '#ffd3d3';
        case 'AWAITING_CANCELLATION_APPROVAL':
          return '#feffc8';
        case 'DONE':
          return '#90caf9';
        case 'CANCELED':
          return '#e0e0e0';
        case 'WAITING_FOR_APPROVAL':
          return '#feffc8';
        default:
          return '';
      }
    },
    async deleteItem(item) {
      if (item.absenceState.name === 'WAITING_FOR_APPROVAL') {
        const confirmed = confirm(`Opravdu chcete smazat tuhle žádost o nepřítomnost?`);

        if (confirmed) {
          await this.$store.dispatch('officeAbsences/deleteOfficeAbsence', item.id);
        }
      } else {
        this.$refs.cancelAbsenceDialog.openDialog(item);
      }
    },
    createNewAbsence() {
      this.$refs.createAbsenceDialog.openDialog();
    },
  },
};
</script>

<style scoped>
.expanded-row {
  display: flex;
  flex-direction: row;
}

.expanded-column-generalLabel {
  color: rgba(0, 0, 0, 0.6);
  font-size: 0.8rem;
  font-weight: bold;
  min-width: 85px;
  padding-top: 1px;
}

.expanded-column-approverLabel {
  color: rgba(0, 0, 0, 0.6);
  font-size: 0.8rem;
  font-weight: bold;
  min-width: 145px;
  padding-top: 1px;
}

.expanded-column-text {
  font-size: 0.9rem;
}
</style>
