<template>
  <div>
    <v-layout row reverse>

      <v-dialog v-if="isAdmin() || isUser()" v-model="noteDialog.isOpen" max-width="500px">
        <v-btn slot="activator" color="primary" right @click="resetNote">
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
                  ></v-combobox>
                </v-flex>
                <v-flex>
                  <date-picker-field v-model="noteDialog.deadlineDate" label="Deadline">
                  </date-picker-field>
                </v-flex>
                <v-flex>
                  <v-textarea v-model="noteDialog.note" label="Poznámka" required></v-textarea>
                </v-flex>
              </v-layout>
            </div>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" flat @click.native="resetNote">Zavřít</v-btn>
              <v-btn color="blue darken-1" flat type="submit">Uložit</v-btn>
            </v-card-actions>
          </v-card>
        </v-form>
      </v-dialog>

      <v-btn v-if="isAdmin()" color="info" right @click="_ => createStandup()">Přidat standup</v-btn>

      <v-flex md1 class="pad">
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
          ></v-text-field>
          <v-date-picker v-model="modalItem.standupMonth" scrollable type="month">
            <v-spacer></v-spacer>
            <v-btn flat color="primary" @click="monthPickerIsOpen = false">Zrušit</v-btn>
            <v-btn flat color="primary" @click="updateStandup($refs.dialogMonth)">OK</v-btn>
          </v-date-picker>
        </v-dialog>
      </v-flex>

    </v-layout>

    <v-layout column justify-center align-center>

      <v-data-table
        :headers='headers'
        :items='rows'
        hide-actions
        fill-height
        no-data-text="Žádná data"
        class='elevation-1 fullscreen'
      >
        <template slot="headers" slot-scope="props">
          <tr>
            <th v-for="h in props.headers">
              <nav>
                <div class="text-xs-center header align-project">{{ h.text }}</div>
                <v-tooltip bottom>
                  <i slot="activator" class="material-icons alert-icon" 
                    v-if="isMissingNote(h.text, h.hasIcon)">
                    report_problem
                  </i>
                  <span>Chybí cíl na další standup</span>
                </v-tooltip>
              </nav>
            </th>
          </tr>
        </template>
        <template slot='items' slot-scope='{ item }'>
          <td class='text-xs-center element'>{{ formatDate(item.standup.date) }}</td>

          <td v-for='(i, itemIndex) in item.ratings' :key='itemIndex'>
            <project-status-picker
              :project-rating='i.rating'
              :project-id='i.projectId'
              :standup-id='i.standupId'
              :disabled='!isAdmin() && !isUser()'
              :date="formatDate(item.standup.date)"
            />
          </td>
        </template>
      </v-data-table>
    </v-layout>
    <note-list @edit="editNote" :editable="isAdmin() || isUser()"></note-list>
  </div>
</template>

<script>
import NoteList from '../components/NoteList';
import ProjectStatusPicker from '../components/ProjectStatusPicker';
import { parse, format, addWeeks, setDay, setHours, getHours } from 'date-fns';
import { mapState } from 'vuex';
import DatePickerField from '../components/DatePickerField';

export default {
  fetch ({ store, params }) {
    return Promise.all([
      store.dispatch('getStandupData'),
      store.dispatch('getNotes'),
    ]);
  },
  computed: {
    ...mapState([
      'notes',
      'projects',
      'standupRatings',
    ]),
    headers () {
      const projects = this.projects.map(project => ({
        text: project.code,
        align: 'center',
        sortable: false,
        value: project.code,
        hasIcon: true,
      }));

      return [
        {
          text: 'Datum',
          align: 'left',
          sortable: false,
          value: 'Datum',
          hasIcon: false,
        },
        ...projects,
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
    noteDialogTitle() {
      return this.noteDialog.id ? 'Upravení cíle' : 'Vytvoření cíle';
    },
  },
  data () {
    return {
      modalItem: {
        standupMonth: null,
      },
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
    };
  },
  methods: {
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

      const isSameMonth = (selectedDate.getMonth() === actualDate.getMonth());
      const isSameYear = (selectedDate.getFullYear() === actualDate.getFullYear());

      if (isSameMonth && isSameYear) {
        this.$store.dispatch('getStandupData');
      } else {
        this.$store.dispatch('getProjectsForMonth', selectedDate);
      }

      this.monthPickerIsOpen = false;
    },
    getRatings (standup) {
      return this.projects.map(p => ({
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

      this.noteDialog = {
        ...this.defaultNoteDialog,
        deadlineDate: date,
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
      if (
        !this.noteDialog.note ||
        !this.noteDialog.deadlineDate ||
        !this.noteDialog.selectedProject ||
        !this.noteDialog.selectedProject.value) {
        return;
      }

      const currentDate = new Date();
      const { deadlineDate } = this.noteDialog;
      const resultDate = setHours(deadlineDate, getHours(currentDate));

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
    async createStandup (i) {
      await this.$store.dispatch('createStandup');
    },
  },
  components: {
    DatePickerField,
    ProjectStatusPicker,
    NoteList,
  },
};
</script>

<style>
.fullscreen {
  width: 100%;
  height: 100%;
}

.element {
  font-size: 1.5em !important;
}

.pad {
  padding-right: 2%;
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

</style>
