var ExtractTextPlugin = require('extract-text-webpack-plugin'),
    app_path = __dirname + '/app',
    output_path = 'extension/';

module.exports = {
    context: app_path,
    entry: {
        options     : './js/options/options.js',
        content     : './js/content/content.js',
        popup       : './js/popup/popup.js',
        background  : './js/background/background.js'
    },
    output: {
        path: output_path,
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
                loader: ExtractTextPlugin.extract('style', 'css!less')
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
        new ExtractTextPlugin('css/[name].min.css')
    ]
};