<template>
  <v-layout
    column
    justify-center
    align-center
  >
    <div class="submit-feedback__message">
      <h2>
        {{ message }}
      </h2>
      <h3 v-if="additionalMessage">
        {{ additionalMessage }}
      </h3>
      <div
        v-if="redirect"
        class="redirect-message"
      >
        Budete přesměrováni na hlavní stránku.
      </div>
    </div>
  </v-layout>
</template>

<script>
import { FEEDBACKS } from '../constants';

const REDIRECT_TIMEOUT = 4000;

const handleFeedbackError = ({ response }) => {
  const status = response.status;
  const data = {
    loading: false,
    submitted: false,
    redirect: true,
    error: `Jejda! Něco se pokazilo.`,
  };

  switch (status) {
    case 409:
      data.error = 'Zdá se, že jste tento týden již odeslal(a) svůj feedback.';
      break;
    case 403:
      data.error = 'Doba platnosti tokenu již vypršela.';
      break;
  }

  return data;
};

export default {
  validate ({ route, redirect }) {
    const { token, feedbackEnumId } = route.query;
    if (!token || !feedbackEnumId) {
      redirect('/');
      return false;
    }
    return true;
  },
  data () {
    return {
      loading: true,
      submitted: false,
      redirect: false,
      error: null,
    };
  },
  computed: {
    message () {
      if (this.error) {
        return this.error;
      }

      if (!this.loading && this.submitted) {
        return 'Děkujeme vám za vaš feedback.';
      }

      return null;
    },
    additionalMessage () {
      if (!this.loading && this.submitted) {
        const { feedbackEnumId } = this.$route.query;
        switch (parseInt(feedbackEnumId, 10)) {
          case FEEDBACKS.AMAZING:
            return 'Jsme rádi, že váš týden byl úžasný.';
          case FEEDBACKS.GOOD:
            return 'Jsme rádi, že váš týden byl dobrý.';
          case FEEDBACKS.BAD:
            return 'Je nám líto, že váš týden byl špatný.';
          case FEEDBACKS.HORRIBLE:
            return 'Je nám líto, že váš týden byl hrozný.';
        }
      }
      return null;
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
  },
  async asyncData ({ route, store, redirect, $axios }) {
    try {
      await $axios.post('/api/feedback', {
        token: route.query.token,
        feedbackEnumId: route.query.feedbackEnumId,
      });
      return { loading: false, submitted: true, redirect: true };
    } catch (error) {
      return handleFeedbackError(error);
    }
  },
  beforeDestroy () {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
  },
};
</script>

<style scoped>
.submit-feedback__message {
  box-sizing: border-box;
  text-align: center;
  margin-top: 15%;
}

.redirect-message {
  margin-top: 5px;
}
</style>
