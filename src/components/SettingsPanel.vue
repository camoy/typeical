<template>
  <div class="pa-4">
    <v-form id="settings-form">
      <v-autocomplete
        v-model="$store.state.analyzed"
        outlined
        chips
        small-chips
        deletable-chips
        label="Analyzed Packages"
        multiple
        :items="analyzedNames"
        @input="$store.dispatch('setAnalyzed', $store.state.analyzed)"
      />

      <h3>Visualization</h3>

      <v-checkbox
        v-model="$store.state.horizontalLayout"
        label="Horizontal Layout"
        @change="
          $store.commit('horizontalLayout', $store.state.horizontalLayout)
        "
      />

      <v-checkbox
        v-model="$store.state.flowsJustified"
        label="Flows Justified"
        @change="$store.commit('flowsJustified', $store.state.flowsJustified)"
      />

      <div class="v-input v-input--selection-controls div-setting">
        <select
          v-model="$store.state.flowsPerPage"
          class="num-setting"
          @change="$store.commit('flowsPerPage', $store.state.flowsPerPage)"
        >
          <option
            v-for="(option, k) in validFlows"
            v-bind:value="option"
            :key="'flows-per-page-' + k"
          >
            {{ option }}
          </option>
        </select>
        <label class="v-label label-setting" style="color: rgba(0, 0, 0, 0.6)">
          Type Flows shown per page
        </label>
      </div>

      <v-checkbox
        v-model="$store.state.groupFlowsByFunName"
        label="Flows Grouped by function name"
        @change="
          $store.commit('groupFlowsByFunName', $store.state.groupFlowsByFunName)
        "
      />

      <h3>Data Search and Filtering</h3>

      <div>
        <v-checkbox
          v-model="$store.state.details"
          @change="$store.dispatch('setDetails', $store.state.details)"
        >
          <template v-slot:label>
            Request detailed data<span style="width:2px;"></span>
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <span v-bind="attrs" v-on="on" class="fa fa-question-circle" />
              </template>
              <span>
                If selected, detailed class information is requested.
              </span>
            </v-tooltip>
          </template>
        </v-checkbox>
      </div>

      <v-checkbox
        v-model="$store.state.autocompleteWithFuns"
        label="Autocomplete with functions instead of packages"
        @change="
          $store.commit(
            'autocompleteWithFuns',
            $store.state.autocompleteWithFuns
          )
        "
      />

      <v-checkbox
        v-model="$store.state.selectMultipleFuns"
        label="Select multiple functions on the treemap"
        @change="
          $store.commit('selectMultipleFuns', $store.state.selectMultipleFuns)
        "
      />

      <v-checkbox
        v-model="$store.state.clearSelectedFunsOnPkg"
        label="Clear selected functions on package selection"
        @change="
          $store.commit(
            'clearSelectedFunsOnPkg',
            $store.state.clearSelectedFunsOnPkg
          )
        "
      />

      <div class="v-input v-input--selection-controls div-setting">
        <select
          v-model="$store.state.defaultLimit"
          class="num-setting"
          @change="
            $store.dispatch('setDefaultLimit', $store.state.defaultLimit)
          "
        >
          <option
            v-for="(option, k) in validLimits"
            v-bind:value="option"
            :key="'valid-limit-' + k"
          >
            {{ option }}
          </option>
        </select>
        <label class="v-label label-setting" style="color: rgba(0, 0, 0, 0.6)">
          Size of excerpt
        </label>
      </div>
    </v-form>
  </div>
</template>

<style>
h3 {
  padding-top: 16px;
  padding-bottom: 16px;
}

#settings-form {
  min-width: 20rem;
  max-width: 50rem;
}

.label-setting {
  margin-top: 4px;
  margin-left: 8px;
}

.num-setting {
  width: 2rem;
  border: 2px solid #777;
  border-radius: 15%;
  text-align: center;
  text-align-last: center;
  color: rgba(0, 0, 0, 0.6);
  margin-bottom: 16px;
}
</style>

<script>
//
// Imports
//
import { mapState } from "vuex";

//
// Exports
//
export default {
  name: "SettingsPanel",
  created() {
    this.$store.dispatch("queryAnalyzed");
  },
  computed: {
    analyzedNames() {
      return this.allAnalyzed
        ? this.allAnalyzed.map(x => x.package_being_analyzed)
        : [];
    },
    validFlows() {
      return new Array(40).fill(1).map((min, i) => i + min);
    },
    validLimits() {
      return new Array(71).fill(10).map((min, i) => i + min);
    },
    ...mapState(["allAnalyzed"])
  }
};
</script>
