<template>
  <div>
    <h1>TypeVis for R</h1>
    <v-tabs v-model="tab">
      <v-tab key="main" to="/"> TypeVis </v-tab>
      <v-tab key="settings" to="/settings"> Settings </v-tab>
      <v-tab key="about" to="/about"> About </v-tab>
      <v-tab key="dataset" to="/dataset"> Dataset </v-tab>
    </v-tabs>
    <router-view />
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
</style>

<script>
//
// Exports
//
export default { name: "TabView" };
</script>
