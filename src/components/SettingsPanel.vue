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
export default {
    name: "SettingsPanel",
    created() { this.$store.dispatch("queryAnalyzed"); },
    watch: {
        selectedAnalyzed(pkgs) {
            this.$store.commit("analyzed", pkgs);
            this.$store.dispatch("queryPkgs");
            this.$store.dispatch("queryTypes");
        },
    },
    data: () => ({ selectedAnalyzed: [] })
}
</script>
