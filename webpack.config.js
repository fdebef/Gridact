const path = require('path');

module.exports = {
  mode: 'production',
  entry: {
    index: ['babel-regenerator-runtime', './src/GridAct.js'],
  },
  output:
    {
      path: path.join(__dirname),
      filename:
        'index.js',
      libraryTarget: "commonjs2"
    },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel-loader',
        options: {presets: ['@babel/env']}
      }, {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(svg)$/,
        use: ['@svgr/webpack', require.resolve('url-loader')]
      }]
  },
  resolve: {
    extensions: ['*', '.js', '.jsx']
  },
  externals: {
    "react": "react",
    "react-dom": "react-dom",
    "mdi-react": "mdi-react"
  },
};

//
