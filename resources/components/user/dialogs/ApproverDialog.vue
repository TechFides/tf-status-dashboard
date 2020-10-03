<template>
  <v-dialog v-model="show" max-width="500" scrollable persistent @keydown.esc="cancelDialog">
    <v-card>
      <v-card-title class="headline pl-5 systemPrimary"> Nastavit schvalovatele </v-card-title>
      <v-form ref="form" lazy-validation @submit.prevent>
        <v-card-text class="card-text" style="max-height: 800px">
          <v-row class="pl-4 pr-4">
            <v-select
              v-model="dialogData.approverId"
              :items="approverItems"
              label="Schvalovatel"
              :rules="[rules.required]"
              no-data-text="Žádná data k dispozici."
            />
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click.native="cancelDialog"> Zrušit </v-btn>
          <v-btn color="blue darken-2" dark @click.native="confirmDialog"> Potvrdit </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'ApproverDialog',
  data() {
    return {
      show: false,
      dialogData: {
        userId: null,
        approverId: null,
      },
      defaultDialogDate: {
        userId: null,
        approver: null,
      },
      rules: {
        required: value => !!value || 'Povinné.',
      },
    };
  },
  computed: {
    ...mapState(['errors', 'users']),
    approverItems() {
      return this.users.items.map(user => ({
        text: `${user.firstName} ${user.lastName}`,
        value: user.id,
      }));
    },
  },
  methods: {
    openDialog(user) {
      if (user.absenceApprover) {
        this.dialogData.approverId = user.absenceApprover.id;
      }
      this.show = true;
      this.dialogData.userId = user.id;
    },
    async confirmDialog() {
      if (this.$refs.form.validate()) {
        await this.$store.dispatch('users/setApprover', this.dialogData);
        !this.errors.error.isVisible && this.cancelDialog();
      }
    },
    cancelDialog() {
      this.dialogData = { ...this.defaultDialogData };
      this.show = false;
      this.$refs.form.resetValidation();
      this.$store.commit('errors/clearErrorState');
    },
  },
};
</script>
