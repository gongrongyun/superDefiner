const path = require('path');

module.exports = {
  entry: './src/Entry.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          { loader: 'ts-loader' },
          { loader: 'tslint-loader' }
        ]
      },
      {
        test: /\.(png|jpg|gif)/,
        use:[
          { loader: 'url-loader' }
        ]
      }
    ]
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ]
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist/')
  }
};
