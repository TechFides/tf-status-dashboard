<template>
  <v-layout
    column
    align-start
  >
    <v-form
      v-model="valid"
      class="settings-form"
    >
      <v-container>
        <h3 class="section-header">
          E-mail pro zpětnou vazbu
        </h3>
        <v-layout
          row
          wrap
          justify-between
        >
          <v-flex>
            <v-select
              v-model="form.feedbackCrontab.weekday"
              :items="weekdays"
              label="Den v týdnu"
              required
            />
          </v-flex>
          <v-flex>
            <v-menu
              ref="menu"
              v-model="menu"
              :close-on-content-click="false"
              :nudge-right="40"
              :return-value.sync="form.feedbackCrontab.time"
              transition="scale-transition"
              max-width="290px"
              min-width="290px"
              full-width
              offset-y
              lazy
            >
              <v-text-field
                slot="activator"
                v-model="form.feedbackCrontab.time"
                label="Čas"
                prepend-icon="access_time"
                readonly
              />
              <v-time-picker
                v-model="form.feedbackCrontab.time"
                format="24hr"
                full-width
                @change="$refs.menu.save(form.feedbackCrontab.time)"
              />
            </v-menu>
          </v-flex>
        </v-layout>
        <v-layout
          row
          justify-end
        >
          <v-btn
            color="info"
            @click="saveSettings"
          >
            Uložit nastavení
          </v-btn>
        </v-layout>
      </v-container>
    </v-form>
  </v-layout>
</template>

<script>
import { WEEK_DAYS } from '../constants';

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
      form: {
        feedbackCrontab: {
          weekday: null,
          time: null,
        },
      },
      menu: false,
    };
  },
  computed: {
    weekdays () {
      return WEEK_DAYS.map((weekday, index) => ({
        text: weekday,
        value: index + 1,
      }));
    },
  },
  async asyncData ({ $axios }) {
    try {
      const response = await $axios.$get('/api/configuration');
      const form = {};
      if (response.feedbackCrontab) {
        form.feedbackCrontab = fromCrontab(response.feedbackCrontab);
      }
      return { form };
    } catch (err) {
      return null;
    }
  },
  methods: {
    async saveSettings () {
      try {
        const { weekday, time } = this.form.feedbackCrontab;
        const settings = {
          feedbackCrontab: toCrontab(weekday, time),
        };
        await this.$axios.$post('/api/configuration', settings);
      } catch (e) {
        console.error(e);
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
</style>
