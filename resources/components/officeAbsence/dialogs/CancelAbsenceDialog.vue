<template>
  <v-dialog
    v-model="show"
    max-width="400"
    scrollable
    persistent
    @keydown.esc="cancelDialog"
  >
    <v-card>
      <v-card-title class="headline pl-3 systemPrimary">
        Žádost o zrušení nepřítomnosti
      </v-card-title>
      <v-form
        ref="form"
        lazy-validation
        @submit.prevent
      >
        <v-card-text
          class="card-text"
          style="max-height: 800px"
        >
          <v-row>
            <v-col>
              <v-select
                v-model="dialogData.approverId"
                :items="approverItems"
                label="Schvalovatel"
                :rules="[rules.required]"
                no-data-text="Žádný data k dispozici."
                clearable
              />
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="blue darken-1"
            text
            @click.native="cancelDialog"
          >
            Zrušit
          </v-btn>
          <v-btn
            color="blue darken-1"
            text
            @click.native="confirmDialog"
          >
            Potvrdit
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script>
  import { mapState } from 'vuex';

  export default {
    name: 'CancelAbsenceDialog',
    data () {
      return {
        show: false,
        dialogData: {
          approverId: null,
          absenceId: null,
        },
        defaultSelectItems: [],
        rules: {
          required: value => !!value || 'Povinné.',
        },
      };
    },
    computed: {
      ...mapState([
        'approvers',
      ]),
      approverItems () {
        return this.approvers.length ? this.approvers.map(approver => ({
          text: `${approver.firstName} ${approver.lastName}`,
          value: approver.id,
        })): this.defaultSelectItems;
      },
    },
    methods: {
      async openDialog(officeAbsence) {
        this.show = true;
        this.dialogData.absenceId = officeAbsence.id;
        this.dialogData.approverId = officeAbsence.absenceApprover.id;
      },
      async confirmDialog () {
        if (this.$refs.form.validate()) {
          this.cancelDialog();
          await this.$store.dispatch('cancelOfficeAbsence', this.dialogData);
        }
      },
      cancelDialog () {
        this.$refs.form.resetValidation();
        this.show = false;
      },
    },
  };
</script>

<style scoped>

</style>
