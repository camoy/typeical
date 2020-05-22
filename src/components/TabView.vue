<template>
  <v-tabs>
    <v-tab key="typevis" href="#tab-typevis"> TypeVis </v-tab>
    <v-tab key="settings" href="#tab-settings"> Settings </v-tab>
    <v-tab-item key="typevis" value="tab-typevis">
      <v-container>
        <v-row>
          <v-col cols="8" style="background-color: blue;">
            <FlowPanel />
          </v-col>
          <v-col cols="4" style="background-color: purple;">
            <NavPanel />
          </v-col>
        </v-row>
      </v-container>
    </v-tab-item>
    <v-tab-item key="settings" value="tab-settings">
      <SettingsPanel />
    </v-tab-item>
  </v-tabs>
</template>

<script>
import FlowPanel from "./FlowPanel";
import NavPanel from "./NavPanel";
import SettingsPanel from "./SettingsPanel";

export default {
  name: "TabView",

  components: {
    FlowPanel,
    NavPanel,
    SettingsPanel
  },

  data: () => ({
    //
  })
};
</script>
