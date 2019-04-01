<template>
  <v-layout column justify-center align-end>

    <CreateEditDialog
      :dialog="dialog"
      v-on:submit="submit"
      v-on:toggle-dialog-visibility="toggleDialogVisibility"
    ></CreateEditDialog>

    <MeetingTimesTable
      :meetingTimes="meetingTimes"
      v-on:delete="deleteSitDownMeetingTime"
      v-on:toggle-dialog-visibility="toggleDialogVisibility"
    ></MeetingTimesTable>

  </v-layout>
</template>

<script>
  import { mapState, mapMutations } from 'vuex';
  import MeetingTimesTable from './table';
  import CreateEditDialog from './dialog';
  import { WEEK_DAYS } from '../../constants';

  export default {
    async fetch ({ store }) {
      await store.dispatch('getMeetingTimes');
    },
    components: {
      MeetingTimesTable,
      CreateEditDialog,
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
    },
    data () {
      return {
        editId: null,
        dialog: {
          isOpen: false,
          title: '',
        },
      };
    },
    methods: {
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
        const dialog = this.$children.find(child => child._name === '<CreateEditDialog>');

        if (dialog && dialog.hasOwnProperty('_data')) {
          dialog._data.dataForSubmit = {
            name: '',
            weekDay: '',
            time: '',
          };
        }
        this.editId = null;
      },
      setDataForEdit (dataForEdit) {
        const dialog = this.$children.find(child => child._name === '<CreateEditDialog>');

        if (dialog && dialog.hasOwnProperty('_data')) {
          dialog._data.dataForSubmit = {
            name: dataForEdit.name,
            weekDay: dataForEdit.weekDay,
            time: dataForEdit.time,
          };
        }
        this.editId = dataForEdit.id;
      },
      submit (data) {
        this.editId
          ? this.editSitDownMeetingTime(data)
          : this.createSitDownMeetingTime(data);
      },
      getTransformedDataForRequest (data) {
        const dataForRequest = {
          weekDay: WEEK_DAYS.indexOf(data.weekDay),
          name: data.name,
          time: data.time,
        };

        return this.editId ? Object.assign(dataForRequest, {id: this.editId}) : dataForRequest;
      },
      async createSitDownMeetingTime (data) {
        await this.$store.dispatch('createMeetingTime', this.getTransformedDataForRequest(data));
        this.closeDialog();
      },
      async editSitDownMeetingTime (data) {
        await this.$store.dispatch('editMeetingTime', this.getTransformedDataForRequest(data));
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
