const path = require('path')
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin')

module.exports = ({ config }) => {
  config.resolve.modules = [path.resolve(__dirname, '..'), 'node_modules']
  config.resolve.plugins = [new TsconfigPathsPlugin()]
  return config
}
