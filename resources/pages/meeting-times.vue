<template>
  <v-layout column justify-center align-end>
    <v-btn @click="createNewSitDown" color="primary" dark>
      <i class="material-icons">add</i>
      NOVÝ SITDOWN
    </v-btn>

    <v-card class='elevation-1 fullscreen'>
      <v-layout align-center justify-end>
        content
      </v-layout>
    </v-card>
  </v-layout>
</template>

<script>
  export default {
    computed: {
    },
    data () {
      return {
      };
    },
    methods: {
      createNewSitDown () {
      },
    },
  };
</script>
