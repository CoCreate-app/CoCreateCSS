const path = require("path")

const { CleanWebpackPlugin } = require("clean-webpack-plugin")
const TerserPlugin = require("terser-webpack-plugin")
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

let isProduction = process.env.NODE_ENV === "production"

module.exports = {
  entry: {
    CoCreateCSS: "./src/index.js",
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: isProduction ? "[name].min.js" : "[name].js",
    chunkFilename: isProduction ? '[name].min.js' : '[name].js',
    libraryTarget: "umd",
    libraryExport: "default",
    library: ["CoCreate", "css"],
    globalObject: "this",
    ...(isProduction ? { /*publicPath: 'https://cdn.cocreate.app/',*/ } : {}),
  },

  plugins: [
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
        filename: isProduction ? 'CoCreate.min.css' : 'CoCreate.css',
    }),
  ],

  mode: isProduction ? "production" : "development",
  module: {
    rules: [
      {
        test: /.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: "babel-loader",
          options: {
            plugins: ["@babel/plugin-transform-modules-commonjs"],
          },
        },
      },
      {
        test: /.css$/i,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader'
        ]
      },
    ],
  },

  // add source map
  ...(isProduction ? {} : { devtool: "eval-source-map" }),

  optimization: {
    minimize: true,
    minimizer: [
      new CssMinimizerPlugin(),
      new TerserPlugin({
        extractComments: true,
        // cache: true,
        parallel: true,
        // sourceMap: true, // Must be set to true if using source-maps in production
        terserOptions: {
          compress: {
            drop_console: true,
          },
        },
      }),
    ]
  },
}
