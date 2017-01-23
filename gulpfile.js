/**
 * @author oldj
 * @blog http://oldj.net
 */

'use strict';

/**
 * 注：ELECTRON_VERSION 为对应的 Electron 版本
 * 直接运行命令会自动下载对应文件，
 * 也可手动从 https://github.com/electron/electron/releases 下载最新版本，放到 ~/.electron 目录下
 */
const ELECTRON_VERSION = '1.4.15';

const fs = require('fs');
const path = require('path');
// const util = require('util');
const exec = require('child_process').exec;
const gulp = require('gulp');
const shell = require('gulp-shell');
const beautify = require('js-beautify').js_beautify;

// const args = require('yargs').argv;
// const IS_DEBUG = !!args.debug;
// const TPL_FILE_INFO = "echo '> (DEBUG " + (IS_DEBUG ? "on" : "off") + ") <%= file.path %>'";

gulp.task('ver', () => {
    let fn = path.join(__dirname, 'app', 'version.js');
    let version = require('./app/version').version;
    version[3]++;

    console.log(`version -> ${version.join('.')}`);

    let cnt = `exports.version = ${JSON.stringify(version)};`;
    fs.writeFileSync(fn, cnt, 'utf-8');

    function updatePackage(fn) {
        cnt = fs.readFileSync(fn);
        let d = JSON.parse(cnt);
        d.version = version.slice(0, 3).join('.');
        cnt = beautify(JSON.stringify(d), {indent_size: 2});
        fs.writeFileSync(fn, cnt, 'utf-8');
    }

    // update package.json
    updatePackage(path.join(__dirname, 'package.json'));
    updatePackage(path.join(__dirname, 'app', 'package.json'));
});

gulp.task('pack', () => {
    let version = require('./app/version').version;
    let v1 = version.slice(0, 3).join('.');
    let v2 = version[3];

    let cmds = `
# for macOS
electron-packager ./app 'SwitchHosts!' --platform=darwin --arch=x64 --version=${ELECTRON_VERSION} --overwrite --asar=true --prune --icon=./assets/app.icns --ignore=node_modules/.bin --ignore=.git --ignore=dist --ignore=node_modules/electron-* --out=dist --app-version=${v1} --build-version=${v2}
cp ../assets/Credits.rtf dist/SwitchHosts\!-darwin-x64/SwitchHosts\!.app/Contents/Resources/en.lproj

# for windows x64
electron-packager ./app 'SwitchHosts!' --platform=win32  --arch=x64 --version=${ELECTRON_VERSION} --overwrite --asar=true --prune --icon=./assets/app.ico  --ignore=node_modules/.bin --ignore=.git --ignore=dist --ignore=node_modules/electron-* --out=dist --app-version=${v1} --build-version=${v2}

# for windows ia32
electron-packager ./app 'SwitchHosts!' --platform=win32  --arch=ia32 --version=${ELECTRON_VERSION} --overwrite --asar=true --prune --icon=./assets/app.ico  --ignore=node_modules/.bin --ignore=.git --ignore=dist --ignore=node_modules/electron-* --out=dist --app-version=${v1} --build-version=${v2}

# for linux x86_64
electron-packager ./app 'SwitchHosts!' --platform=linux  --arch=x64 --version=${ELECTRON_VERSION} --overwrite --asar=true --prune --icon=./assets/app.ico  --ignore=node_modules/.bin --ignore=.git --ignore=dist --ignore=node_modules/electron-* --out=dist --app-version=${v1} --build-version=${v2}
`;

    console.log(`start packing, v: ${v1}.${v2} ..`);
    console.log(cmds);
    exec(cmds, (error, stdout, stderr) => {
        console.log('end pack.');
        if (error) {
            console.error(`exec error: ${error}`);
        }
        // if (stdout) console.log(`${stdout}`);
        // if (stderr) console.log(`${stderr}`);
    });
});

gulp.task('zip', () => {
    let version = require('./app/version').version;
    let v = version.join('.');

    let cmds = `
cd ./dist
rm -f ./SwitchHosts-*.zip
zip -ry SwitchHosts-macOS-x64_v${v}.zip ./SwitchHosts\\!-darwin-x64/SwitchHosts\\!.app
zip -ry SwitchHosts-win32-x64_v${v}.zip ./SwitchHosts\\!-win32-x64
zip -ry SwitchHosts-win32-ia32_v${v}.zip ./SwitchHosts\\!-win32-ia32
zip -ry SwitchHosts-linux-x64_v${v}.zip ./SwitchHosts\\!-linux-x64
cd ..
`;

    console.log(`start zip ..`);
    exec(cmds, (error, stdout, stderr) => {
        console.log('end zip.');
        if (error) {
            console.error(`exec error: ${error}`);
        }
        // if (stdout) console.log(`${stdout}`);
        // if (stderr) console.log(`${stderr}`);
    });

});

gulp.task('default', () => {
    // gulp.start('ver');

    gulp.watch([
        './app/main.js',
        './app/index.html',
        './app/src/**/*.*',
        '!./app/version.js'
    ], ['ver']);
});
