var webpack = require('webpack');

module.exports = {
    entry: './src/index.js',

    output: {
        path: __dirname + '/resourece/',
        filename: 'bundle.js'
    },

    devServer: {
        host: '0.0.0.0',
        port: 3000,
        contentBase: __dirname + '/',
        disableHostCheck: true
    },

    module: {
        loaders: [
            {
                test: /\.js$/,
                loader: ['react-hot-loader/webpack', 'babel-loader?' + JSON.stringify({
                    cacheDirectory: true,
                    presets: ['es2015', 'react']
                })],
                exclude: /node_modules/,
                
            }
        ]
    },

    plugins: [
        new webpack.HotModuleReplacementPlugin()
    ]
};