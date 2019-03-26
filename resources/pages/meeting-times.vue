<template>
  <v-layout column justify-center align-end>
    <v-btn @click="openDialog()" color="primary" dark>
      <i class="material-icons">add</i>
      NOVÝ ČAS KONÁNÍ SITDOWNU
    </v-btn>

    <CreateEditDialog
      :isOpen="isDialogOpen"
      :title="title"
      :close="closeDialog"
      :submit="submit"
      :dialogData="dialogData"
      v-on:name:change="updateName"
      v-on:weekday:change="updateWeekDay"
      v-on:hour:change="updateHour"
    ></CreateEditDialog>

    <MeetingTimesTable
      :openEditDialog="openDialog"
      :deleteItem="deleteSitDownMeetingTime"
      :meetingTimes="meetingTimes"
    ></MeetingTimesTable>

  </v-layout>
</template>

<script>
  import { mapState, mapMutations } from 'vuex';
  import MeetingTimesTable from '../components/MeetingTimesComponents/Table';
  import CreateEditDialog from '../components/MeetingTimesComponents/CreateEditDialog';
  import { WEEK_DAYS } from '../constants';

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
      ]),
      ...mapMutations([
        'createMeetingTime',
        'editMeetingTime',
        'deleteMeetingTime',
      ]),
    },
    data () {
      return {
        title: 'Novy sitdown',
        isDialogOpen: false,
        editId: null,
        dialogData: {
          name: '',
          weekDay: '',
          hour: '',
        },
      };
    },
    methods: {
      updateWeekDay (value) {
        this.dialogData.weekDay = value;
      },
      updateHour (value) {
        this.dialogData.hour = value;
      },
      updateName (value) {
        this.dialogData.name = value;
      },
      getTitle (sitDownMeetingTime) {
        return `${sitDownMeetingTime ? 'Upravit' : 'Novy'} sitdown`;
      },
      openDialog (sitDownMeetingTime) {
        if (sitDownMeetingTime !== undefined) {
          this.setDataForEdit(sitDownMeetingTime);
        }
        this.title = this.getTitle(sitDownMeetingTime);
        this.isDialogOpen = true;
      },
      closeDialog () {
        this.isDialogOpen = false;
        this.resetData();
      },
      submit () {
        if (this.editId) {
          this.editSitDownMeetingTime();
        } else {
          this.createSitDownMeetingTime();
        }

        this.closeDialog();
      },
      resetData () {
        this.isDialogOpen = false;
        this.dialogData = {
          name: '',
          weekDay: '',
          hour: '',
        };
      },
      setDataForEdit (sitDownMeetingTime) {
        this.dialogData = {
          weekDay: sitDownMeetingTime.week_day,
          hour: sitDownMeetingTime.hour,
          name: sitDownMeetingTime.name,
        };
        this.editId = sitDownMeetingTime.id;
      },
      getWeekDayIndex () {
        return WEEK_DAYS.indexOf(this.dialogData.weekDay);
      },
      getDialogData () {
        return {
          ...this.dialogData,
          weekDay: this.getWeekDayIndex(),
        };
      },
      async createSitDownMeetingTime () {
        await this.$store.dispatch('createMeetingTime', this.getDialogData());
      },
      async editSitDownMeetingTime () {
        await this.$store.dispatch('editMeetingTime', {...this.getDialogData(), id: this.editId});
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
