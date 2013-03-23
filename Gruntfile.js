/*global module:true */
module.exports = function(grunt) {
  'use strict';

  // Load our npm tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-simple-mocha');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      all: ['eventChain.js', 'test/eventChainSpec.js', 'Gruntfile.js']
    },
    simplemocha: {
      options: {
        ui: 'bdd'
      },
      all: ['test/eventChainSpec.js']
    },
    watch: {
      all: {
        files: ['eventChain.js', 'test/eventChainSpec.js'],
        tasks: ['jshint', 'test']
      }
    }
  });

  grunt.registerTask('test', 'simplemocha');
  // Give travis its own task.
  grunt.registerTask('travis', ['jshint', 'test']);
  // The default task.
  grunt.registerTask('default', ['jshint', 'test']);
};