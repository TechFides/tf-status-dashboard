<template>
  <v-dialog v-model="show" max-width="400" scrollable persistent @keydown.esc="cancelDialog">
    <v-card>
      <v-card-title class="headline pl-3 systemPrimary dialogTitle">{{ title }}</v-card-title>
      <v-card-actions>
        <v-spacer />
        <v-btn text @click.native="cancelDialog"> Zrušit </v-btn>
        <v-btn color="red darken-2" dark @click.native="confirmDialog"> Potvrdit </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'ConfirmDialog',
  props: {
    defaultTitle: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      show: false,
      title: '',
      confirmAction: () => {},
    };
  },
  methods: {
    async openDialog(params) {
      this.show = true;
      this.title = params.title || this.defaultTitle;
      this.confirmAction = params.confirmAction;
    },
    async confirmDialog() {
      await this.confirmAction();
      this.cancelDialog();
    },
    async cancelDialog() {
      this.show = false;
    },
  },
};
</script>

<style scoped>
.dialogTitle {
  word-break: normal;
}
</style>
