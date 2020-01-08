<template>
  <div
    v-if="error"
    class="error-message"
  >
    {{ error }}
  </div>
</template>

<script>
  const handleError = () => {
    return {
      error: `Jejda! Něco se pokazilo.`,
    };
  };
  export default {
    data () {
      return {
        error: null,
      };
    },
    async mounted () {
      try {
        await this.$auth.loginWith('local', {data: {gToken: this.$route.query.token}}).then(this.$router.push('/'));
      } catch (error) {
        return handleError();
      }
    },
  };
</script>

<style scoped>
.error-message {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 2rem;
  font-size: 3rem;
}
</style>
