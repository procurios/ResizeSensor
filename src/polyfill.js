var polyfill = (function () {
    'use strict';

    /**
     * @see https://gist.github.com/mrdoob/838785
     */
    function polyfillRequestAnimationFrame () {
    	if (!window.requestAnimationFrame) {
    		window.requestAnimationFrame = (function () {
    			return window.webkitRequestAnimationFrame ||
    				window.mozRequestAnimationFrame ||
    				window.oRequestAnimationFrame ||
    				window.msRequestAnimationFrame ||
    				function (callback) {
    					window.setTimeout(callback, 1000 / 60);
    				};
    		})();
    	}

    	if (!window.cancelAnimationFrame) {
    		window.cancelAnimationFrame = (function () {
    			return window.webkitCancelAnimationFrame ||
    				window.mozCancelAnimationFrame ||
    				window.oCancelAnimationFrame ||
    				window.msCancelAnimationFrame ||
    				window.clearTimeout;
    		})();
    	}
    }

    return {
        requestAnimationFrame: polyfillRequestAnimationFrame
    }
})();

module.exports = polyfill;
