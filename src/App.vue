<template>
<v-app>
  <v-content>
    <v-container class="fill-height" fluid>
      <v-row justify="center">
        <v-col id="app-vcol" cols="11">
          <TabView />
        </v-col>
      </v-row>
    </v-container>
  </v-content>
</v-app>
</template>

<style>
  #app-vcol {
    height: 90vh;
  }
</style>

<script>
import TabView from "./components/TabView";

export default {
  name: "App",
  components: { TabView }
};
</script>
