<template>
  <v-layout column justify-center align-end>
    <v-btn color="blue darken-2" dark class="button" @click="toggleDialogVisibility">
      <i class="material-icons">add</i>
      NOVÝ ČAS KONÁNÍ SITDOWNU
    </v-btn>

    <v-dialog v-model="dialog.isOpen" max-width="550px">
      <v-card>
        <v-card-title>
          <span class="headline">{{ dialog.title }}</span>
        </v-card-title>

        <v-card-text>
          <v-container grid-list-md>
            <v-layout wrap column>
              <v-flex xs12 sm6 md4>
                <v-text-field :value="formData.name" label="Název" @input="updateName" />
              </v-flex>
              <v-flex xs12 sm6 md4>
                <v-select :items="weekDays" :value="formData.weekDay" label="Den v týdnu" @input="updateWeekDay" />
              </v-flex>
              <v-flex xs12 sm6 md4 class="time-picker">
                <v-time-picker
                  landscape
                  format="24hr"
                  header-color="blue darken-2"
                  color="blue darken-2"
                  :value="formData.time"
                  @input="updateTime"
                />
              </v-flex>
            </v-layout>

            <v-alert transition="fade-transition" :value="errors.error.isVisible" type="error" color="red darken-2">
              {{ errors.error.message }}
            </v-alert>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn color="blue darken-1" text @click="toggleDialogVisibility"> Zrušit </v-btn>
          <v-btn color="blue darken-1" text @click="submit"> Uložit </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-data-table
      :headers="headers"
      :items="meetingTimes.items"
      :items-per-page="999"
      item-key="id"
      hide-default-footer
      fill-height
      :sort-by="sortBy"
      :custom-sort="customSort"
      multi-sort
      class="elevation-1 fullscreen"
    >
      <template v-slot:item="props">
        <tr>
          <td class="element">
            {{ props.item.name }}
          </td>
          <td class="element">
            {{ props.item.time }}
          </td>
          <td class="element">
            {{ props.item.weekDay }}
          </td>
          <td class="element">
            {{ props.item.projects }}
          </td>
          <td class="justify-center layout px-0">
            <v-icon small class="mr-2" @click="toggleDialogVisibility(props.item)"> edit </v-icon>
            <v-icon small @click="deleteSitDownMeetingTime(props.item)"> delete </v-icon>
          </td>
        </tr>
      </template>
    </v-data-table>
    <ConfirmDialog ref="deleteMeetingTimeDialog" />
  </v-layout>
</template>

<script>
import { mapState } from 'vuex';
import { WEEK_DAYS } from '../constants';
import ConfirmDialog from '../components/common/ConfirmDialog';

export default {
  components: { ConfirmDialog },
  data() {
    return {
      sortBy: 'weekDay',
      weekDays: WEEK_DAYS,
      editId: null,
      dialog: {
        isOpen: false,
        title: '',
      },
      formData: {
        name: '',
        weekDay: '',
        time: '',
      },
    };
  },
  computed: {
    ...mapState(['meetingTimes', 'errors']),
    headers: function () {
      return [
        {
          text: 'Název',
          align: 'left',
          sortable: true,
          value: 'name',
        },
        {
          text: 'Hodina',
          align: 'left',
          sortable: true,
          value: 'time',
        },
        {
          text: 'Den v týdnu',
          align: 'left',
          sortable: true,
          value: 'weekDay',
        },
        {
          text: 'Projekty',
          align: 'left',
          sortable: false,
        },
        {
          text: 'Akce',
          align: 'center',
          sortable: false,
        },
      ];
    },
  },
  async fetch({ store }) {
    await store.dispatch('meetingTimes/getMeetingTimes');
  },
  methods: {
    updateName(value) {
      this.formData.name = value;
    },
    updateTime(value) {
      this.formData.time = value;
    },
    updateWeekDay(value) {
      this.formData.weekDay = value;
    },
    getTitle(isEdit) {
      return `${isEdit ? 'Upravit' : 'Nový'} čas konání sitdownu`;
    },
    closeDialog() {
      if (!this.errors.error.isVisible) this.dialog.isOpen = false;
    },
    toggleDialogVisibility(dataForEdit) {
      const isEdit = dataForEdit !== undefined;

      isEdit ? this.setDataForEdit(dataForEdit) : this.resetData();
      this.dialog.title = this.getTitle(isEdit);
      this.dialog.isOpen = !this.dialog.isOpen;
    },
    resetData() {
      this.formData = {
        name: '',
        weekDay: '',
        time: '',
      };
      this.editId = null;
    },
    setDataForEdit(dataForEdit) {
      this.formData = {
        name: dataForEdit.name,
        weekDay: dataForEdit.weekDay,
        time: dataForEdit.time,
      };
      this.editId = dataForEdit.id;
    },
    submit() {
      this.editId ? this.editSitDownMeetingTime() : this.createSitDownMeetingTime();
    },
    getTransformedDataForRequest() {
      const dataForRequest = {
        weekDay: WEEK_DAYS.indexOf(this.formData.weekDay),
        name: this.formData.name,
        time: this.formData.time,
      };

      return this.editId ? Object.assign(dataForRequest, { id: this.editId }) : dataForRequest;
    },
    async createSitDownMeetingTime() {
      await this.$store.dispatch('meetingTimes/createMeetingTime', this.getTransformedDataForRequest());
      this.closeDialog();
    },
    async editSitDownMeetingTime() {
      await this.$store.dispatch('meetingTimes/editMeetingTime', this.getTransformedDataForRequest());
      this.closeDialog();
    },
    async deleteSitDownMeetingTime(meetingTime) {
      this.$refs.deleteMeetingTimeDialog.openDialog({
        title: `Opravdu chcete smazat čas konání sitdownu (${meetingTime.name})?`,
        confirmAction: () => this.$store.dispatch('meetingTimes/deleteMeetingTime', meetingTime.id),
      });
    },
    customSort(items, index, isDesc) {
      items.sort((a, b) => {
        let result = 0;
        for (const i in index) {
          if (index[i] === 'name') {
            if (!isDesc[i]) {
              result = a.name.localeCompare(b.name, 'cs');
            } else {
              result = b.name.localeCompare(a.name, 'cs');
            }
          } else if (index[i] === 'weekDay') {
            if (a.weekDayId === b.weekDayId) {
              result = 0;
            } else if (!isDesc[i]) {
              result = a.weekDayId < b.weekDayId ? -1 : 1;
            } else {
              result = b.weekDayId < a.weekDayId ? -1 : 1;
            }
          } else {
            if (a[index[i]] === b[index[i]]) {
              result = 0;
            } else if (!isDesc[i]) {
              result = a[index[i]] < b[index[i]] ? -1 : 1;
            } else {
              result = b[index[i]] < a[index[i]] ? -1 : 1;
            }
          }

          if (result !== 0) {
            return result;
          }
        }
        return result;
      });

      return items;
    },
  },
};
</script>

<style scoped>
.fullscreen {
  width: 100%;
  height: 100%;
}
.time-picker {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  margin-bottom: 20px;
}

.element {
  font-size: 1.3em !important;
}

.button {
  margin: 6px 8px;
}
</style>
