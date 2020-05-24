const beforeConfig = require('./src/server/api')

module.exports = {
  devServer: { before: beforeConfig },
  transpileDependencies: ["vuetify"]
};
