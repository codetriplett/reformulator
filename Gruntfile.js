module.exports = function (grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		replace: {
			before: {
				options: {
					patterns: [
						{
							match: /(^|[ \r\n]*)import[^;]*;([ \r\n]*|$)/g,
							replacement: ''
						},
						{
							match: /(^|[\r\n]*)export default /g,
							replacement: '\nwindow.reformulator = '
						},
						{
							match: /(^|[\r\n]*)export (?!default)/g,
							replacement: '\n'
						}
					]
				},
				files: [
					{
						expand: true,
						flatten: true,
						src: ['src/*.js'],
						dest: 'temp/'
					}
				]
			},
			after: {
				options: {
					patterns: [
						{
							match: /^/,
							replacement: '(function () {\n'
						},
						{
							match: /$/,
							replacement: '\n})();'
						}
					]
				},
				files: [
					{
						expand: true,
						flatten: true,
						src: ['temp/reformulator.js'],
						dest: 'temp/'
					}
				]
			}
		},
		concat: {
			options: {
				separator: '\n',
			},
			dist: {
				src: [
					'temp/patterns.js',
					'temp/environment.js',
					'temp/delay-operation.js',
					'temp/element-structure.js',
					'temp/is-empty.js',
					'temp/is-equal.js',
					'temp/merge-objects.js',
					'temp/resolve-element.js',
					'temp/resolve-expression.js',
					'temp/resolve-operation.js',
					'temp/resolve-structure.js',
					'temp/resolve-template.js',
					'temp/resolve-value.js',
					'temp/reformulator.js'
				],
				dest: 'temp/reformulator.js',
			}
		},
		babel: {
			dist: {
				files: {
					'lib/delay-operation.js': 'src/delay-operation.js',
					'lib/element-structure.js': 'src/element-structure.js',
					'lib/environment.js': 'src/environment.js',
					'lib/is-empty.js': 'src/is-empty.js',
					'lib/is-equal.js': 'src/is-equal.js',
					'lib/merge-objects.js': 'src/merge-objects.js',
					'lib/patterns.js': 'src/patterns.js',
					'lib/reformulator.js': 'src/reformulator.js',
					'lib/resolve-element.js': 'src/resolve-element.js',
					'lib/resolve-expression.js': 'src/resolve-expression.js',
					'lib/resolve-operation.js': 'src/resolve-operation.js',
					'lib/resolve-structure.js': 'src/resolve-structure.js',
					'lib/resolve-template.js': 'src/resolve-template.js',
					'lib/resolve-value.js': 'src/resolve-value.js',
					'temp/reformulator.js': 'temp/reformulator.js'
				}
			}
		},
		uglify: {
			options: {
				banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
			},
			build: {
				src: 'temp/reformulator.js',
				dest: 'dist/reformulator.min.js'
			}
		},
		clean: {
			before: ['dist', 'lib', 'temp'],
			after: ['temp']
		}
	});

	grunt.loadNpmTasks('grunt-replace');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-babel');
	grunt.loadNpmTasks('grunt-contrib-uglify');

	grunt.registerTask('default', [
		'clean:before',
		'replace:before',
		'concat',
		'babel',
		'replace:after',
		'uglify',
		'clean:after'
	]);
};
