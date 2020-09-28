<template>
  <v-dialog v-show="isAdministration()" v-model="isOpen" scrollable max-width="500px">
    <v-form @submit.prevent="createNote">
      <v-card>
        <v-card-title>
          <span class="headline">{{ noteDialogTitle() }}</span>
        </v-card-title>
        <v-card-text style="max-height: 800px">
          <v-row class="pl-4 pr-4">
            <v-combobox v-model="noteDialog.selectedProject" :items="projectNames" required label="Projekt" />
          </v-row>
          <v-row class="pl-4 pr-4">
            <DatePicker v-model="noteDialog.deadlineDate" label="Deadline" required :clearable="false" />
          </v-row>
          <v-row class="pl-4 pr-4">
            <v-textarea v-model="noteDialog.note" label="Poznámka" required />
          </v-row>
          <v-row class="pl-4 pr-4">
            <v-alert transition="fade-transition" :value="errors.error.isVisible" type="error" color="red darken-2">
              {{ errors.error.message }}
            </v-alert>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click.native="resetNote"> Zavřít </v-btn>
          <v-btn color="green darken-2" dark type="submit"> Uložit </v-btn>
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>
</template>

<script>
import { setHours, getHours } from 'date-fns';
import moment from 'moment';
import DatePicker from '../../common/DatePicker';
import { mapState } from 'vuex';

export default {
  name: 'NoteDialog',
  components: {
    DatePicker,
  },
  data() {
    return {
      isOpen: false,
      noteDialog: {
        id: null,
        selectedProject: null,
        deadlineDate: null,
        note: '',
      },
      defaultNoteDialog: {
        id: null,
        project: '',
        note: '',
        deadlineDate: null,
      },
    };
  },
  computed: {
    ...mapState(['errors', 'projects']),
    projectNames() {
      return this.projects.items.map(p => ({
        text: p.code,
        value: p.id,
      }));
    },
  },
  methods: {
    openDialog(note) {
      if (note) {
        this.noteDialog = {
          isOpen: true,
          id: note.id,
          selectedProject: this.projectNames.find(v => v.value === note.projectId),
          deadlineDate: moment(note.deadlineDate).format('YYYY-MM-DD'),
          note: note.text,
        };
      } else {
        this.resetNote();
      }
      this.isOpen = true;
    },
    noteDialogTitle() {
      return this.noteDialog.id ? 'Upravení cíle' : 'Vytvoření cíle';
    },
    resetNote() {
      // set deadline to next monday
      let date = new moment();
      date = date.add(1, 'w');
      date = date.day(1);

      this.$store.commit('errors/clearErrorState');

      this.noteDialog = {
        ...this.defaultNoteDialog,
        deadlineDate: date.format('YYYY-MM-DD'),
      };
      this.isOpen = false;
    },
    async createNote() {
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
        this.$store.commit('errors/setErrorState', { message: errorMsg });
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

      this.isOpen = false;
    },
  },
};
</script>

<style scoped></style>
