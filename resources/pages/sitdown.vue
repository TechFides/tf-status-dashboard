<template>
  <div width="100%" class="fill-height">
    <v-row justify="end">
      <div v-if="gifDialog.isOpen" class="gif">
        <v-img width="100%" height="100%" style="position: absolute" :src="gifDialog.url" />
      </div>
      <v-col :cols="$device.isDesktop ? 2 : 12" class="pt-0 pl-6">
        <v-select
          v-model="selectedMeetingTimeId"
          :items="formattedMeetingTimesForSelect"
          label="Vyberte čas konání sitdownu"
        />
      </v-col>
      <v-col :cols="$device.isDesktop ? 2 : 12" :class="$device.isDesktop ? 'pt-0' : 'pt-0 pl-6 pb-0'">
        <DatePicker v-model="filter.sitdownMonth" label="Měsíc" :clearable="false" type="month" date-format="YYYY-MM" />
      </v-col>
      <v-btn
        v-show="isAdministration() || hasPermission('manage-sitdowns')"
        :class="$device.isDesktop ? 'mt-2 ml-4' : 'mb-4'"
        color="light-blue accent-4"
        dark
        @click="createSitdown"
      >
        <i class="material-icons">add</i>
        Přidat sitdown
      </v-btn>
      <v-btn
        v-show="isAdministration() || hasPermission('manage-project-notes')"
        color="green darken-2"
        dark
        right
        :class="$device.isDesktop ? 'mt-2 ml-4 mr-6' : 'mr-3 mb-4 ml-2'"
        @click="createNote"
      >
        <i class="material-icons">add</i>
        Přidat cíl
      </v-btn>
    </v-row>

    <v-card class="elevation-1">
      <v-data-table
        :headers="headers"
        :items="rows"
        :items-per-page="999"
        hide-default-header
        hide-default-footer
        fill-height
        no-data-text="Žádná data"
        class="elevation-1 fullscreen"
      >
        <template v-slot:header="{ props }">
          <thead>
            <tr>
              <th v-for="h in props.headers" :key="h.text" class="text-left header-text">
                <span class="project-name">
                  <div class="text-xs-left header align-project">
                    {{ h.text }}
                  </div>
                  <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                      <i
                        v-show="isMissingNote(h.text, h.hasIcon)"
                        class="material-icons alert-icon"
                        v-bind="attrs"
                        v-on="on"
                      >
                        report_problem
                      </i>
                    </template>
                    <span>Chybí cíl na další sitdown</span>
                  </v-tooltip>
                </span>
              </th>
            </tr>
          </thead>
          <thead>
            <tr>
              <th v-for="h in props.headers" :key="h.text" class="text-left header-text">
                {{ h.meetingTime ? h.meetingTime.dayAndTime : '' }}
              </th>
            </tr>
          </thead>
        </template>
        <template v-slot:item="props">
          <tr>
            <td class="text-left element">
              {{ formatDate(props.item.sitdown.date) }}
            </td>

            <td v-for="(i, itemIndex) in props.item.ratings" :key="itemIndex" class="text-left">
              <project-status-picker
                :project-rating="i.rating"
                :project-id="i.projectId"
                :sitdown-id="i.sitdownId"
                :disabled="!isSitdownRatingEditAllowed"
                :date="formatDate(props.item.sitdown.date)"
                :on-submit="openGifDialog"
              />
            </td>
            <td v-if="isAdministration() || hasPermission('manage-sitdowns')" class="text-left">
              <v-icon class="mr-2" @click="editSitdown(props.item.sitdown)"> edit </v-icon>
              <v-icon @click="deleteSitdown(props.item.sitdown)"> delete </v-icon>
            </td>
          </tr>
        </template>
      </v-data-table>
    </v-card>
    <note-list :editable="isAdministration() || hasPermission('manage-project-notes')" @edit="editNote" />
    <note-dialog ref="refNoteDialog" />
    <SitdownDialog ref="refSitdownDialog" />
  </div>
</template>

<script>
import NoteList from '../components/sitdown/NoteList';
import NoteDialog from '../components/sitdown/dialogs/NoteDialog';
import SitdownDialog from '../components/sitdown/dialogs/SitdownDialog';
import ProjectStatusPicker from '../components/sitdown/dialogs/ProjectStatusPicker';
import { parse, format } from 'date-fns';
import { mapState } from 'vuex';
import DatePicker from '../../resources/components/common/DatePicker';

export default {
  components: {
    ProjectStatusPicker,
    NoteList,
    NoteDialog,
    DatePicker,
    SitdownDialog,
  },
  data() {
    return {
      GIF_ANIMATION_DURATION: 5500,
      gifDialog: {
        isOpen: false,
        url: '',
      },
      selectedMeetingTimeId: null,
      defaultRating: 8,
      filter: {
        sitdownMonth: null,
      },
    };
  },
  computed: {
    ...mapState(['notes', 'projects', 'sitdowns', 'errors', 'meetingTimes']),
    headers() {
      const sortedProjects = this.sortProjectsByMeetingTime();
      const filteredProjects = this.getFilteredProjectsBySelectedMeetingTime(sortedProjects);
      const formattedProjectsForTable = filteredProjects.map(project => ({
        text: project.code,
        align: 'left',
        sortable: false,
        value: project.code,
        hasIcon: true,
        meetingTime: project.meetingTime,
      }));

      return [
        {
          text: 'Datum',
          align: 'left',
          sortable: false,
          value: 'date',
          hasIcon: false,
        },
        ...formattedProjectsForTable,
        {
          text: 'Akce',
          align: 'left',
          sortable: false,
          value: 'action',
          hasIcon: false,
        },
      ];
    },
    rows() {
      return this.sitdowns.ratings.map(sitdown => ({
        sitdown: {
          id: sitdown.id,
          date: sitdown.date,
        },
        ratings: this.getRatings(sitdown),
      }));
    },
    formattedMeetingTimesForSelect() {
      return [
        { text: 'Žádný', value: null },
        ...this.meetingTimes.items.map(meetingTime => ({
          text: meetingTime.dayAndTime,
          value: meetingTime.id,
        })),
      ];
    },
    isSitdownRatingEditAllowed() {
      return (
        this.$auth.user.is_admin ||
        this.$auth.user.position.permissions.find(permission => permission.value === 'sitdown-rating')
      );
    },
  },
  watch: {
    filter: {
      handler() {
        this.updateSitdown();
      },
      deep: true,
    },
  },
  fetch({ store, params }) {
    return Promise.all([
      store.dispatch('sitdowns/getSitdownData'),
      store.dispatch('notes/getNotes'),
      store.dispatch('meetingTimes/getMeetingTimes'),
      store.dispatch('projects/getProjects'),
    ]);
  },
  mounted() {
    const now = new Date();
    this.filter.sitdownMonth = `${now.getFullYear()}-${now.getMonth() + 1}`;
  },
  methods: {
    sortProjectsByMeetingTime() {
      const projectsWithoutMeetingTime = this.projects.items.filter(project => project.meetingTime.time === null);
      const sortedProjectsWithMeetingTime = this.projects.items
        .filter(project => project.meetingTime.time !== null)
        .sort((a, b) => this.sortByDayAndTime(a.meetingTime, b.meetingTime));

      return [...sortedProjectsWithMeetingTime, ...projectsWithoutMeetingTime];
    },
    sortByDayAndTime(timeA, timeB) {
      if (timeA.weekDayId !== timeB.weekDayId) {
        return timeA.weekDayId - timeB.weekDayId;
      }

      if (timeA.time !== timeB.time) {
        return timeA.time > timeB.time ? 1 : -1;
      }

      return 0;
    },
    getFilteredProjectsBySelectedMeetingTime(allProjects) {
      return this.selectedMeetingTimeId !== null
        ? allProjects.filter(project => project.meetingTime.id === this.selectedMeetingTimeId)
        : allProjects;
    },
    formatDate(date) {
      const d = new Date(date);

      return format(d, 'DD/MM/YYYY');
    },
    formatMonth(date) {
      const d = new Date(date);

      return format(d, 'MM-YYYY');
    },
    updateSitdown() {
      const actualDate = new Date();

      const selectedDate = new Date();
      const [year, month] = this.filter.sitdownMonth.split('-');
      selectedDate.setFullYear(Number(year), Number(month) - 1);

      const isSameMonth = selectedDate.getMonth() === actualDate.getMonth();
      const isSameYear = selectedDate.getFullYear() === actualDate.getFullYear();

      if (isSameMonth && isSameYear) {
        this.$store.dispatch('sitdowns/getSitdownData', selectedDate);
      } else {
        this.$store.dispatch('sitdowns/getProjectsForMonth', selectedDate);
      }
    },
    getRatings(sitdown) {
      return this.getFilteredProjectsBySelectedMeetingTime(this.sortProjectsByMeetingTime()).map(p => ({
        sitdownId: sitdown.id,
        projectId: p.id,
        rating: sitdown.sitdownProjectRating[p.id] >= 0 ? sitdown.sitdownProjectRating[p.id] : this.defaultRating,
      }));
    },
    isMissingNote(projectCode, hasIcon) {
      const date = format(new Date(), 'YYYY-MM-DD 00:00:00');
      const hasNoteAfterDeadline = this.notes.items.some(element => {
        return element.projectCode === projectCode && element.deadlineDate > date;
      });
      return !hasNoteAfterDeadline && hasIcon;
    },
    async editNote(note) {
      this.$refs.refNoteDialog.openDialog(note);
    },
    createNote() {
      this.$refs.refNoteDialog.openDialog();
    },
    editSitdown(sitdown) {
      this.$refs.refSitdownDialog.openDialog(sitdown);
    },
    createSitdown() {
      this.$refs.refSitdownDialog.openDialog();
    },
    openGifDialog() {
      this.gifDialog.isOpen = true;
      this.gifDialog.url = '/giphy.gif' + '?a=' + Math.random();

      setTimeout(() => (this.gifDialog.isOpen = false), this.GIF_ANIMATION_DURATION);
    },
    async deleteSitdown(sitdown) {
      const confirmed = confirm(`Opravdu chcete smazat sitdown ${this.formatDate(sitdown.date)}?`);
      this.sitdownDialog = {
        id: sitdown.id,
        date: parse(sitdown.date),
        selectedDate: this.selectedDate,
      };

      if (confirmed) {
        await this.$store.dispatch('sitdowns/deleteSitdown', this.sitdownDialog);
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

.element {
  font-size: 1.5em !important;
}

.header {
  font-size: 2em !important;
}

.material-icons.alert-icon {
  color: #c62828;
  vertical-align: top;
}

.align-project {
  display: inline-block;
}

.header-text {
  color: rgba(0, 0, 0, 0.54) !important;
  font-weight: 500 !important;
  font-size: 1.2em !important;
  padding: 0;
  min-width: 150px;
}

.gif {
  width: 600px;
  height: 500px;
  position: absolute;
  z-index: 9999;
}

.project-name {
  display: flex;
}
</style>
