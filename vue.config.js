const beforeConfig = require('./src/server/api')

module.exports = {
  publicPath: process.env.BASE_MODE === 'server'
	  ? '/rtypes-viz-new/'
    : '/',
  devServer: { 
    before: beforeConfig,
    //proxy: 'http://julia.prl.fit.cvut.cz/rtypes-viz-new/',
  },
  transpileDependencies: ["vuetify"]
};
