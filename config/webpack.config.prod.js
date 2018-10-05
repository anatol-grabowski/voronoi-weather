const { commonConfig, resolveApp } = require('./webpack.config.common')
const CopyWebpackPlugin = require('copy-webpack-plugin')

const config = {
  ...commonConfig,
  mode: 'production',
}
config.output.publicPath = '.'
config.plugins.unshift(new CopyWebpackPlugin([
  {
    from: resolveApp('public'),
    to: resolveApp('dist'),
  }
]))

module.exports = config
