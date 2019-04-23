<template>
  <div>
    <v-layout
      row
      reverse
    >
      <v-dialog
        v-show="isAdmin() || isUser()"
        v-model="noteDialog.isOpen"
        max-width="500px"
      >
        <v-btn
          slot="activator"
          color="primary"
          right
          @click="resetNote"
        >
          <i class="material-icons">add</i>
          Přidat cíl
        </v-btn>
        <v-form @submit.prevent="createNote">
          <v-card>
            <v-card-title>
              <span class="headline">{{ noteDialogTitle }}</span>
            </v-card-title>
            <div class="mx-3">
              <v-layout column>
                <v-flex>
                  <v-combobox
                    v-model="noteDialog.selectedProject"
                    :items="projectNames"
                    required
                    label="Projekt"
                  />
                </v-flex>
                <v-flex>
                  <date-picker-field
                    v-model="noteDialog.deadlineDate"
                    label="Deadline"
                  />
                </v-flex>
                <v-flex>
                  <v-textarea
                    v-model="noteDialog.note"
                    label="Poznámka"
                    required
                  />
                </v-flex>
              </v-layout>
              <v-alert
                transition="fade-transition"
                :value="error.isVisible"
                type="error"
              >
                {{ error.message }}
              </v-alert>
            </div>
            <v-card-actions>
              <v-spacer />
              <v-btn
                color="blue darken-1"
                flat
                @click.native="resetNote"
              >
                Zavřít
              </v-btn>
              <v-btn
                color="blue darken-1"
                flat
                type="submit"
              >
                Uložit
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-form>
      </v-dialog>

      <v-dialog
        v-model="standupDialog.isOpen"
        max-width="500px"
      >
        <v-btn
          v-show="isAdmin()"
          slot="activator"
          class="standup-button"
          color="info"
          @click="createStandup()"
        >
          <i class="material-icons">add</i>
          Přidat standup
        </v-btn>
        <v-card>
          <v-card-title>
            <span class="headline">{{ standupDialogTitle }}</span>
          </v-card-title>
          <div class="mx-3">
            <v-layout column>
              <v-flex>
                <date-picker-field
                  v-model="standupDialog.date"
                  label="Datum standupu"
                />
              </v-flex>
            </v-layout>
            <v-alert
              transition="fade-transition"
              :value="error.isVisible"
              type="error"
            >
              {{ error.message }}
            </v-alert>
          </div>
          <v-card-actions>
            <v-spacer />
            <v-btn
              color="blue darken-1"
              flat
              @click.native="resetStandup"
            >
              Zavřít
            </v-btn>
            <v-btn
              color="blue darken-1"
              flat
              @click.native="save"
            >
              Uložit
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-flex
        md1
        class="pad"
      >
        <v-dialog
          ref="dialogMonth"
          v-model="monthPickerIsOpen"
          :return-value.sync="modalItem.standupMonth"
          persistent
          lazy
          full-width
          width="290px"
        >
          <v-text-field
            slot="activator"
            v-model="modalItem.standupMonth"
            label="Měsíc"
            append-icon="event"
            readonly
          />
          <v-date-picker
            v-model="modalItem.standupMonth"
            scrollable
            type="month"
          >
            <v-spacer />
            <v-btn
              flat
              color="primary"
              @click="monthPickerIsOpen = false"
            >
              Zrušit
            </v-btn>
            <v-btn
              flat
              color="primary"
              @click="updateStandup($refs.dialogMonth)"
            >
              OK
            </v-btn>
          </v-date-picker>
        </v-dialog>
      </v-flex>

      <v-select
        v-model="selectedMeetingTimeId"
        class="margin select-wrapper"
        :items="formattedMeetingTimesForSelect"
        label="Vyberte čas konání sitdownu"
      />
    </v-layout>

    <v-layout
      column
      justify-center
      align-center
    >
      <v-data-table
        :headers="headers"
        :items="rows"
        hide-actions
        fill-height
        no-data-text="Žádná data"
        class="elevation-1 fullscreen"
      >
        <template
          slot="headers"
          slot-scope="props"
        >
          <tr>
            <th
              v-for="h in props.headers"
              :key="h.text"
            >
              <nav>
                <div class="text-xs-center header align-project">
                  {{ h.text }}
                </div>
                <v-tooltip bottom>
                  <i
                    v-show="isMissingNote(h.text, h.hasIcon)"
                    slot="activator"
                    class="material-icons alert-icon"
                  >
                    report_problem
                  </i>
                  <span>Chybí cíl na další standup</span>
                </v-tooltip>
              </nav>
            </th>
          </tr>
          <tr class="table__row-bottom-border">
            <th
              v-for="h in props.headers"
              :key="h.text"
              class="element"
            >
              {{ h.meetingTime ? h.meetingTime.dayAndTime : '' }}
            </th>
          </tr>
        </template>
        <template
          slot="items"
          slot-scope="{ item }"
        >
          <td class="text-xs-center element">
            {{ formatDate(item.standup.date) }}
          </td>

          <td
            v-for="(i, itemIndex) in item.ratings"
            :key="itemIndex"
          >
            <project-status-picker
              :project-rating="i.rating"
              :project-id="i.projectId"
              :standup-id="i.standupId"
              :disabled="!isAdmin() && !isUser()"
              :date="formatDate(item.standup.date)"
            />
          </td>
          <td class="justify-center layout px-0">
            <v-icon
              class="mr-2"
              @click="editStandup(item.standup)"
            >
              edit
            </v-icon>
            <v-icon
              @click="deleteStandup(item.standup)"
            >
              delete
            </v-icon>
          </td>
        </template>
      </v-data-table>
    </v-layout>
    <note-list
      :editable="isAdmin() || isUser()"
      @edit="editNote"
    />
  </div>
</template>

<script>
import NoteList from '../components/NoteList';
import ProjectStatusPicker from '../components/ProjectStatusPicker';
import { parse, format, addWeeks, setDay, setHours, getHours } from 'date-fns';
import { mapState, mapMutations } from 'vuex';
import DatePickerField from '../components/DatePickerField';
import { WEEK_DAYS_SHORTHAND } from '../constants';

export default {
  components: {
    DatePickerField,
    ProjectStatusPicker,
    NoteList,
  },
  data () {
    return {
      filteredProjectsBySelectedMeetingTime: this.projects,
      selectedMeetingTimeId: null,
      modalItem: {
        standupMonth: null,
      },
      selectedDate: new Date(),
      monthPickerIsOpen: false,
      noteDialog: {
        isOpen: false,
        id: null,
        selectedProject: null,
        deadlineDate: null,
        note: '',
      },
      defaultNoteDialog: {
        isOpen: false,
        id: null,
        project: '',
        note: '',
        deadlineDate: null,
      },
      standupDialog: {
        id: null,
        isOpen: false,
        date: null,
        selectedDate: null,
      },
    };
  },
  computed: {
    ...mapState([
      'notes',
      'projects',
      'standupRatings',
      'error',
      'meetingTimes',
    ]),
    ...mapMutations([
      'clearErrorState',
      'setErrorState',
    ]),
    headers () {
      const sortedProjects = this.sortProjectsByMeetingTime();
      const filteredProjects = this.getFilteredProjectsBySelectedMeetingTime(sortedProjects);
      const formattedProjectsForTable = filteredProjects.map(project => ({
        text: project.code,
        align: 'center',
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
          value: 'Datum',
          hasIcon: false,
        },
        ...formattedProjectsForTable,
        {
          text: 'Akce',
          align: 'left',
          sortable: false,
          value: 'Akce',
          hasIcon: false,
        },
      ];
    },
    rows () {
      return this.standupRatings.map(standup => ({
        standup: {
          id: standup.id,
          date: standup.date,
        },
        ratings: this.getRatings(standup),
      }));
    },
    projectNames () {
      return this.projects.map(p => ({
        text: p.code,
        value: p.id,
      }));
    },
    noteDialogTitle () {
      return this.noteDialog.id ? 'Upravení cíle' : 'Vytvoření cíle';
    },
    standupDialogTitle () {
      return this.standupDialog.id ? 'Upravení standupu' : 'Přidání standupu';
    },
    formattedMeetingTimesForSelect () {
      return [
        {text: 'Žádný', value: null},
        ...this.meetingTimes.map(meetingTime => ({
          text: meetingTime.dayAndTime,
          value: meetingTime.id,
        })),
      ];
    },
  },
  fetch ({ store, params }) {
    return Promise.all([
      store.dispatch('getStandupData'),
      store.dispatch('getNotes'),
      store.dispatch('getMeetingTimes'),
      store.dispatch('getProjects'),
    ]);
  },
  methods: {
    sortProjectsByMeetingTime () {
      const projectsWithoutMeetingTime = this.projects.filter(project => project.meetingTime.time === null);
      const sortedProjectsWithMeetingTime = this.projects
        .filter(project => project.meetingTime.time !== null)
        .sort((a, b) => this.sortByDayAndTime(a.meetingTime.dayAndTime, b.meetingTime.dayAndTime));

      return [...sortedProjectsWithMeetingTime, ...projectsWithoutMeetingTime];
    },
    sortByDayAndTime (dayAndTimeA, dayAndTimeB) {
      const dayAOrderIndex = WEEK_DAYS_SHORTHAND.indexOf(dayAndTimeA.substring(0, 2));
      const dayBOrderIndex = WEEK_DAYS_SHORTHAND.indexOf(dayAndTimeB.substring(0, 2));

      return (dayAOrderIndex - dayBOrderIndex) === 0
        ? this.getTimeInMinutes(dayAndTimeA) - this.getTimeInMinutes(dayAndTimeB)
        : dayAOrderIndex - dayBOrderIndex;
    },
    getFilteredProjectsBySelectedMeetingTime (allProjects) {
      return this.selectedMeetingTimeId !== null
        ? allProjects.filter(project => project.meetingTime.id === this.selectedMeetingTimeId)
        : allProjects;
    },
    getTimeInMinutes (time) {
      return parseInt(time.substring(0, 2), 10) * 60 + parseInt(time.substring(3, 4), 10);
    },
    formatDate (date) {
      const d = new Date(date);

      return format(d, 'DD/MM/YYYY');
    },
    formatMonth (date) {
      const d = new Date(date);

      return format(d, 'MM-YYYY');
    },
    updateStandup (monthInput) {
      if (!this.modalItem.standupMonth) {
        this.monthPickerIsOpen = false;
        return;
      }

      monthInput.save(this.modalItem.standupMonth);

      const actualDate = new Date();

      const selectedDate = new Date();
      const [year, month] = this.modalItem.standupMonth.split('-');
      selectedDate.setFullYear(Number(year), Number(month) - 1);
      this.selectedDate = selectedDate;

      const isSameMonth = (selectedDate.getMonth() === actualDate.getMonth());
      const isSameYear = (selectedDate.getFullYear() === actualDate.getFullYear());

      if (isSameMonth && isSameYear) {
        this.$store.dispatch('getStandupData', selectedDate);
      } else {
        this.$store.dispatch('getProjectsForMonth', selectedDate);
      }

      this.monthPickerIsOpen = false;
    },
    getRatings (standup) {
      return this.getFilteredProjectsBySelectedMeetingTime(this.sortProjectsByMeetingTime()).map(p => ({
        standupId: standup.id,
        projectId: p.id,
        rating: standup.standupProjectRating[p.id] || 0,
      }));
    },
    resetNote () {
      // set deadline to next monday
      let date = new Date();
      date = addWeeks(date, 1);
      date = setDay(date, 1);

      this.$store.commit('clearErrorState');

      this.noteDialog = {
        ...this.defaultNoteDialog,
        deadlineDate: date,
      };
    },
    resetStandup () {
      const date = new Date();

      this.$store.commit('clearErrorState');

      this.standupDialog = {
        isOpen: false,
        date: date,
      };
    },
    isMissingNote (projectCode, hasIcon) {
      const date = format(new Date(), 'YYYY-MM-DD 00:00:00');
      const hasNoteAfterDeadline = this.notes.some(element => {
        return element.projectCode === projectCode && element.deadlineDate > date;
      });
      return !hasNoteAfterDeadline && hasIcon;
    },
    async createNote () {
      let errorMsg = null;

      if (!this.noteDialog.selectedProject || !this.noteDialog.selectedProject.value) {
        errorMsg = 'Neni zvolen žádný projekt.';
      } else if (!this.noteDialog.deadlineDate) {
        errorMsg = 'Koncový termín je povinný.';
      } else if (!this.noteDialog.note) {
        errorMsg = 'Poznámka je povinná.';
      }

      const currentDate = new Date();
      const { deadlineDate } = this.noteDialog;
      const resultDate = setHours(deadlineDate, getHours(currentDate));

      if (currentDate > deadlineDate) errorMsg = 'Koncový termín je v minulosti.';

      if (errorMsg) {
        this.$store.commit('setErrorState', {message: errorMsg});
        return;
      }

      const note = {
        id: this.noteDialog.id,
        projectId: this.noteDialog.selectedProject.value,
        deadlineDate: resultDate.toISOString(),
        note: this.noteDialog.note,
      };

      if (note.id) {
        await this.$store.dispatch('editNote', note);
      } else {
        await this.$store.dispatch('createNote', note);
      }

      this.noteDialog.isOpen = false;
    },
    async editNote (note) {
      this.noteDialog = {
        isOpen: true,
        id: note.id,
        selectedProject: this.projectNames.find(v => v.value === note.projectId),
        deadlineDate: parse(note.deadlineDate),
        note: note.text,
      };
    },
    editStandup (standup) {
      this.standupDialog = {
        id: standup.id,
        isOpen: true,
        date: parse(standup.date),
        selectedDate: this.selectedDate,
      };
    },
    createStandup () {
      this.standupDialog = {
        isOpen: true,
        date: new Date(),
        selectedDate: this.selectedDate,
      };
    },
    async save () {
      const action = this.standupDialog.id ? 'editStandup' : 'createStandup';
      const currentDateInMiliSec = new Date().getTime();
      const difference = currentDateInMiliSec - this.standupDialog.date.getTime();
      const isInPast = difference > 6e7; // 1 hour
      let errorMsg = null;

      if (!this.standupDialog.date) {
        errorMsg = 'Chybí datum standupu.';
      } else if (isInPast) {
        errorMsg = 'Datum standupu je v minulosti.';
      }

      if (errorMsg) {
        this.$store.commit('setErrorState', {message: errorMsg});
        return;
      }
      await this.$store.dispatch(action, this.standupDialog);
      this.resetStandup();
    },
    async deleteStandup(standup) {
      const confirmed = confirm(`Opravdu chcete smazat standup ${this.formatDate(standup.date)}?`);
      this.standupDialog = {
        id: standup.id,
        date: parse(standup.date),
        selectedDate: this.selectedDate,
      };

      if (confirmed) {
        await this.$store.dispatch('deleteStandup', this.standupDialog);
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

.standup-button {
  margin-right: 30px;
}

.element {
  font-size: 1.5em !important;
}

.pad {
  padding-right: 2%;
}

.margin {
  margin-right: 2%;
}

.header {
  font-size: 3em !important;
}

.material-icons.alert-icon {
  color:#c62828;
  vertical-align: top;
}

.align-project {
  display: inline-block;
}

.select-wrapper {
  max-width: 350px;
}

.table__row-bottom-border {
  border-bottom: 1px solid rgba(0,0,0,0.12);
}
</style>
