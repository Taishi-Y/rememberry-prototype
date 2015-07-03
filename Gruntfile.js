module.exports = function (grunt) {
    var app_path = 'app/',
        build_path = 'extension/';

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-webpack');

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        clean: [ build_path + '*' ],

        copy: {
            main: {
                files: [
                    {
                        expand: true,
                        cwd: app_path,
                        src: [
                            '_locales/**',
                            'img/**',
                            'html/**',
                            'manifest.json'
                        ],
                        dest: build_path
                    },
                    {
                        src: 'node_modules/react/dist/react.min.js',
                        dest: build_path + 'js/vendor/react.min.js'
                    }
                ]
            }
        },

        webpack: {
            options: require('./webpack.config'),
            build: {}
        },

        watch: {
            files: [ 'Gruntfile.js', 'webpack.config.js', '.eslintrc', app_path + '**' ],
            tasks: [ 'build' ]
        }
    });

    grunt.registerTask('build', [ 'clean', 'webpack:build', 'copy' ]);
    grunt.registerTask('default', [ 'build', 'watch' ]);
};