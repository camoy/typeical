<template>
  <div>
    <h1>TYPEical for R</h1>
    <p class="authors">
      <a href="http://camoy.name">Cameron Moy</a>,
      <a href="https://julbinb.github.io/">Julia Belyakova</a>,
      <a href="https://reallytg.github.io/">Alexi Turcotte</a>,
      <a href="https://picorana.github.io/">Sara Di Bartolomeo</a>,
      <a href="https://cody.khoury.northeastern.edu/">Cody Dunne</a>
    </p>
    <v-tabs>
      <v-tab key="main" to="/"> TYPEical </v-tab>
      <v-tab key="settings" to="/settings"> Settings </v-tab>
      <v-tab key="about" to="/about"> About </v-tab>
      <v-tab key="dataset" to="/dataset"> Dataset </v-tab>
    </v-tabs>
    <router-view />
  </div>
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

.authors {
    margin-top: 0 !important;
}
</style>

<script>
//
// Exports
//
export default { name: "TabView" };
</script>
