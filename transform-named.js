(function () {
    'use strict';

    var dir = __dirname;
    var fs = require('fs');
    var path = require('path');
    var name = path.basename(dir);
    var string = 'if("function"==typeof define&&define.amd)define([]';
    var replaceWith = 'if("function"==typeof define&&define.amd)define("resizeSensor",[]';

    var strip  = function (file) {
        fs.writeFileSync(
            file,
            fs.readFileSync(file, 'utf-8').replace(string, replaceWith),
            'utf-8'
        );
    };

    strip(dir + '/dist/' + name + '.js');
}());