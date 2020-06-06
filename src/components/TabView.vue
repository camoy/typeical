<template>
  <div>
    <h1>TypeVis for R</h1>
    <v-tabs v-model="tab">
      <v-tab :key="typevis" href="#tab-typevis"> TypeVis </v-tab>
      <v-tab :key="settings" href="#tab-settings"> Settings </v-tab>
      <v-tab :key="about" href="#tab-about"> About </v-tab>
    </v-tabs>
    <v-tabs-items v-model="tab" touchless="true">
      <v-tab-item class="fill-height" :key="typevis" value="tab-typevis">
        <v-container id="panels-container">
          <v-row>
            <v-col id="flow-panel" cols="8">
              <FlowPanel />
            </v-col>
            <v-col id="nav-panel" cols="3">
              <NavPanel />
            </v-col>
          </v-row>
        </v-container>
      </v-tab-item>
      <v-tab-item :key="settings" value="tab-settings">
        <SettingsPanel />
      </v-tab-item>
      <v-tab-item :key="about" value="tab-about">
        <AboutPanel />
      </v-tab-item>
    </v-tabs-items>
  </div>
</template>

<style>
h1 {
  margin-bottom: 0.5rem;
}
/* These are hacks to get the tab items to be full height. */
.v-tabs {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.v-window {
  flex: 1;
}
.v-window__container,
.v-window-item,
.v-window-item .container,
.v-window-item .row,
.v-window-item .col {
  height: 100% !important;
}

#panels-container {
  max-height: 680px;
  min-width: 1050px;
}

#flow-panel {
  min-width: 1050px;
  padding: 4px;
  margin-bottom: 10px;
}
#nav-panel {
  min-width: 454px;
  padding: 4px;
  margin-left: auto;
  margin-right: auto;
}
@media (max-width: 1704px) {
  #nav-panel {
    min-width: 900px;
  }
}
</style>

<script>
//
// Imports
//
import FlowPanel from "./FlowPanel";
import NavPanel from "./NavPanel";
import SettingsPanel from "./SettingsPanel";
import AboutPanel from "./AboutPanel";

//
// Exports
//
export default {
  name: "TabView",

  components: {
    FlowPanel,
    NavPanel,
    SettingsPanel,
    AboutPanel
  },

  data: () => ({
    tab: 0
  })
};
</script>
