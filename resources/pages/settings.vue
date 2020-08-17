<template>
  <v-layout
    column
    align-start
    class="padding-content"
  >
    <v-form
      v-model="valid"
      class="settings-form"
      @submit.prevent="saveSettings"
    >
      <v-container>
        <v-row
          justify="start"
        >
          <h3 class="section-header">
            E-mail pro zpětnou vazbu
          </h3>
        </v-row>
        <v-row
          justify="space-between"
        >
          <v-col>
            <v-select
              v-model="form.feedbackCrontab.weekday"
              :items="weekdays"
              label="Den v týdnu"
              required
            />
          </v-col>
          <v-col>
            <v-menu
              ref="menu"
              v-model="menu"
              :close-on-content-click="false"
              :nudge-right="40"
              :return-value.sync="form.feedbackCrontab.time"
              transition="scale-transition"
              max-width="290px"
              min-width="290px"
              offset-y
            >
              <template v-slot:activator="{ on, attrs }">
                <v-text-field
                  slot="activator"
                  v-model="form.feedbackCrontab.time"
                  label="Čas"
                  prepend-icon="access_time"
                  readonly
                  v-bind="attrs"
                  v-on="on"
                />
              </template>
              <v-time-picker
                v-model="form.feedbackCrontab.time"
                format="24hr"
                header-color="blue darken-2"
                color="blue darken-2"
                full-width
                @change="$refs.menu.save(form.feedbackCrontab.time)"
              />
            </v-menu>
          </v-col>
        </v-row>
        <v-row
          justify="start"
        >
          <h3 class="section-header">
            Slack kanály
          </h3>
        </v-row>
        <v-row>
          <v-col cols="4">
            <v-text-field
              v-model="form.slackErrorChannel"
              type="string"
              label="Slack kanál pro chybové hlášky"
            />
          </v-col>
          <v-col cols="4">
            <v-text-field
              v-model="form.slackSchedulerChannel"
              type="string"
              label="Slack kanál pro sitdown"
            />
          </v-col>
          <v-col cols="4">
            <v-text-field
              v-model="form.slackAbsenceChannel"
              type="string"
              label="Slack kanál pro nepřítomnost v kanceláři"
            />
          </v-col>
        </v-row>
        <v-row
          justify="start"
        >
          <h3 class="section-header">
            Nepřítomnosti v kanceláři
          </h3>
        </v-row>
        <v-row
          justify="start"
        >
          <v-col cols="4">
            <v-select
              v-model="form.absenceApproverId"
              :items="approvers"
              label="Defaultní schvalovatel nepřítomnosti v kanceláři"
              required
            />
          </v-col>
        </v-row>
        <v-row
          row
          justify="end"
        >
          <v-btn
            color="blue darken-2"
            dark
            type="submit"
            :loading="loading"
          >
            Uložit nastavení
          </v-btn>
        </v-row>
      </v-container>
    </v-form>
  </v-layout>
</template>

<script>
import { WEEK_DAYS } from '../constants';
import { mapState } from 'vuex';

const fromCrontab = (crontab) => {
  const [minutes, hours, , , weekday] = crontab.split(' ');
  return { weekday: parseInt(weekday, 10), time: `${hours}:${minutes}` };
};

const toCrontab = (weekday, time) => {
  const [hours, minutes] = time.split(':');
  return `${minutes} ${hours} * * ${weekday}`;
};

export default {
  data () {
    return {
      valid: false,
      loading: false,
      form: {
        slackErrorChannel: '',
        slackSchedulerChannel: '',
        slackAbsenceChannel: '',
        absenceApproverId: null,
        feedbackCrontab: {
          weekday: null,
          time: null,
        },
      },
      menu: false,
    };
  },
  computed: {
    ...mapState([
      'users',
    ]),
    weekdays () {
      return WEEK_DAYS.map((weekday, index) => ({
        text: weekday,
        value: index + 1,
      }));
    },
    approvers () {
      return this.users.map(user => ({
        text: `${user.firstName} ${user.lastName}`,
        value: user.id.toString(),
      }));
    },
  },
  async asyncData ({ $axios }) {
    try {
      const response = await $axios.$get('/api/configuration');
      let form = {};
      if (response) {
        form = {
          feedbackCrontab: fromCrontab(response.feedbackCrontab),
          slackErrorChannel: response.slackErrorChannel,
          slackSchedulerChannel: response.slackSchedulerChannel,
          slackAbsenceChannel: response.slackAbsenceChannel,
          absenceApproverId: response.absenceApproverId,
        };
      }
      return { form };
    } catch (err) {
      return null;
    }
  },
  async fetch ({ store }) {
    await store.dispatch('getUsers');
  },
  methods: {
    async saveSettings () {
      try {
        this.loading = true;

        const { weekday, time } = this.form.feedbackCrontab;
        const settings = {
          feedbackCrontab: toCrontab(weekday, time),
          slackErrorChannel: this.form.slackErrorChannel,
          slackSchedulerChannel: this.form.slackSchedulerChannel,
          slackAbsenceChannel: this.form.slackAbsenceChannel,
          absenceApproverId: this.form.absenceApproverId,
        };

        await this.$axios.$post('/api/configuration', settings);
      } catch (e) {
        this.$store.commit('setNotification', { color: 'error', message: 'Aktualizace nastavení se nezdařila.' });
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
  .settings-form {
    width: 100%;
  }

  .section-header {
    margin-bottom: 5px;
  }

  .padding-content {
    padding: 1rem;
  }
</style>
