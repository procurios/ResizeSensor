var polyfill = (function (global) {
    'use strict';

    /**
     * @see https://gist.github.com/mrdoob/838785
     */
    function polyfillRequestAnimationFrame () {
        if (!global.requestAnimationFrame) {
            global.requestAnimationFrame = (function () {
                return global.webkitRequestAnimationFrame ||
                    global.mozRequestAnimationFrame ||
                    global.oRequestAnimationFrame ||
                    global.msRequestAnimationFrame ||
                    function (callback) {
                        global.setTimeout(callback, 1000 / 60);
                    };
            })();
        }

        if (!global.cancelAnimationFrame) {
            global.cancelAnimationFrame = (function () {
                return global.webkitCancelAnimationFrame ||
                    global.mozCancelAnimationFrame ||
                    global.oCancelAnimationFrame ||
                    global.msCancelAnimationFrame ||
                    global.clearTimeout;
            })();
        }
    }

    return {
        requestAnimationFrame: polyfillRequestAnimationFrame
    };
})(typeof window !== 'undefined' ? window : this);

module.exports = polyfill;
