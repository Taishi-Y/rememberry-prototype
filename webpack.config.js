var webpack = require('webpack'),
    ExtractTextPlugin = require('extract-text-webpack-plugin'),
    app_path = __dirname + '/app',
    build_path = 'extension/';

module.exports = {
    context: app_path,
    entry: {
        options     : './js/options/options.js',
        content     : './js/content/content.js',
        popup       : './js/popup/popup.js',
        background  : './js/background/background.js'
    },
    output: {
        path: build_path,
        filename: 'js/[name].min.js'
    },
    module: {
        loaders: [
            {
                test: /^((?!(\.extract)).)+\.less$/,
                loader: 'style!css!less'
            },
            {
                test: /\.extract\.less$/,
                loader: ExtractTextPlugin.extract('style', 'css?minimize!less')
            },
            {
                test: /\.json$/,
                loader: 'json'
            }
        ]
    },
    resolve: {
        root: app_path
    },
    plugins: [
        new ExtractTextPlugin('css/[name].min.css'),
        new webpack.optimize.CommonsChunkPlugin('js/wp-init.min.js'),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            }
        })
    ]
};