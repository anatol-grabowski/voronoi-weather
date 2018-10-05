const fs = require('fs')
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const appDirectory = fs.realpathSync(process.cwd())
const resolveApp = relativePath => path.resolve(appDirectory, relativePath); 

const config = {
  watch: false,
  entry: resolveApp('src/index.js'),
  output: {
    path: resolveApp('dist'),
    filename: 'bundle.js',
    publicPath: '/',
  },
  module: {
    rules: [
    ],
  },
  optimization: {
    minimize: false,
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: resolveApp('public/index.html'),
      filename: resolveApp('dist/index.html'),
      hash: true,
    }),
  ],
}

exports.commonConfig = config
exports.resolveApp = resolveApp