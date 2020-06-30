<template>
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
</template>

<style>
#panels-container {
  max-width: 100%;
  padding: 0px;
}

#flow-panel {
  padding: 4px;
  margin-bottom: 6px;
  margin-left: auto;
  margin-right: auto;
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

  .col-8 {
    max-width: 100%;
  }

  #flow-panel {
    flex: 0 0 100%;
  }

  #flow-svg-container.container {
    width: 100%;
    max-width: 100%;
  }

  #flow-svg {
    max-height: 860px;
  }
}
</style>

<script>
//
// Imports
//
import FlowPanel from "./FlowPanel";
import NavPanel from "./NavPanel";

//
// Exports
//
export default {
  name: "MainPanel",

  components: {
    FlowPanel,
    NavPanel
  }
};
</script>
