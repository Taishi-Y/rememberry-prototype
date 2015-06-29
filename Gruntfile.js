module.exports = function (grunt) {
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-webpack');

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        //build_path: 'extension',

        //jshint: {
        //    options: {
        //        jshintrc: true
        //    },
        //
        //    files: [
        //        'Gruntfile.js'
        //        //, 'src/**/*.js'
        //    ]
        //},
        //
        //concat: {
        //    options: {
        //        separator: ';\n'
        //    },
        //
        //    dist: {
        //        src: [ 'src/**/*.js' ],
        //        dest: 'build/output.js'
        //    }
        //},

        clean: [ 'extension/*' ],

        copy: {
            main: {
                expand: true,
                cwd: 'app/',
                src: [
                    '_locales/**',
                    'img/**',
                    'html/**',
                    'manifest.json'
                ],
                dest: 'extension/'
            }
        },

        webpack: {
            options: require('./webpack.config'),
            build: {}
        },

        //uglify: {
        //    options: {
        //        banner: '/* <%= pkg.name %> <%=grunt.template.today("yyyy-mm-dd") %> */\n'
        //    },
        //
        //    build: {
        //        files: [{
        //            expand: true,
        //            cwd: 'src/js',
        //            src: '**/*.js',
        //            dest: 'build/js'
        //        }]
        //    },
        //
        //    allinone: {
        //        files: {
        //            'build/output.min.js': [ 'build/output.js' ]
        //        }
        //    }
        //},

        watch: {
            files: [ 'Gruntfile.js', 'webpack.config.js', 'app/**' ],
            tasks: [ 'build' ],
            options: {
                spawn: false
            }
        }

        //shell: {
        //    'build-jsx': {
        //        command: 'jsx -x jsx src/jsx/ build/js/ --no-cache-dir'
        //    }
        //}
    });

    //grunt.loadNpmTasks('grunt-contrib-jshint');
    //grunt.loadNpmTasks('grunt-contrib-uglify');
    //grunt.loadNpmTasks('grunt-contrib-concat');
    //grunt.loadNpmTasks('grunt-contrib-watch');
    //grunt.loadNpmTasks('grunt-shell');

    grunt.registerTask('default', [ 'build', 'watch' ]);
    grunt.registerTask('build', [ 'clean', 'webpack:build', 'copy' ]);
    //grunt.registerTask('jsx', [ 'shell:build-jsx' ]);
};