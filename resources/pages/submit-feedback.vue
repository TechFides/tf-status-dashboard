<template>
  <v-layout column justify-center align-center>
    <div class="submit-feedback__message">
      <h2>{{ message }}</h2>
      <div v-if="redirect">Budete přesměrováni na hlavní stránku</div>
      <div v-if="!loading && !authenticated">Po přihlášení se pokusíme odeslat zpětnou vazbu znovu</div>
    </div>
  </v-layout>
</template>

<script>
const REDIRECT_TIMEOUT = 4000;

const handleFeedbackError = ({ response }) => {
  const status = response.status;
  const data = {
    loading: false,
    submitted: false,
    redirect: true,
    error: 'Jejda! Něco se pokazilo',
  };

  switch (status) {
    case 409:
      return {
        ...data,
        error: 'Zdá se, že jste tento týden již odeslal(a) svůj feedback',
      };
    default:
      return data;
  }
};

export default {
  validate ({ route, redirect }) {
    const { heatmapWeekId, feedbackEnumId } = route.query;
    if (!heatmapWeekId || !feedbackEnumId) {
      redirect('/');
      return false;
    }
    return true;
  },
  async asyncData ({ route, store, redirect, $axios }) {
    const authenticated = store.state.auth && store.state.auth.loggedIn;
    if (!authenticated) {
      return { loading: false, submitted: false };
    }

    try {
      await $axios.post('/api/feedback', {
        heatmapWeekId: route.query.heatmapWeekId,
        feedbackEnumId: route.query.feedbackEnumId,
      });
      return { loading: false, submitted: true, redirect: true };
    } catch (error) {
      return handleFeedbackError(error);
    }
  },
  computed: {
    authenticated () {
      return this.$store.state.auth.loggedIn;
    },
    message () {
      if (!this.authenticated) {
        return 'Chcete-li odeslat zpětnou vazbu, musíte být přihlášeni';
      }

      if (this.error) {
        return this.error;
      }

      if (!this.loading && this.submitted) {
        return 'Děkujeme vám za vaš feedback';
      }
    },
  },
  watch: {
    redirect: {
      immediate: true,
      handler (val) {
        if (val) {
          this.timeout = setTimeout(() => void this.$router.push('/'), REDIRECT_TIMEOUT);
        }
      },
    },
    async authenticated (val, oldVal) {
      if (val && !oldVal) {
        try {
          await this.$axios.post('/api/feedback', {
            heatmapWeekId: this.$route.query.heatmapWeekId,
            feedbackEnumId: this.$route.query.feedbackEnumId,
          });

          this.setData({ loading: false, submitted: true, redirect: true, error: null });
        } catch (err) {
          this.setData(handleFeedbackError(err));
        }
      }
    },
  },
  data () {
    return {
      loading: true,
      submitted: false,
      redirect: false,
      error: null,
    };
  },
  beforeDestroy () {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
  },
  methods: {
    setData ({ loading, submitted, redirect, error }) {
      this.loading = loading;
      this.submitted = submitted;
      this.redirect = redirect;
      this.error = error;
    },
  },
};
</script>

<style scoped>
.submit-feedback__message {
  box-sizing: border-box;
  text-align: center;
  margin-top: 15%;
}
</style>
