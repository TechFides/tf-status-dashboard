
<template>
  <v-layout
    column
    justify-center
    align-center
  >
    <v-flex>
      <div
        v-if="submitted"
        class="submit-feedback__message"
      >
        <v-img
          class="thumb-up"
          src="/thumbs_up.gif"
          max-height="125"
          max-width="125"
        />
        <h2>
          <strong>Díky moc za zpětnou vazbu!</strong>
        </h2>
        <div>
          Pomůže nám tvořit takové prostředí, které tě bude bavit, a ve kterém budeš rád. <br> Btw. pokud chceš být konkrétnější,
          neváhej se kdykoliv obrátit přímo na Matouše nebo Vaška <br> - spokojenost lidí v TechFides je a bude vždy naší důležitou prioritou.
        </div>
      </div>
      <div
        v-if="error"
        class="redirect-message"
      >
        <br>
        <br>
        {{ error }}
      </div>
    </v-flex>
  </v-layout>
</template>
<script>

const REDIRECT_TIMEOUT = 10000;

const handleFeedbackError = ({ response }) => {
  const status = response.status;
  const data = {
    loading: false,
    submitted: false,
    error: `Jejda! Něco se pokazilo.`,
  };

  switch (status) {
    case 409:
      data.error = 'Zdá se, že jste tento týden již odeslal(a) svůj feedback.';
      break;
    case 403:
          data.error = 'Doba platnosti tokenu již vypršela.';
          break;
    case 404:
        data.error = 'Token neexistuje :(';
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

.thumb-up{
  margin: 0 auto;
  margin-top: 100px;
}
.submit-feedback__message {
  text-align: center;
  font-size: 150%;
}

.redirect-message {
  margin-top: 5px;
}
</style>
