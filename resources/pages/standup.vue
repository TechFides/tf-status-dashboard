<template>
  <div>
    <v-layout
      row
      reverse
    >
      <div
        v-if="gifDialog.isOpen"
        class="gif"
      >
        <v-img
          width="100%"
          height="100%"
          style="position:absolute"
          :src="gifDialog.url"
        />
      </div>
      <v-dialog
        v-show="isAdministration()"
        v-model="noteDialog.isOpen"
        max-width="500px"
        :persistent="true"
      >
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            color="green darken-2"
            dark
            right
            class="margin button"
            v-bind="attrs"
            v-on="on"
            @click="resetNote"
          >
            <i class="material-icons">add</i>
            Přidat cíl
          </v-btn>
        </template>
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
                :value="errors.error.isVisible"
                type="error"
                color="red darken-2"
              >
                {{ errors.error.message }}
              </v-alert>
            </div>
            <v-card-actions>
              <v-spacer />
              <v-btn
                color="blue darken-1"
                text
                @click.native="resetNote"
              >
                Zavřít
              </v-btn>
              <v-btn
                color="blue darken-1"
                text
                type="submit"
              >
                Uložit
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-form>
      </v-dialog>

      <v-btn
        v-show="isAdministration()"
        class="standup-button"
        color="light-blue accent-4"
        dark
        @click="createStandup()"
      >
        <i class="material-icons">add</i>
        Přidat standup
      </v-btn>
      <v-dialog
        v-model="standupDialog.isOpen"
        max-width="500px"
        :persistent="true"
      >
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
              :value="errors.error.isVisible"
              type="error"
              color="red darken-2"
            >
              {{ errors.error.message }}
            </v-alert>
          </div>
          <v-card-actions>
            <v-spacer />
            <v-btn
              color="blue darken-1"
              text
              @click.native="resetStandup"
            >
              Zavřít
            </v-btn>
            <v-btn
              color="blue darken-1"
              text
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
          width="290px"
          light
        >
          <template v-slot:activator="{ on, attrs }">
            <v-text-field
              v-model="modalItem.standupMonth"
              label="Měsíc"
              append-icon="event"
              readonly
              v-bind="attrs"
              v-on="on"
            />
          </template>
          <v-date-picker
            v-model="modalItem.standupMonth"
            scrollable
            type="month"
            header-color="blue darken-2"
            color="blue darken-2"
          >
            <v-spacer />
            <v-btn
              text
              color="primary"
              @click="monthPickerIsOpen = false"
            >
              Zrušit
            </v-btn>
            <v-btn
              text
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
        :items-per-page="999"
        hide-default-header
        hide-default-footer
        fill-height
        no-data-text="Žádná data"
        class="elevation-1 fullscreen"
      >
        <template
          v-slot:header="{ props }"
        >
          <thead>
            <tr>
              <th
                v-for="h in props.headers"
                :key="h.text"
                class="text-center header-text"
              >
                <span class="project-name">
                  <div class="text-xs-center header align-project">
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
                    <span>Chybí cíl na další standup</span>
                  </v-tooltip>
                </span>
              </th>
            </tr>
          </thead>
          <thead>
            <tr>
              <th
                v-for="h in props.headers"
                :key="h.text"
                class="text-center header-text"
              >
                {{ h.meetingTime ? h.meetingTime.dayAndTime : '' }}
              </th>
            </tr>
          </thead>
        </template>
        <template
          v-slot:item="props"
        >
          <tr>
            <td class="text-center element">
              {{ formatDate(props.item.standup.date) }}
            </td>

            <td
              v-for="(i, itemIndex) in props.item.ratings"
              :key="itemIndex"
              class="text-center"
            >
              <project-status-picker
                :project-rating="i.rating"
                :project-id="i.projectId"
                :standup-id="i.standupId"
                :disabled="!isAdministration()"
                :date="formatDate(props.item.standup.date)"
                :on-submit="openGifDialog"
              />
            </td>
            <td class="text-center px-0">
              <v-icon
                class="mr-2"
                @click="editStandup(props.item.standup)"
              >
                edit
              </v-icon>
              <v-icon
                @click="deleteStandup(props.item.standup)"
              >
                delete
              </v-icon>
            </td>
          </tr>
        </template>
      </v-data-table>
    </v-layout>
    <note-list
      :editable="isAdministration()"
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
      GIF_ANIMATION_DURATION: 5500,
      gifDialog: {
        isOpen: false,
        url: '',
      },
      selectedMeetingTimeId: null,
      defaultRating: 8,
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
      'standups',
      'errors',
      'meetingTimes',
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
    rows () {
      return this.standups.ratings.map(standup => ({
        standup: {
          id: standup.id,
          date: standup.date,
        },
        ratings: this.getRatings(standup),
      }));
    },
    projectNames () {
      return this.projects.items.map(p => ({
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
        ...this.meetingTimes.items.map(meetingTime => ({
          text: meetingTime.dayAndTime,
          value: meetingTime.id,
        })),
      ];
    },
  },
  fetch ({ store, params }) {
    return Promise.all([
      store.dispatch('standups/getStandupData'),
      store.dispatch('notes/getNotes'),
      store.dispatch('meetingTimes/getMeetingTimes'),
      store.dispatch('projects/getProjects'),
    ]);
  },
  methods: {
    sortProjectsByMeetingTime () {
      const projectsWithoutMeetingTime = this.projects.items.filter(project => project.meetingTime.time === null);
      const sortedProjectsWithMeetingTime = this.projects.items
        .filter(project => project.meetingTime.time !== null)
        .sort((a, b) => this.sortByDayAndTime(a.meetingTime, b.meetingTime));

      return [...sortedProjectsWithMeetingTime, ...projectsWithoutMeetingTime];
    },
    sortByDayAndTime (timeA, timeB) {
      if (timeA.weekDayId !== timeB.weekDayId) {
        return timeA.weekDayId - timeB.weekDayId;
      }

      if  (timeA.time !== timeB.time) {
        return timeA.time > timeB.time ? 1 : -1;
      }

      return 0;
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
        this.$store.dispatch('standups/getStandupData', selectedDate);
      } else {
        this.$store.dispatch('standups/getProjectsForMonth', selectedDate);
      }

      this.monthPickerIsOpen = false;
    },
    getRatings (standup) {
      return this.getFilteredProjectsBySelectedMeetingTime(this.sortProjectsByMeetingTime()).map(p => ({
        standupId: standup.id,
        projectId: p.id,
        rating: standup.standupProjectRating[p.id] >= 0 ? standup.standupProjectRating[p.id] : this.defaultRating,
      }));
    },
    resetNote () {
      // set deadline to next monday
      let date = new Date();
      date = addWeeks(date, 1);
      date = setDay(date, 1);

      this.$store.commit('errors/clearErrorState');

      this.noteDialog = {
        ...this.defaultNoteDialog,
        deadlineDate: date,
      };
    },
    resetStandup () {
      const date = new Date();

      this.$store.commit('errors/clearErrorState');

      this.standupDialog = {
        isOpen: false,
        date: date,
      };
    },
    isMissingNote (projectCode, hasIcon) {
      const date = format(new Date(), 'YYYY-MM-DD 00:00:00');
      const hasNoteAfterDeadline = this.notes.items.some(element => {
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

      if (errorMsg) {
        this.$store.commit('errors/setErrorState', {message: errorMsg});
        return;
      }

      const note = {
        id: this.noteDialog.id,
        projectId: this.noteDialog.selectedProject.value,
        deadlineDate: resultDate.toISOString(),
        note: this.noteDialog.note,
      };

      if (note.id) {
        await this.$store.dispatch('notes/editNote', note);
      } else {
        await this.$store.dispatch('notes/createNote', note);
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
    openGifDialog () {
      this.gifDialog.isOpen = true;
      this.gifDialog.url = "/giphy.gif"+"?a="+Math.random();

      setTimeout(() => this.gifDialog.isOpen = false, this.GIF_ANIMATION_DURATION);
    },
    async save () {
      const action = this.standupDialog.id ? 'standups/editStandup' : 'standups/createStandup';
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
        this.$store.commit('errors/setErrorState', {message: errorMsg});
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
        await this.$store.dispatch('standups/deleteStandup', this.standupDialog);
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
    margin-right: 20px;
    margin-top: 6px;
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
    font-size: 2em !important;
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

  .header-text {
    color: rgba(0,0,0,.54) !important;
    font-weight: 500 !important;
    font-size: 1.2em !important;
    padding: 0;
    min-width: 150px;
  }

  .button {
    margin-top: 6px;
  }

  .gif {
    width:600px;
    height:500px;
    position:absolute;
    z-index: 9999;
  }

  .project-name {
    display: flex;
  }
</style>
