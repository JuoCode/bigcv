#!/usr/bin/env node

var program = require('commander');
var lib = require('./lib');

program
  .usage("[command] [options]")
  .version('0.0.1');


// Command new ->
//   mkdir projectName
//   fetch theme [ index.hbs, style.scss, main.coffee, config.json ]
//   TODO: Add the process information for current project
program
  .command('new <projectName>')
  .option('-t, --theme <theme>', 'Specify theme, use github repository, like `JuoCode/look-forward`')
  .description('Choose a template')
  .action(function(projectName, options) {
    lib.new(projectName, options.theme);
  });


// Command preview ->
//   TODO: Check resume.json validity
//   compile hbs
//   Start server
//   Open browser
program
  .command('preview')
  .description('Preview resume')
  .action(function() {
    lib.preview();
  });


// Command publish <place>->
//   if place is gh
//     publish to gh use gulp-gh-pages
//   else if place is empty
//     publish to bigcoder.in
program
  .command('publish <place>')
  .option('-p, --place', 'Publish resume to Github page(gh) or bigcoder.in(default)')
  .description('Publish to Github pages or bigcoder.in')
  .action(function(place) {
    lib.publish(place);
  });

program.parse(process.argv);
