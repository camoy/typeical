<template>
<v-tabs>
  <v-tab key="typevis" href="#tab-typevis"> TypeVis </v-tab>
  <v-tab key="settings" href="#tab-settings"> Settings </v-tab>
  <v-tab key="about" href="#tab-about"> About </v-tab>
  <v-tab-item class="fill-height" key="typevis" value="tab-typevis">
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
  <v-tab-item key="settings" value="tab-settings">
    <SettingsPanel />
  </v-tab-item>
  <v-tab-item key="about" value="tab-about">
    <AboutPanel />
  </v-tab-item>
</v-tabs>
</template>

<style>
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
    margin-bottom: 36px;
}
#nav-panel {
    min-width: 420px;
    padding: 4px;
    margin: auto;
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
  }
};
</script>
