module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        srcFile:'client/*.js',
        browserify: {
            dist: {
                files: {

                    'public/javascripts/front.js': ['client/*.js']
                }
            },
            options: {
                bundleOptions: {
                    debug: true
                }
            }
        },
        watch: {
            dev:{
                files: ['<%= srcFile %>'],
                tasks: ['browserify']
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-browserify');

    grunt.registerTask('default', ['browserify', 'watch:dev']);

};