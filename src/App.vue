<template>
  <v-app>
    <v-content>
      <v-container class="fill-height" fluid>
        <v-row align="center" justify="center">
          <v-col cols="10" style="height: 90vh; background-color: red;">
            <TabView />
          </v-col>
        </v-row>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
import TabView from "./components/TabView";

export default {
  name: "App",

  components: {
    TabView
  },

  data: () => ({
    //
  })
};
</script>
