var webpack             = require('webpack'),
    ExtractTextPlugin   = require('extract-text-webpack-plugin');

var app_path    = __dirname + '/app',
    build_path  = 'extension/';

module.exports = {
    context: app_path,
    entry: {
        options     : './js/options/options',
        content     : './js/content/content',
        popup       : './js/popup/popup',
        background  : './js/background/background'
    },
    output: {
        path: build_path,
        filename: 'js/[name].min.js'
    },
    externals: [
        {
            react: 'React'
        }
    ],
    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                //loader: 'uglify!babel!eslint'
                loader: 'babel!eslint'
            },
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
    eslint: {
        configFile: '.eslintrc'
    },
    resolve: {
        root: app_path,
        extensions: [ '', '.js' ]
    },
    plugins: [
        new ExtractTextPlugin('css/[name].min.css'),
        new webpack.optimize.CommonsChunkPlugin({ name: 'wp-init' })
    ],
    stats: {
        chunks: false,
        chunkModules: false
    }
};