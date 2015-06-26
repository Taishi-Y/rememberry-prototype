var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
    entry: {
        options     : './js/options/options.js',
        content     : './js/content/content.js',
        popup       : './js/popup/popup.js',
        background  : './js/background/background.js'
    },
    output: {
        path: __dirname,
        filename: 'extension/js/[name].js'
    },
    module: {
        loaders: [
            {
                test: /\.less$/,
                loader: ExtractTextPlugin.extract('style-loader', 'css-loader!less-loader')
            },
            {
                test: /\.woff2$/,
                loader: 'url-loader?limit=0'
            }
        ]
    },
    plugins: [
        new ExtractTextPlugin('extension/css/[name].css')
    ]
};