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
      @:nameChange="updateName"
      @:weekDayChange="updateWeekDay"
      @:hourChange="updateHour"
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
        title: 'Novy cas konani sitdownu',
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
        this.dialogData.hour = value;
      },
      getTitle (sitDownMeetingTime) {
        return `${sitDownMeetingTime ? 'Upravit' : 'Novy'} cas konani sitdownu`;
      },
      openDialog (sitDownMeetingTime) {
        this.setDataForEdit(sitDownMeetingTime);
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
        if (sitDownMeetingTime) {
          this.dialogData = {
            weekDay: sitDownMeetingTime.week_day,
            hour: sitDownMeetingTime.hour,
            // name: sitDownMeetingTime.name,
          };
          this.editId = sitDownMeetingTime.id;
        }
      },
      createSitDownMeetingTime () {
        this.$store.dispatch('createMeetingTime', this.dialogData);
      },
      editSitDownMeetingTime () {
        this.$store.dispatch('editMeetingTime', {...this.dialogData, ...{id: this.editId}});
      },
      deleteSitDownMeetingTime (id) {
        this.$store.dispatch('deleteMeetingTime', id);
      },
    },
  };
</script>
