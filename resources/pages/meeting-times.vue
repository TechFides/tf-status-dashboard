<template>
  <v-layout
    column
    justify-center
    align-end
  >
    <v-btn
      color="blue darken-2"
      dark
      class="button"
      @click="toggleDialogVisibility"
    >
      <i class="material-icons">add</i>
      NOVÝ ČAS KONÁNÍ SITDOWNU
    </v-btn>

    <v-dialog
      v-model="dialog.isOpen"
      max-width="550px"
    >
      <v-card>
        <v-card-title>
          <span class="headline">{{ dialog.title }}</span>
        </v-card-title>

        <v-card-text>
          <v-container grid-list-md>
            <v-layout
              wrap
              column
            >
              <v-flex
                xs12
                sm6
                md4
              >
                <v-text-field
                  :value="formData.name"
                  label="Název"
                  @input="updateName"
                />
              </v-flex>
              <v-flex
                xs12
                sm6
                md4
              >
                <v-select
                  :items="weekDays"
                  :value="formData.weekDay"
                  label="Den v týdnu"
                  @input="updateWeekDay"
                />
              </v-flex>
              <v-flex
                xs12
                sm6
                md4
                class="time-picker"
              >
                <v-time-picker
                  landscape
                  format="24hr"
                  :value="formData.time"
                  @input="updateTime"
                />
              </v-flex>
            </v-layout>

            <v-alert
              transition="fade-transition"
              :value="error.isVisible"
              type="error"
              color="red darken-2"
            >
              {{ error.message }}
            </v-alert>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn
            color="blue darken-1"
            text
            @click="toggleDialogVisibility"
          >
            Zrušit
          </v-btn>
          <v-btn
            color="blue darken-1"
            text
            @click="submit"
          >
            Uložit
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-data-table
      :headers="headers"
      :items="meetingTimes"
      item-key="id"
      hide-default-footer
      fill-height
      class="elevation-1 fullscreen"
    >
      <template
        v-slot:item="props"
      >
        <tr>
          <td class="text-center element">
            {{ props.item.name }}
          </td>
          <td class="text-center element">
            {{ props.item.time }}
          </td>
          <td class="text-center element">
            {{ props.item.weekDay }}
          </td>
          <td class="text-center element">
            {{ props.item.projects }}
          </td>
          <td class="justify-center layout px-0">
            <v-icon
              small
              class="mr-2"
              @click="toggleDialogVisibility(item)"
            >
              edit
            </v-icon>
            <v-icon
              small
              @click="deleteSitDownMeetingTime(item.id)"
            >
              delete
            </v-icon>
          </td>
        </tr>
      </template>
    </v-data-table>
  </v-layout>
</template>

<script>
  import { mapState, mapMutations } from 'vuex';
  import { WEEK_DAYS } from '../constants';

  export default {
    data () {
      return {
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
      ...mapState([
        'meetingTimes',
        'error',
      ]),
      ...mapMutations([
        'createMeetingTime',
        'editMeetingTime',
        'deleteMeetingTime',
      ]),
      headers: function () {
        return [
          {
            text: 'Název',
            align: 'center',
            sortable: false,
          },
          {
            text: 'Hodina',
            align: 'center',
            sortable: false,
          },
          {
            text: 'Den v týdnu',
            align: 'center',
            sortable: false,
          },
          {
            text: 'Projekty',
            align: 'center',
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
    async fetch ({ store }) {
      await store.dispatch('getMeetingTimes');
    },
    methods: {
      updateName (value) {
        this.formData.name = value;
      },
      updateTime (value) {
        this.formData.time = value;
      },
      updateWeekDay (value) {
        this.formData.weekDay = value;
      },
      getTitle (isEdit) {
        return `${isEdit ? 'Upravit' : 'Nový'} čas konání sitdownu`;
      },
      closeDialog () {
        if (!this.error.isVisible) this.dialog.isOpen = false;
      },
      toggleDialogVisibility (dataForEdit) {
        const isEdit = dataForEdit !== undefined;

        isEdit ? this.setDataForEdit(dataForEdit) : this.resetData();
        this.dialog.title = this.getTitle(isEdit);
        this.dialog.isOpen = !this.dialog.isOpen;
      },
      resetData () {
        this.formData = {
          name: '',
          weekDay: '',
          time: '',
        };
        this.editId = null;
      },
      setDataForEdit (dataForEdit) {
        this.formData = {
          name: dataForEdit.name,
          weekDay: dataForEdit.weekDay,
          time: dataForEdit.time,
        };
        this.editId = dataForEdit.id;
      },
      submit () {
        this.editId
          ? this.editSitDownMeetingTime()
          : this.createSitDownMeetingTime();
      },
      getTransformedDataForRequest () {
        const dataForRequest = {
          weekDay: WEEK_DAYS.indexOf(this.formData.weekDay),
          name: this.formData.name,
          time: this.formData.time,
        };

        return this.editId ? Object.assign(dataForRequest, { id: this.editId }) : dataForRequest;
      },
      async createSitDownMeetingTime () {
        await this.$store.dispatch('createMeetingTime', this.getTransformedDataForRequest());
        this.closeDialog();
      },
      async editSitDownMeetingTime () {
        await this.$store.dispatch('editMeetingTime', this.getTransformedDataForRequest());
        this.closeDialog();
      },
      async deleteSitDownMeetingTime (id) {
        const confirmed = confirm(`Opravdu chcete smazat sitdown (id: ${id})?`);

        if (confirmed) {
          await this.$store.dispatch('deleteMeetingTime', id);
        }
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
