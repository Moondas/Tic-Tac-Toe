module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pug: {
      options: {
        pretty: true,
      },
      dist: {
        src: ['*.pug'],
        dest: '.html-parts/body.html'
      }
    },
    sass: {
      dist: {
          src: ['scss/style.scss'],
          dest: 'css/style.css'
      }
    },
    htmlbuild: {
      dist: {
        src: 'template/index.html',
        options: {
          sections: {
            layout: {
              body: '.html-parts/body.html'
            }
          },
          data: {
            title: 'Tic Tac Toe'
          }
        }
      }
    },
    browserSync: {
      dist: {
        options: {
          open: false,
          notify: false,
          watchTask: true,
          server: './',
        },
        bsFiles: {
          src: [
            'css/*.css',
            'js/*.js',
            'index.html'
          ]
        },
      }
    },
    watch: {
      pug: {
        files: ['./**/*.pug'],
        tasks: ['pug', 'htmlbuild'],
      },
      sass: {
        files: ['scss/**/*.scss'],
        tasks: ['sass']
      },
      js: {
        files: ['js/**/*.js'],
        tasks: ['browserSync']
      },
    }
  });

  // Load the plugins.
  grunt.loadNpmTasks('grunt-contrib-pug');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-browser-sync');
  grunt.loadNpmTasks('grunt-html-build');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Default task(s).
  grunt.registerTask('default', ['browserSync', 'watch']);

};