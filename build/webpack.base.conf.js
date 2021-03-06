const DllLinkPlugin = require('dll-link-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack')
const util = require('./util');
const path = require('path')
const PROHtmlPlugins = () => {
  return util.IS_PROD ? [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, '../index.html'),
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true,
      },
      // favicon:path.resolve(__dirname, '../favicon.png'),
      chunksSortMode:'none'
    })
  ] : [new HtmlWebpackPlugin({
    template: path.resolve(__dirname, '../index.html'),
    chunksSortMode:'none'
  })]
}
module.exports = {
  mode: process.env.NODE_ENV,
  entry: {
    app: './src/main.js',
  },
  output: {
    path: util.resolve('dist'),
    filename: 'js/[name].[hash].js',
    chunkFilename: 'js/[id].[chunkhash].js',
  },
  resolve: {
    extensions: ['.js', '.vue', '.json'],
    alias: {
      vue$: 'vue/dist/vue.js',
      '@': util.resolve('src'),
      'packages':util.resolve('packages')
    },
  },
  module: {
    rules: [
      ...util.eslint,
      ...util.cssLoaders,
      {
        test: /\.js$/,
        use: [
          ...util.optimizeLoaders('cache-babel', 'js'),
          'babel-loader?cacheDirectory',
        ],
        include: util.resolve('src'),
      },
      {
        test: /\.vue$/,
        use: [
          ...util.optimizeLoaders('cache-vue', 'vue'),
          {
            loader: 'vue-loader',
            options: {
              cacheBusting: true,
              transformToRequire: {
                video: ['src', 'poster'],
                source: 'src',
                img: 'src',
                image: 'xlink:href',
              },
            },
          },
        ],
        include: [util.resolve('src'),util.resolve('packages')],
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10240,
          name: 'images/[name].[hash:7].[ext]',
        },
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10240,
          name: 'media/[name].[hash:7].[ext]',
        },
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10240,
          name: 'fonts/[name].[hash:7].[ext]',
        },
      },
    ],
  },
  plugins: [
    ...PROHtmlPlugins(),
    new DllLinkPlugin({
      config: require('./webpack.dll.conf.js'),
      htmlMode: true,
    }),
    new VueLoaderPlugin(),
    new webpack.ProvidePlugin({
      'd3': 'd3'
    })
  ],
  stats: {
    children: false, // 避免过多子信息
    builtAt: true, // 添加构建日期和构建时间信息
    cached: true, // 添加缓存（但未构建）模块的信息
    cachedAssets: true, // 显示缓存的资源（将其设置为 `false` 则仅显示输出的文件）
  }
};