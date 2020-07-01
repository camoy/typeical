import Vue from "vue";
import VueRouter from "vue-router";

import store from "./store";
import vuetify from "./plugins/vuetify";
import App from "./App.vue";

import MainPanel from "./components/MainPanel";
import SettingsPanel from "./components/SettingsPanel";
import AboutPanel from "./components/AboutPanel";
import DatasetPanel from "./components/DatasetPanel";

Vue.config.productionTip = false;

const routes = [
  { path: "/", component: MainPanel },
  { path: "/settings", component: SettingsPanel },
  { path: "/dataset", component: DatasetPanel },
  { path: "/about", component: AboutPanel }
];

const router = new VueRouter({
  base: process.env.BASE_URL,
  mode: "history",
  routes
});

Vue.use(VueRouter);
new Vue({
  store,
  vuetify,
  router,
  render: h => h(App)
}).$mount("#app");
