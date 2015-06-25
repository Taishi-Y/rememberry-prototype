module.exports = {
    entry: "./js/options/options.js",
    output: {
        path: __dirname,
        filename: "extension/js/options.js"
    },
    module: {
        loaders: [
            { test: /\.less$/, loader: "style!css!less" }
        ]
    }
};