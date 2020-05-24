<template>
<div class="pa-10">
<v-form style="width: 60rem">
  <v-autocomplete
    v-model="selectedAnalyzed"
    :items="$store.getters.analyzedNames"
    outlined
    chips
    small-chips
    deletable-chips
    label="Analyzed Packages"
    multiple
    />
</v-form>
</div>
</template>

<script>
  import { mapState } from "vuex";

export default {
    name: "SettingsPanel",
    created() { this.$store.dispatch("queryAnalyzed"); },
    computed: mapState(["analyzed"]),
    watch: {
        selectedAnalyzed(pkgs) {
            this.$store.commit("analyzed", pkgs);
        },
    },
    data: () => ({
        selectedAnalyzed: []
    })
}
</script>
