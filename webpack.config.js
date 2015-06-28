var ExtractTextPlugin = require('extract-text-webpack-plugin'),
    ext_path = 'extension/';

module.exports = {
    entry: {
        options     : './js/options/options.js',
        content     : './js/content/content.js',
        popup       : './js/popup/popup.js',
        background  : './js/background/background.js'
    },
    output: {
        path: __dirname,
        filename: ext_path + 'js/[name].js'
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
            }
        ]
    },
    plugins: [
        new ExtractTextPlugin(ext_path + 'css/[name].css')
    ]
};