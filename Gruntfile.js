'use strict';

module.exports = function (grunt) {
    require('load-grunt-tasks')(grunt);
    require('time-grunt')(grunt);

    var timer = require('grunt-timer'),
        configs = {
            app: './src',
            tempPath: '.tmp',
            distPath: './dist',
            buildPath: grunt.option('path') || './build'
        };

    timer.init(grunt, {
        friendlyTime: false,
        color: 'blue'
    });

    grunt.initConfig({

        /************************************************************************
         * General Configurations
         ************************************************************************/

        config: configs,

        processhtml: {
            options: {
                data: {
                    message: 'Hello world!'
                }
            },
            dist: {
                files: {
                    '<%= config.distPath %>/index.html': ['<%= config.app %>/index.html']
                }
            }
        },

        imagemin: {
            dynamic: {
                optimizationLevel: 5,
                files: [
                    {
                        expand: true,
                        cwd: '<%= config.app %>/assets/img/',
                        src: ['**/*.{png,jpg,gif}'],
                        dest: '<%= config.distPath %>/assets/img/'
                    }
                ]
            }
        },

        // Compile Sass files into CSS files
        sass: {
            options: {
                sourceMap: true
            },
            build: {
                files: {
                    '<%= config.buildPath %>/css/main.css': '<%= config.app %>/scss/main.scss'
                }
            }
        },

        // Remove desired directories
        clean: {
            build: {
                src: [
                    '<%= config.distPath %>',
                    '<%= config.buildPath %>'
                ]
            },
            dist: {
                options: {
                    force: true
                },
                src: [
                    '<%= config.buildPath %>',
                    '<%= config.distPath %>'
                ]
            },
            after: {
                src: [
                    '<%= config.buildPath %>'
                ]
            }
        },


        // Copy files to a desired location
        copy: {
            build: {
                files: [
                    {
                        expand: true,
                        cwd: '<%= config.app %>/',
                        src: ['index.html'],
                        dest: '<%= config.buildPath %>/',
                        flatten: true,
                        filter: 'isFile'
                    },
                    {
                        expand: true,
                        cwd: '<%= config.app %>/',
                        src: ['assets/**'],
                        dest: '<%= config.buildPath %>/'
                    },
                    {
                        expand: true,
                        cwd: '<%= config.app %>/',
                        src: ['js/**'],
                        dest: '<%= config.buildPath %>/'
                    },
                    {
                        expand: true,
                        cwd: './',
                        src: ['bower_components/**'],
                        dest: '<%= config.buildPath %>/'
                    }
                ]
            },
            dist: {
                files: [
                    // {
                    //     expand: true,
                    //     cwd: '<%= config.app %>/',
                    //     src: ['index.html'],
                    //     dest: '<%= config.distPath %>/',
                    //     flatten: true,
                    //     filter: 'isFile'
                    // },
                    {
                        expand: true,
                        cwd: '<%= config.app %>/assets/',
                        src: ['urls.json'],
                        dest: '<%= config.distPath %>/assets/',
                        flatten: true,
                        filter: 'isFile'
                    },
                    {
                        expand: true,
                        cwd: './',
                        src: ['bower_components/**'],
                        dest: '<%= config.distPath %>/'
                    }
                ]
            }
        },

        // Prepare files to be compressed and uglified
        useminPrepare: {
            html: ['<%= config.buildPath %>/index.html'],
            options: {
                dest: '<%= config.distPath %>/',
                flow: {
                    html: {
                        steps: {
                            js: ['concat'],
                            css: ['concat', 'cssmin']
                        },
                        post: {}
                    }
                }
            }
        },

        cssmin: {
            options: {
                shorthandCompacting: false,
                roundingPrecision: -1
            },
            target: {
                files: {
                    '<%= config.distPath %>/css/main.css': ['<%= config.buildPath %>/css/main.css']
                }
            }
        },


        // Change file paths to concatenated and filereved ones
        usemin: {
            html: ['<%= config.distPath %>/index.html'],
            options: {
                dest: '<%= config.distPath %>/'
            }
        },

        // Uglify just concatenated app.js file
        uglify: {
            prod: {
                files: [{
                    expand: true,
                    cwd: '<%= config.buildPath %>/js/',
                    src: '**',
                    dest: '<%= config.distPath %>/js/'
                }]
            }
        },

        // Minify HTML
        htmlmin: {
            deploy: {
                options: {
                    removeComments: true,
                    collapseWhitespace: true,
                    conservativeCollapse: true,
                    collapseBooleanAttributes: true,
                    removeOptionalTags: true
                },
                files: [{
                    expand: true,
                    cwd: '<%= config.productionPath %>/',
                    src: ['index.html'],
                    dest: '<%= config.productionPath %>/'
                }]
            }
        },

        // Connect application
        connect: {
            options: {
                port: 8001,
                livereload: 35730,
                hostname: '0.0.0.0'
            },
            livereload: {
                options: {
                    open: true,
                    base: [
                        '<%= config.buildPath %>/'
                    ]
                }
            }
        },


        // Watch and live reload code
        watch: {
            options: {
                livereload: {
                    host: 'localhost',
                    port: '<%= connect.options.livereload %>'
                },
                dateFormat: function (time) {
                    grunt.log.writeln('File changed changed in ' + time + ' ms at ' + (new Date()).toString());
                    grunt.log.writeln('Waiting for more changes...');
                }
            },
            gruntfile: {
                files: [
                    './Gruntfile.js'
                ]
            },
            html: {
                files: [
                    '<%= config.app %>/index.html'
                ],
                tasks: ['copy:build']
            },
            sass: {
                files: [
                    '<%= config.app %>/scss/**/*.scss',
                    '<%= config.app %>/scss/**/*.css'
                ],
                tasks: ['sass:build',
                    'copy:build']
            },
            js: {
                files: [
                    '<%= config.app %>/js/**/*.js'
                ],
                tasks: ['copy:build']
            }
        },

        concat: {
            options: {
                separator: ';'
            },
            dist: {
                src: ['<%= config.app %>/js/util.js'],
                dest: '<%= config.buildPath %>/js/app.js'
            }
        }
    });


    /************************************************************************
     * Registered Tasks
     ************************************************************************/

    grunt.registerTask('build', [
        'clean:build',
        'sass:build',
        'copy:build',
    ]);


    grunt.registerTask('dist', [
        'clean:dist',
        'sass:build',
        'useminPrepare',
        'concat',
        'cssmin',
        'uglify',
        'usemin',
        'imagemin',
        'processhtml:dist',
        'copy:dist',
        'clean:after'
    ]);


    grunt.registerTask('serve', [
        'build',
        'connect:livereload',
        'watch'
    ]);


    grunt.registerTask('default', ['serve']);
};
