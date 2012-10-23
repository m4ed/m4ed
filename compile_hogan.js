#!/usr/bin/env node

// Script for pre-compiling Hogan templates for browser

var hogan = require('/usr/local/lib/node_modules/hogan.js')
  , batchfile = require('/usr/local/lib/node_modules/batchfile')
  , fs = require('fs')
  , path = require('path')
  , hoganPath = 'm4ed/resources/js/hogantemplates/';

var files = fs.readdirSync(hoganPath);
var hoganFiles = [];
for (var i in files) {
  if (files[i].indexOf('.hogan') !== -1) {
    hoganFiles.push(hoganPath + files[i]);
  } 
}

// White multiple templates into a single define wrapper
var writeMultiple = function(templates, dir) {

  // console.log('templates before stringify: ' + templates);
  // var jsonTemplates = JSON.stringify(templates);
  // console.log('templates after stringify: ' + jsonTemplates);

  // Use the last folder as a filename and write to it
  file = dir.split(path.sep);
  // console.log('file1: ' + file);
  file = file[file.length-2];
  // console.log('dir before resolve: ' + dir);
  // console.log('file2: ' + file);
  dir = path.resolve(dir, '../');
  // console.log('dir after resolve: ' + dir);


  file = path.join(dir + '/' + file +'.js');
  var data = "define(function() { return {" + templates +"}; });";

  // console.log('Writing combined templates: ' + file);
  // console.log(data);

  fs.writeFile(file, data, function(err) {
    if (err) {
      throw err;
    } else {
      // console.log('Write successful.');
    }
  });

};

// Batch process a list of Hogan files
// hoganFiles   - list of files to be compiled
// dir          - directory to save to, or to use as a file name
// combine      - boolean whether to combine the templates as a single dict
var hoganBatch = function(hoganFiles, dir, combine) {

  var templates = ""; // String for storing multiple templates

  // console.log(hoganFiles, dir, combine);

  // In case of combine, 'write()' does not actually write
  var method = combine ? 'read' : 'transform';

  batchfile(hoganFiles)[method](function(i, file, data, write) {
    var bn = path.basename(file, '.hogan');
    var compiled = hogan.compile(data.toString(), {asString: true});
    if (combine) {
      // console.log('Adding file to dict: ' + bn);
      // Add comma if not first
      if (templates !== "") templates += ", ";
      templates = templates + bn + " : " + compiled;
      write(); // actually 'done()';        
    } else {
      var singleTemplate = "define(function() { return " + compiled +" });";
      var newFile = path.join(hoganPath + bn + '.js');
      // console.log('Writing single template: ' + newFile);
      // console.log(singleTemplate);
      write(newFile, singleTemplate);        
    }
  }).error(function(err) {
    throw err;
  }).end(function() {
    if (combine) {
      writeMultiple(templates, dir);      
    } else {
      // console.log('Write successful.');
    }
  });   

};

// Process the given path recursively
var walk = function(dir, depth) {
  // console.log(dir);
  fs.readdir(dir, function(err, list) {
    var hoganList = [];
    var pending = list.length;
    if (err) throw err;
    // if (!pending) return done(null, files);
    list.forEach(function(file) {
      file = dir + file;
      fs.stat(file, function(err, stat) {
        --pending;
        if (err) throw err;
        // console.log(file);
        if (stat && stat.isDirectory()) {
          walk(file+'/', depth + 1);
        } else if (file.indexOf('.hogan') !== -1) {
          hoganList.push(file);
        } else if (file.indexOf('.js') !== -1) {
          // Remove old files
          fs.unlink(file, function (err) {
            if (err) throw err;
            // console.log('Deleted: ' + file);
          });
        }
        // console.log('Pending: ' + pending);
        if (!pending) hoganBatch(hoganList, dir, depth > 0);
      });
    });
  });
};

console.log('Compiling Hogan templates...');

walk(hoganPath, 0);