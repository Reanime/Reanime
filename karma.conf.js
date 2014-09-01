// karma.conf.js
module.exports = function(config) {
    config.set({
        files: [
            'lib/**/*.js',
            'tests/**/*.js'
        ],

        browsers : [ 'PhantomJS' ],

        frameworks: [ 'jasmine' ],

        plugins: [
            'karma-jasmine',
            'karma-phantomjs-launcher',
            'karma-coverage'
        ],

        // coverage reporter generates the coverage
        reporters: [ 'progress' , 'coverage' ],

        preprocessors: {
            // source files, that you wanna generate coverage for
            // do not include tests or libraries
            // (these files will be instrumented by Istanbul)
            'lib/*.js': [ 'coverage' ]
        },

        // optionally, configure the reporter
        coverageReporter: {
            type : 'html',
            dir  : 'reports/coverage/'
        }
    });
};