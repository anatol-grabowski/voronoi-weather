const { commonConfig, resolveApp } = require('./webpack.config.common')

const config = {
  ...commonConfig,
  mode: 'development',
  devtool: 'eval-source-map',
  devServer: {
    port: 8080,
    contentBase: [
      resolveApp('public'),
    ],
    // compress: true,
    // hot: true,
  },
}
module.exports = config
