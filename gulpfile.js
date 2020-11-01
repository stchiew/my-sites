'use strict';

// check if gulp dist was called
if (process.argv.indexOf('dist') !== -1) {
  // add ship options to command call
  process.argv.push('--ship');
}

const path = require('path');
const gulp = require('gulp');
const build = require('@microsoft/sp-build-web');
const gulpSequence = require('gulp-sequence');
const spsync = require('gulp-spsync-creds').sync;
const cred = require('./cred');

build.addSuppression(`Warning - [sass] The local CSS class 'ms-Grid' is not camelCase and will not be type-safe.`);

// Create clean distrubution package
gulp.task('dist', gulpSequence('clean', 'bundle', 'package-solution'));
// Create clean development package
gulp.task('dev', gulpSequence('clean', 'bundle', 'package-solution'));

build.task('upload-app-pkg', {
  execute: (config) => {
    return new Promise((resolve, reject) => {
      const pkgFile = require('./config/package-solution.json');
      const folderLocation = `./sharepoint/${pkgFile.paths.zippedPackage}`;

      return gulp.src(folderLocation)
        .pipe(spsync({
          "username": cred.username,
          "password": cred.password,
          "site": `https://${cred.tenant}.sharepoint.com/${cred.catalogSite}`,
          "libraryPath": "AppCatalog",
          "publish": true
        }))
        .on('finish', resolve);
    });
  }
});

build.initialize(require('gulp'));
