const beforeConfig = require('./src/server/api')

module.exports = {
    publicPath: process.env.BASE_MODE === 'server'
	? '/rtypes-viz-new/'
        : '/',
  devServer: { before: beforeConfig },
  transpileDependencies: ["vuetify"]
};
