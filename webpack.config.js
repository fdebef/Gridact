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
        options: { presets: ['@babel/env'] }
      }, {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }, {
        test: /\.scss$/,
        use: [{
          loader: 'style-loader' // creates style nodes from JS strings
        },
        {
          loader: 'css-loader' // translates CSS into CommonJS
        },
        {
          loader: 'postcss-loader', // Run post css actions
          options: {
            plugins() { // post css plugins, can be exported to postcss.config.js
              return [
                require('precss'),
                require('autoprefixer')
              ];
            }
          }
        },
        {
          loader: 'sass-loader' // compiles Sass to CSS
        }
        ]
      },
    ]
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
