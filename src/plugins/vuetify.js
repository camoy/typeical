import Vue from "vue";
import Vuetify from "vuetify/lib";

Vue.use(Vuetify);

export default new Vuetify({
    breakpoint: {
        thresholds: {
          xs: 600,
          sm: 960,
          md: 1704,
          lg: 1904,
        },
        scrollBarWidth: 24,
      },
});
