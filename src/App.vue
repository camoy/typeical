<template>
  <v-app>
    <v-content>
      <v-container fluid>
        <v-row justify="center">
          <v-col id="app-vcol" cols="11">
            <TabView />
          </v-col>
        </v-row>
      </v-container>

      <v-overlay :value="pending > 0">
        <v-progress-circular indeterminate size="64" />
      </v-overlay>
    </v-content>
  </v-app>
</template>

<style>
#app-vcol {
  height: 95vh;
  min-width: 1050px;
}

.v-application--wrap {
  min-height: 100% !important;
}
</style>

<script>
//
// Imports
//
import { mapState } from "vuex";
import TabView from "./components/TabView";

//
// Exports
//
export default {
  name: "App",
  computed: mapState(["pending"]),
  components: { TabView }
};
</script>
