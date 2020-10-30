<template>
  <v-dialog v-model="isOpen" max-width="500px">
    <v-card>
      <v-card-title>
        <span class="headline">{{ projectDialogTitle }}</span>
      </v-card-title>
      <v-form ref="form" lazy-validation @submit.prevent>
        <v-card-text>
          <v-row class="pl-4 pr-4">
            <v-text-field v-model="modalItem.code" :rules="[rules.required]" label="Projekt" />
          </v-row>
          <v-row class="pl-4 pr-4">
            <v-text-field v-model="modalItem.slackChannelName" :rules="[rules.required]" label="Název slack kanálu" />
          </v-row>
          <v-row class="pl-4 pr-4">
            <v-text-field v-model="modalItem.description" label="Popis" />
          </v-row>
          <v-row class="pl-4 pr-4">
            <v-checkbox v-model="modalItem.isActive" label="Aktivní" />
          </v-row>
          <v-row class="pl-4 pr-4">
            <v-select
              v-model="modalItem.meetingTimeId"
              :items="formattedMeetingTimesForSelect"
              label="Vyberte čas konání sitdownu"
            />
          </v-row>
          <v-row class="pl-4 pr-4">
            <v-alert transition="fade-transition" :value="errors.error.isVisible" type="error" color="red darken-2">
              {{ errors.error.message }}
            </v-alert>
          </v-row>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn text @click.native="close"> Zrušit </v-btn>
          <v-btn :color="`${this.modalItem.id ? 'blue' : 'green'} darken-2`" dark @click.native="save"> Uložit </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'ProjectDialog',
  data() {
    return {
      isOpen: false,
      rules: {
        required: value => !!value || 'Povinné.',
      },
      modalItem: {
        id: null,
        code: '',
        description: '',
        isActive: true,
        meetingTimeId: null,
        slackChannelName: null,
      },
      defaultModalItem: {
        id: null,
        code: '',
        description: '',
        isActive: true,
        meetingTimeId: null,
        slackChannelName: null,
      },
    };
  },
  computed: {
    ...mapState(['errors', 'meetingTimes']),
    projectDialogTitle() {
      return this.modalItem.id ? 'Editovat projekt' : 'Vytvořit projekt';
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
  },
  methods: {
    openDialog(project) {
      if (project) {
        this.modalItem = {
          id: project.id,
          code: project.code,
          description: project.description,
          isActive: project.isActive,
          meetingTimeId: project.meetingTime.value,
          slackChannelName: project.slackChannelName,
        };
      }
      this.isOpen = true;
    },
    async save() {
      if (this.$refs.form.validate()) {
        const action = this.modalItem.id ? 'projects/editProject' : 'projects/createProject';
        await this.$store.dispatch(action, this.modalItem);
        await this.$store.dispatch('projects/getProjects');
        await this.$store.dispatch('projects/getAllProjects');
        !this.errors.error.isVisible && this.close();
      }
    },
    close() {
      this.isOpen = false;
      this.$refs.form.resetValidation();
      this.modalItem = { ...this.defaultModalItem };
      this.$store.commit('errors/clearErrorState');
    },
  },
};
</script>

<style scoped></style>
