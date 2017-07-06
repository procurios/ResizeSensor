!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define("resizeSensor",[],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.resizeSensor=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var css = (function () {
    'use strict';

    /** @var {null|Object} */
    var animationPropertiesForBrowser = null;
    /** @var {null|boolean} */
    var isCssAnimationSupported = null;

    /**
     * Determines which style convention (properties) to follow
     * @see https://developer.mozilla.org/en-US/docs/Web/Guide/CSS/Using_CSS_animations/Detecting_CSS_animation_support
     * @returns {{keyframesRule: string, styleDeclaration: string, animationStartEvent: string, animationName: string}}
     */
    function getAnimationPropertiesForBrowser () {
        if (animationPropertiesForBrowser !== null) {
            return animationPropertiesForBrowser;
        }

        var testElement = document.createElement('div');
        var supportsUnprefixedAnimationProperties = ('animationName' in testElement.style);

        // Unprefixed animation properties
        var animationStartEvent = 'animationstart';
        var animationName = 'resizeanim';

        if (supportsUnprefixedAnimationProperties) {
            return {
                keyframesRule: '@keyframes ' + animationName + ' {from { opacity: 0; } to { opacity: 0; }}',
                styleDeclaration: 'animation: 1ms ' + animationName + ';',
                animationStartEvent: animationStartEvent,
                animationName: animationName
            };
        }

        // Browser specific animation properties
        var keyframePrefix = '';
        var browserPrefixes = 'Webkit Moz O ms'.split(' ');
        var startEvents = 'webkitAnimationStart animationstart oAnimationStart MSAnimationStart'.split(' ');

        var i;
        var l = browserPrefixes.length;

        for (i = 0; i < l; i++) {
            if ((browserPrefixes[i] + 'AnimationName') in testElement.style) {
                keyframePrefix = '-' + browserPrefixes[i].toLowerCase() + '-';
                animationStartEvent = startEvents[i];
                break;
            }
        }

        animationPropertiesForBrowser = {
            keyframesRule: '@' + keyframePrefix + 'keyframes ' + animationName + ' {from { opacity: 0; } to { opacity: 0; }}',
            styleDeclaration: keyframePrefix + 'animation: 1ms ' + animationName + ';',
            animationStartEvent: animationStartEvent,
            animationName: animationName
        };

        return animationPropertiesForBrowser;
    }

    /**
     * @returns {boolean}
     */
    function isCSSAnimationSupported () {
        if (isCssAnimationSupported !== null) {
            return isCssAnimationSupported;
        }

        var testElement = document.createElement('div');
        var isAnimationSupported = ('animationName' in testElement.style);

        if (isAnimationSupported) {
            isCssAnimationSupported = true;
            return isCssAnimationSupported;
        }

        var browserPrefixes = 'Webkit Moz O ms'.split(' ');
        var i = 0;
        var l = browserPrefixes.length;

        for (; i < l; i++) {
            if ((browserPrefixes[i] + 'AnimationName') in testElement.style) {
                isCssAnimationSupported = true;
                return isCssAnimationSupported;
            }
        }

        isCssAnimationSupported = false;
        return isCssAnimationSupported;
    }

    /**
     * Adds a style block that contains CSS essential for detecting resize events
     */
    function insertResizeSensorStyles () {
        var cssRules = [
            (getAnimationPropertiesForBrowser().keyframesRule) ? getAnimationPropertiesForBrowser().keyframesRule : '',
            '.ResizeSensor__resizeTriggers { ' + ((getAnimationPropertiesForBrowser().styleDeclaration) ? getAnimationPropertiesForBrowser().styleDeclaration : '') + ' visibility: hidden; opacity: 0; }',
            '.ResizeSensor__resizeTriggers, .ResizeSensor__resizeTriggers > div, .ResizeSensor__contractTrigger:before { content: \' \'; display: block; position: absolute; top: 0; left: 0; height: 100%; width: 100%; overflow: hidden; } .ResizeSensor__resizeTriggers > div { background: #eee; overflow: auto; } .ResizeSensor__contractTrigger:before { width: 200%; height: 200%; }'
        ];

        cssRules = cssRules.join(' ');

        var headElem = document.head || document.getElementsByTagName('head')[0];

        var styleElem = document.createElement('style');
        styleElem.type = 'text/css';

        if (styleElem.styleSheet) {
            styleElem.styleSheet.cssText = cssRules;
        } else {
            styleElem.appendChild(document.createTextNode(cssRules));
        }

        headElem.appendChild(styleElem);
    }

    return {
        insertResizeSensorStyles: insertResizeSensorStyles,
        isAnimationSupported: isCSSAnimationSupported,
        getAnimationPropertiesForBrowser: getAnimationPropertiesForBrowser
    }
})();

module.exports = css;

},{}],2:[function(require,module,exports){
var getStyle = (function (global) {
    'use strict';

    /**
     * @param {HTMLElement} element
     * @param {string} property
     * @returns {null|string}
     */
    return function (element, property) {
        if (!('currentStyle' in element) && !('getComputedStyle' in global)) {
            return null;
        }

        if (element.currentStyle) {
            return element.currentStyle[property];
        }

        return global.document.defaultView.getComputedStyle(element, null).getPropertyValue(property);
    }
})(typeof window !== 'undefined' ? window : this);

module.exports = getStyle;

},{}],3:[function(require,module,exports){
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

},{}],4:[function(require,module,exports){
var resizeSensorFactory = (function () {
    'use strict';

    /** @var {Function} */
    var getStyle = require('./getStyle');
    /** @var {Object} */
    var css = require('./css');

    /**
     * @param {HTMLElement} targetElement
     * @param {Function} callback
     * @constructor
     */
    var resizeSensor = function (targetElement, callback) {
        /** @var {HTMLElement} */
        this.targetElement = targetElement;
        /** @var {Function} */
        this.callback = callback;
        /** @var {{width: int, height: int}} */
        this.dimensions = {
            width: 0,
            height: 0
        };

        if ('attachEvent' in document) {
            this.boundOnResizeHandler = this.onElementResize.bind(this);
            this.targetElement.attachEvent('onresize', this.boundOnResizeHandler);
            return;
        }

        /** @var {{container: HTMLElement, expand: HTMLElement, expandChild: HTMLElement, contract: HTMLElement}} */
        this.triggerElements = {};
        /** @var {int} */
        this.resizeRAF = 0;

        this.setup();
    };

    resizeSensor.prototype.setup = function () {
        // Make sure the target element is "positioned"
        if (getStyle(this.targetElement, 'position') === 'static') {
            this.targetElement.style.position = 'relative';
        }

        // Create and append resize trigger elements
        this.insertResizeTriggerElements();

        // Start listening to events
        this.boundScrollListener = this.handleElementScroll.bind(this);
        this.targetElement.addEventListener('scroll', this.boundScrollListener, true);

        if (css.isAnimationSupported()) {
            this.boundAnimationStartListener = this.resetTriggersOnAnimationStart.bind(this);
            this.triggerElements.container.addEventListener(
                css.getAnimationPropertiesForBrowser().animationStartEvent,
                this.boundAnimationStartListener
            );
        }

        // Initial value reset of all triggers
        this.resetTriggers();
    };

    resizeSensor.prototype.insertResizeTriggerElements = function () {
        var resizeTrigger = document.createElement('div');
        var expandTrigger = document.createElement('div');
        var expandTriggerChild = document.createElement('div');
        var contractTrigger = document.createElement('div');

        resizeTrigger.className = 'ResizeSensor ResizeSensor__resizeTriggers';
        expandTrigger.className = 'ResizeSensor__expandTrigger';
        contractTrigger.className = 'ResizeSensor__contractTrigger';

        expandTrigger.appendChild(expandTriggerChild);
        resizeTrigger.appendChild(expandTrigger);
        resizeTrigger.appendChild(contractTrigger);

        this.triggerElements.container = resizeTrigger;
        this.triggerElements.expand = expandTrigger;
        this.triggerElements.expandChild = expandTriggerChild;
        this.triggerElements.contract = contractTrigger;

        this.targetElement.appendChild(resizeTrigger);
    };

    resizeSensor.prototype.onElementResize = function () {
        var currentDimensions = this.getDimensions();

        if (this.isResized(currentDimensions)) {
            this.dimensions.width = currentDimensions.width;
            this.dimensions.height = currentDimensions.height;
            this.elementResized();
        }
    };

    resizeSensor.prototype.handleElementScroll = function () {
        var _this = this;

        this.resetTriggers();

        if (this.resizeRAF) {
            window.cancelAnimationFrame(this.resizeRAF);
        }

        this.resizeRAF = window.requestAnimationFrame(function () {
            var currentDimensions = _this.getDimensions();
            if (_this.isResized(currentDimensions)) {
                _this.dimensions.width = currentDimensions.width;
                _this.dimensions.height = currentDimensions.height;
                _this.elementResized();
            }
        });
    };

    /**
     * @param {{width: number, height: number}} currentDimensions
     * @returns {boolean}
     */
    resizeSensor.prototype.isResized = function (currentDimensions) {
        return (currentDimensions.width !== this.dimensions.width || currentDimensions.height !== this.dimensions.height)
    };

    /**
     * @returns {{width: number, height: number}}
     */
    resizeSensor.prototype.getDimensions = function () {
        return {
            width: this.targetElement.offsetWidth,
            height: this.targetElement.offsetHeight
        };
    };

    /**
     * @param {Event} event
     */
    resizeSensor.prototype.resetTriggersOnAnimationStart = function (event) {
        if (event.animationName === css.getAnimationPropertiesForBrowser().animationName) {
            this.resetTriggers();
        }
    };

    resizeSensor.prototype.resetTriggers = function () {
        this.triggerElements.contract.scrollLeft = this.triggerElements.contract.scrollWidth;
        this.triggerElements.contract.scrollTop = this.triggerElements.contract.scrollHeight;
        this.triggerElements.expandChild.style.width = this.triggerElements.expand.offsetWidth + 1 + 'px';
        this.triggerElements.expandChild.style.height = this.triggerElements.expand.offsetHeight + 1 + 'px';
        this.triggerElements.expand.scrollLeft = this.triggerElements.expand.scrollWidth;
        this.triggerElements.expand.scrollTop = this.triggerElements.expand.scrollHeight;
    };

    resizeSensor.prototype.elementResized = function () {
        this.callback(this.dimensions);
    };

    resizeSensor.prototype.destroy = function () {
        this.removeEventListeners();
        this.targetElement.removeChild(this.triggerElements.container);
        delete this.boundAnimationStartListener;
        delete this.boundScrollListener;
        delete this.callback;
        delete this.targetElement;
    };

    resizeSensor.prototype.removeEventListeners = function () {
        if ('attachEvent' in document) {
            this.targetElement.detachEvent('onresize', this.boundOnResizeHandler);
            return;
        }

        this.triggerElements.container.removeEventListener(
            css.getAnimationPropertiesForBrowser().animationStartEvent,
            this.boundAnimationStartListener
        );
        this.targetElement.removeEventListener('scroll', this.boundScrollListener, true);
    };

    return {
        /**
         * @param {Element} targetElement
         * @param {Function} callback
         * @returns {resizeSensor}
         */
        create: function (targetElement, callback) {
            return new resizeSensor(targetElement, callback);
        }
    }
})();

module.exports = resizeSensorFactory;

},{"./css":1,"./getStyle":2}],5:[function(require,module,exports){
var sensors = (function () {
    'use strict';

    /** @var {Object} */
    var css = require('./css');
    /** @var {Object} */
    var polyfill = require('./polyfill');
    /** @var {Object} */
    var resizeSensorFactory = require('./resizeSensor');

    /** {array} */
    var unsuitableElements = ['IMG', 'COL', 'TR', 'THEAD', 'TFOOT'];
    /** {boolean} */
    var supportsAttachEvent = ('attachEvent' in document);

    /** {{}} Map of all resize sensors (id => ResizeSensor) */
    var allResizeSensors = {};

    if (!supportsAttachEvent) {
        css.insertResizeSensorStyles();

        if (!('requestAnimationFrame' in window) || !('cancelAnimationFrame' in window)) {
            polyfill.requestAnimationFrame();
        }
    }

    /**
     * @param {Element} targetElement
     * @param {Function} callback
     * @returns {resizeSensor}
     */
    function create (targetElement, callback) {
        if (isUnsuitableElement(targetElement)) {
            console && console.error("Given element isn't suitable to act as a resize sensor. Try wrapping it with one that is. Unsuitable elements are:", unsuitableElements);
            return null;
        }

        var sensorId = getSensorId(targetElement);

        if (allResizeSensors[sensorId]) {
            return allResizeSensors[sensorId];
        }

        var sensor = resizeSensorFactory.create(targetElement, callback);
        allResizeSensors[sensorId] = sensor;
        return sensor;
    }

    /**
     * @param {Element} targetElement
     */
    function destroy (targetElement) {
        var sensorId = getSensorId(targetElement);
        var sensor = allResizeSensors[sensorId];

        if (!sensor) {
            console && console.error("Can't destroy ResizeSensor (404 not found).", targetElement);
        }

        sensor.destroy();
        delete allResizeSensors[sensorId];
    }

    /**
     * @param {Element} targetElement
     * @returns {string}
     */
    function getSensorId (targetElement) {
        return targetElement.id;
    }

    /**
     * @param {HTMLElement} targetElement
     * @returns {boolean}
     */
    function isUnsuitableElement (targetElement) {
        var tagName = targetElement.tagName.toUpperCase();
        return (unsuitableElements.indexOf(tagName) > -1);
    }

    return {
        create: create,
        destroy: destroy
    }
})();

module.exports = sensors;
},{"./css":1,"./polyfill":3,"./resizeSensor":4}]},{},[5])(5)
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvY3NzLmpzIiwic3JjL2dldFN0eWxlLmpzIiwic3JjL3BvbHlmaWxsLmpzIiwic3JjL3Jlc2l6ZVNlbnNvci5qcyIsInNyYy9zZW5zb3JzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgY3NzID0gKGZ1bmN0aW9uICgpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICAvKiogQHZhciB7bnVsbHxPYmplY3R9ICovXG4gICAgdmFyIGFuaW1hdGlvblByb3BlcnRpZXNGb3JCcm93c2VyID0gbnVsbDtcbiAgICAvKiogQHZhciB7bnVsbHxib29sZWFufSAqL1xuICAgIHZhciBpc0Nzc0FuaW1hdGlvblN1cHBvcnRlZCA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBEZXRlcm1pbmVzIHdoaWNoIHN0eWxlIGNvbnZlbnRpb24gKHByb3BlcnRpZXMpIHRvIGZvbGxvd1xuICAgICAqIEBzZWUgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvR3VpZGUvQ1NTL1VzaW5nX0NTU19hbmltYXRpb25zL0RldGVjdGluZ19DU1NfYW5pbWF0aW9uX3N1cHBvcnRcbiAgICAgKiBAcmV0dXJucyB7e2tleWZyYW1lc1J1bGU6IHN0cmluZywgc3R5bGVEZWNsYXJhdGlvbjogc3RyaW5nLCBhbmltYXRpb25TdGFydEV2ZW50OiBzdHJpbmcsIGFuaW1hdGlvbk5hbWU6IHN0cmluZ319XG4gICAgICovXG4gICAgZnVuY3Rpb24gZ2V0QW5pbWF0aW9uUHJvcGVydGllc0ZvckJyb3dzZXIgKCkge1xuICAgICAgICBpZiAoYW5pbWF0aW9uUHJvcGVydGllc0ZvckJyb3dzZXIgIT09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiBhbmltYXRpb25Qcm9wZXJ0aWVzRm9yQnJvd3NlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciB0ZXN0RWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICB2YXIgc3VwcG9ydHNVbnByZWZpeGVkQW5pbWF0aW9uUHJvcGVydGllcyA9ICgnYW5pbWF0aW9uTmFtZScgaW4gdGVzdEVsZW1lbnQuc3R5bGUpO1xuXG4gICAgICAgIC8vIFVucHJlZml4ZWQgYW5pbWF0aW9uIHByb3BlcnRpZXNcbiAgICAgICAgdmFyIGFuaW1hdGlvblN0YXJ0RXZlbnQgPSAnYW5pbWF0aW9uc3RhcnQnO1xuICAgICAgICB2YXIgYW5pbWF0aW9uTmFtZSA9ICdyZXNpemVhbmltJztcblxuICAgICAgICBpZiAoc3VwcG9ydHNVbnByZWZpeGVkQW5pbWF0aW9uUHJvcGVydGllcykge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBrZXlmcmFtZXNSdWxlOiAnQGtleWZyYW1lcyAnICsgYW5pbWF0aW9uTmFtZSArICcge2Zyb20geyBvcGFjaXR5OiAwOyB9IHRvIHsgb3BhY2l0eTogMDsgfX0nLFxuICAgICAgICAgICAgICAgIHN0eWxlRGVjbGFyYXRpb246ICdhbmltYXRpb246IDFtcyAnICsgYW5pbWF0aW9uTmFtZSArICc7JyxcbiAgICAgICAgICAgICAgICBhbmltYXRpb25TdGFydEV2ZW50OiBhbmltYXRpb25TdGFydEV2ZW50LFxuICAgICAgICAgICAgICAgIGFuaW1hdGlvbk5hbWU6IGFuaW1hdGlvbk5hbWVcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICAvLyBCcm93c2VyIHNwZWNpZmljIGFuaW1hdGlvbiBwcm9wZXJ0aWVzXG4gICAgICAgIHZhciBrZXlmcmFtZVByZWZpeCA9ICcnO1xuICAgICAgICB2YXIgYnJvd3NlclByZWZpeGVzID0gJ1dlYmtpdCBNb3ogTyBtcycuc3BsaXQoJyAnKTtcbiAgICAgICAgdmFyIHN0YXJ0RXZlbnRzID0gJ3dlYmtpdEFuaW1hdGlvblN0YXJ0IGFuaW1hdGlvbnN0YXJ0IG9BbmltYXRpb25TdGFydCBNU0FuaW1hdGlvblN0YXJ0Jy5zcGxpdCgnICcpO1xuXG4gICAgICAgIHZhciBpO1xuICAgICAgICB2YXIgbCA9IGJyb3dzZXJQcmVmaXhlcy5sZW5ndGg7XG5cbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgICAgaWYgKChicm93c2VyUHJlZml4ZXNbaV0gKyAnQW5pbWF0aW9uTmFtZScpIGluIHRlc3RFbGVtZW50LnN0eWxlKSB7XG4gICAgICAgICAgICAgICAga2V5ZnJhbWVQcmVmaXggPSAnLScgKyBicm93c2VyUHJlZml4ZXNbaV0udG9Mb3dlckNhc2UoKSArICctJztcbiAgICAgICAgICAgICAgICBhbmltYXRpb25TdGFydEV2ZW50ID0gc3RhcnRFdmVudHNbaV07XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBhbmltYXRpb25Qcm9wZXJ0aWVzRm9yQnJvd3NlciA9IHtcbiAgICAgICAgICAgIGtleWZyYW1lc1J1bGU6ICdAJyArIGtleWZyYW1lUHJlZml4ICsgJ2tleWZyYW1lcyAnICsgYW5pbWF0aW9uTmFtZSArICcge2Zyb20geyBvcGFjaXR5OiAwOyB9IHRvIHsgb3BhY2l0eTogMDsgfX0nLFxuICAgICAgICAgICAgc3R5bGVEZWNsYXJhdGlvbjoga2V5ZnJhbWVQcmVmaXggKyAnYW5pbWF0aW9uOiAxbXMgJyArIGFuaW1hdGlvbk5hbWUgKyAnOycsXG4gICAgICAgICAgICBhbmltYXRpb25TdGFydEV2ZW50OiBhbmltYXRpb25TdGFydEV2ZW50LFxuICAgICAgICAgICAgYW5pbWF0aW9uTmFtZTogYW5pbWF0aW9uTmFtZVxuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiBhbmltYXRpb25Qcm9wZXJ0aWVzRm9yQnJvd3NlcjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBpc0NTU0FuaW1hdGlvblN1cHBvcnRlZCAoKSB7XG4gICAgICAgIGlmIChpc0Nzc0FuaW1hdGlvblN1cHBvcnRlZCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuIGlzQ3NzQW5pbWF0aW9uU3VwcG9ydGVkO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHRlc3RFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIHZhciBpc0FuaW1hdGlvblN1cHBvcnRlZCA9ICgnYW5pbWF0aW9uTmFtZScgaW4gdGVzdEVsZW1lbnQuc3R5bGUpO1xuXG4gICAgICAgIGlmIChpc0FuaW1hdGlvblN1cHBvcnRlZCkge1xuICAgICAgICAgICAgaXNDc3NBbmltYXRpb25TdXBwb3J0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgcmV0dXJuIGlzQ3NzQW5pbWF0aW9uU3VwcG9ydGVkO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGJyb3dzZXJQcmVmaXhlcyA9ICdXZWJraXQgTW96IE8gbXMnLnNwbGl0KCcgJyk7XG4gICAgICAgIHZhciBpID0gMDtcbiAgICAgICAgdmFyIGwgPSBicm93c2VyUHJlZml4ZXMubGVuZ3RoO1xuXG4gICAgICAgIGZvciAoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoKGJyb3dzZXJQcmVmaXhlc1tpXSArICdBbmltYXRpb25OYW1lJykgaW4gdGVzdEVsZW1lbnQuc3R5bGUpIHtcbiAgICAgICAgICAgICAgICBpc0Nzc0FuaW1hdGlvblN1cHBvcnRlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGlzQ3NzQW5pbWF0aW9uU3VwcG9ydGVkO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaXNDc3NBbmltYXRpb25TdXBwb3J0ZWQgPSBmYWxzZTtcbiAgICAgICAgcmV0dXJuIGlzQ3NzQW5pbWF0aW9uU3VwcG9ydGVkO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFkZHMgYSBzdHlsZSBibG9jayB0aGF0IGNvbnRhaW5zIENTUyBlc3NlbnRpYWwgZm9yIGRldGVjdGluZyByZXNpemUgZXZlbnRzXG4gICAgICovXG4gICAgZnVuY3Rpb24gaW5zZXJ0UmVzaXplU2Vuc29yU3R5bGVzICgpIHtcbiAgICAgICAgdmFyIGNzc1J1bGVzID0gW1xuICAgICAgICAgICAgKGdldEFuaW1hdGlvblByb3BlcnRpZXNGb3JCcm93c2VyKCkua2V5ZnJhbWVzUnVsZSkgPyBnZXRBbmltYXRpb25Qcm9wZXJ0aWVzRm9yQnJvd3NlcigpLmtleWZyYW1lc1J1bGUgOiAnJyxcbiAgICAgICAgICAgICcuUmVzaXplU2Vuc29yX19yZXNpemVUcmlnZ2VycyB7ICcgKyAoKGdldEFuaW1hdGlvblByb3BlcnRpZXNGb3JCcm93c2VyKCkuc3R5bGVEZWNsYXJhdGlvbikgPyBnZXRBbmltYXRpb25Qcm9wZXJ0aWVzRm9yQnJvd3NlcigpLnN0eWxlRGVjbGFyYXRpb24gOiAnJykgKyAnIHZpc2liaWxpdHk6IGhpZGRlbjsgb3BhY2l0eTogMDsgfScsXG4gICAgICAgICAgICAnLlJlc2l6ZVNlbnNvcl9fcmVzaXplVHJpZ2dlcnMsIC5SZXNpemVTZW5zb3JfX3Jlc2l6ZVRyaWdnZXJzID4gZGl2LCAuUmVzaXplU2Vuc29yX19jb250cmFjdFRyaWdnZXI6YmVmb3JlIHsgY29udGVudDogXFwnIFxcJzsgZGlzcGxheTogYmxvY2s7IHBvc2l0aW9uOiBhYnNvbHV0ZTsgdG9wOiAwOyBsZWZ0OiAwOyBoZWlnaHQ6IDEwMCU7IHdpZHRoOiAxMDAlOyBvdmVyZmxvdzogaGlkZGVuOyB9IC5SZXNpemVTZW5zb3JfX3Jlc2l6ZVRyaWdnZXJzID4gZGl2IHsgYmFja2dyb3VuZDogI2VlZTsgb3ZlcmZsb3c6IGF1dG87IH0gLlJlc2l6ZVNlbnNvcl9fY29udHJhY3RUcmlnZ2VyOmJlZm9yZSB7IHdpZHRoOiAyMDAlOyBoZWlnaHQ6IDIwMCU7IH0nXG4gICAgICAgIF07XG5cbiAgICAgICAgY3NzUnVsZXMgPSBjc3NSdWxlcy5qb2luKCcgJyk7XG5cbiAgICAgICAgdmFyIGhlYWRFbGVtID0gZG9jdW1lbnQuaGVhZCB8fCBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaGVhZCcpWzBdO1xuXG4gICAgICAgIHZhciBzdHlsZUVsZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpO1xuICAgICAgICBzdHlsZUVsZW0udHlwZSA9ICd0ZXh0L2Nzcyc7XG5cbiAgICAgICAgaWYgKHN0eWxlRWxlbS5zdHlsZVNoZWV0KSB7XG4gICAgICAgICAgICBzdHlsZUVsZW0uc3R5bGVTaGVldC5jc3NUZXh0ID0gY3NzUnVsZXM7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzdHlsZUVsZW0uYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoY3NzUnVsZXMpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGhlYWRFbGVtLmFwcGVuZENoaWxkKHN0eWxlRWxlbSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgaW5zZXJ0UmVzaXplU2Vuc29yU3R5bGVzOiBpbnNlcnRSZXNpemVTZW5zb3JTdHlsZXMsXG4gICAgICAgIGlzQW5pbWF0aW9uU3VwcG9ydGVkOiBpc0NTU0FuaW1hdGlvblN1cHBvcnRlZCxcbiAgICAgICAgZ2V0QW5pbWF0aW9uUHJvcGVydGllc0ZvckJyb3dzZXI6IGdldEFuaW1hdGlvblByb3BlcnRpZXNGb3JCcm93c2VyXG4gICAgfVxufSkoKTtcblxubW9kdWxlLmV4cG9ydHMgPSBjc3M7XG4iLCJ2YXIgZ2V0U3R5bGUgPSAoZnVuY3Rpb24gKGdsb2JhbCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gcHJvcGVydHlcbiAgICAgKiBAcmV0dXJucyB7bnVsbHxzdHJpbmd9XG4gICAgICovXG4gICAgcmV0dXJuIGZ1bmN0aW9uIChlbGVtZW50LCBwcm9wZXJ0eSkge1xuICAgICAgICBpZiAoISgnY3VycmVudFN0eWxlJyBpbiBlbGVtZW50KSAmJiAhKCdnZXRDb21wdXRlZFN0eWxlJyBpbiBnbG9iYWwpKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChlbGVtZW50LmN1cnJlbnRTdHlsZSkge1xuICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnQuY3VycmVudFN0eWxlW3Byb3BlcnR5XTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBnbG9iYWwuZG9jdW1lbnQuZGVmYXVsdFZpZXcuZ2V0Q29tcHV0ZWRTdHlsZShlbGVtZW50LCBudWxsKS5nZXRQcm9wZXJ0eVZhbHVlKHByb3BlcnR5KTtcbiAgICB9XG59KSh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyA/IHdpbmRvdyA6IHRoaXMpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGdldFN0eWxlO1xuIiwidmFyIHBvbHlmaWxsID0gKGZ1bmN0aW9uICgpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICAvKipcbiAgICAgKiBAc2VlIGh0dHBzOi8vZ2lzdC5naXRodWIuY29tL21yZG9vYi84Mzg3ODVcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBwb2x5ZmlsbFJlcXVlc3RBbmltYXRpb25GcmFtZSAoKSB7XG4gICAgXHRpZiAoIXdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUpIHtcbiAgICBcdFx0d2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSA9IChmdW5jdGlvbiAoKSB7XG4gICAgXHRcdFx0cmV0dXJuIHdpbmRvdy53ZWJraXRSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHxcbiAgICBcdFx0XHRcdHdpbmRvdy5tb3pSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHxcbiAgICBcdFx0XHRcdHdpbmRvdy5vUmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8XG4gICAgXHRcdFx0XHR3aW5kb3cubXNSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHxcbiAgICBcdFx0XHRcdGZ1bmN0aW9uIChjYWxsYmFjaykge1xuICAgIFx0XHRcdFx0XHR3aW5kb3cuc2V0VGltZW91dChjYWxsYmFjaywgMTAwMCAvIDYwKTtcbiAgICBcdFx0XHRcdH07XG4gICAgXHRcdH0pKCk7XG4gICAgXHR9XG5cbiAgICBcdGlmICghd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lKSB7XG4gICAgXHRcdHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZSA9IChmdW5jdGlvbiAoKSB7XG4gICAgXHRcdFx0cmV0dXJuIHdpbmRvdy53ZWJraXRDYW5jZWxBbmltYXRpb25GcmFtZSB8fFxuICAgIFx0XHRcdFx0d2luZG93Lm1vekNhbmNlbEFuaW1hdGlvbkZyYW1lIHx8XG4gICAgXHRcdFx0XHR3aW5kb3cub0NhbmNlbEFuaW1hdGlvbkZyYW1lIHx8XG4gICAgXHRcdFx0XHR3aW5kb3cubXNDYW5jZWxBbmltYXRpb25GcmFtZSB8fFxuICAgIFx0XHRcdFx0d2luZG93LmNsZWFyVGltZW91dDtcbiAgICBcdFx0fSkoKTtcbiAgICBcdH1cbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWU6IHBvbHlmaWxsUmVxdWVzdEFuaW1hdGlvbkZyYW1lXG4gICAgfVxufSkoKTtcblxubW9kdWxlLmV4cG9ydHMgPSBwb2x5ZmlsbDtcbiIsInZhciByZXNpemVTZW5zb3JGYWN0b3J5ID0gKGZ1bmN0aW9uICgpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICAvKiogQHZhciB7RnVuY3Rpb259ICovXG4gICAgdmFyIGdldFN0eWxlID0gcmVxdWlyZSgnLi9nZXRTdHlsZScpO1xuICAgIC8qKiBAdmFyIHtPYmplY3R9ICovXG4gICAgdmFyIGNzcyA9IHJlcXVpcmUoJy4vY3NzJyk7XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSB0YXJnZXRFbGVtZW50XG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2tcbiAgICAgKiBAY29uc3RydWN0b3JcbiAgICAgKi9cbiAgICB2YXIgcmVzaXplU2Vuc29yID0gZnVuY3Rpb24gKHRhcmdldEVsZW1lbnQsIGNhbGxiYWNrKSB7XG4gICAgICAgIC8qKiBAdmFyIHtIVE1MRWxlbWVudH0gKi9cbiAgICAgICAgdGhpcy50YXJnZXRFbGVtZW50ID0gdGFyZ2V0RWxlbWVudDtcbiAgICAgICAgLyoqIEB2YXIge0Z1bmN0aW9ufSAqL1xuICAgICAgICB0aGlzLmNhbGxiYWNrID0gY2FsbGJhY2s7XG4gICAgICAgIC8qKiBAdmFyIHt7d2lkdGg6IGludCwgaGVpZ2h0OiBpbnR9fSAqL1xuICAgICAgICB0aGlzLmRpbWVuc2lvbnMgPSB7XG4gICAgICAgICAgICB3aWR0aDogMCxcbiAgICAgICAgICAgIGhlaWdodDogMFxuICAgICAgICB9O1xuXG4gICAgICAgIGlmICgnYXR0YWNoRXZlbnQnIGluIGRvY3VtZW50KSB7XG4gICAgICAgICAgICB0aGlzLmJvdW5kT25SZXNpemVIYW5kbGVyID0gdGhpcy5vbkVsZW1lbnRSZXNpemUuYmluZCh0aGlzKTtcbiAgICAgICAgICAgIHRoaXMudGFyZ2V0RWxlbWVudC5hdHRhY2hFdmVudCgnb25yZXNpemUnLCB0aGlzLmJvdW5kT25SZXNpemVIYW5kbGVyKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKiBAdmFyIHt7Y29udGFpbmVyOiBIVE1MRWxlbWVudCwgZXhwYW5kOiBIVE1MRWxlbWVudCwgZXhwYW5kQ2hpbGQ6IEhUTUxFbGVtZW50LCBjb250cmFjdDogSFRNTEVsZW1lbnR9fSAqL1xuICAgICAgICB0aGlzLnRyaWdnZXJFbGVtZW50cyA9IHt9O1xuICAgICAgICAvKiogQHZhciB7aW50fSAqL1xuICAgICAgICB0aGlzLnJlc2l6ZVJBRiA9IDA7XG5cbiAgICAgICAgdGhpcy5zZXR1cCgpO1xuICAgIH07XG5cbiAgICByZXNpemVTZW5zb3IucHJvdG90eXBlLnNldHVwID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAvLyBNYWtlIHN1cmUgdGhlIHRhcmdldCBlbGVtZW50IGlzIFwicG9zaXRpb25lZFwiXG4gICAgICAgIGlmIChnZXRTdHlsZSh0aGlzLnRhcmdldEVsZW1lbnQsICdwb3NpdGlvbicpID09PSAnc3RhdGljJykge1xuICAgICAgICAgICAgdGhpcy50YXJnZXRFbGVtZW50LnN0eWxlLnBvc2l0aW9uID0gJ3JlbGF0aXZlJztcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENyZWF0ZSBhbmQgYXBwZW5kIHJlc2l6ZSB0cmlnZ2VyIGVsZW1lbnRzXG4gICAgICAgIHRoaXMuaW5zZXJ0UmVzaXplVHJpZ2dlckVsZW1lbnRzKCk7XG5cbiAgICAgICAgLy8gU3RhcnQgbGlzdGVuaW5nIHRvIGV2ZW50c1xuICAgICAgICB0aGlzLmJvdW5kU2Nyb2xsTGlzdGVuZXIgPSB0aGlzLmhhbmRsZUVsZW1lbnRTY3JvbGwuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy50YXJnZXRFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIHRoaXMuYm91bmRTY3JvbGxMaXN0ZW5lciwgdHJ1ZSk7XG5cbiAgICAgICAgaWYgKGNzcy5pc0FuaW1hdGlvblN1cHBvcnRlZCgpKSB7XG4gICAgICAgICAgICB0aGlzLmJvdW5kQW5pbWF0aW9uU3RhcnRMaXN0ZW5lciA9IHRoaXMucmVzZXRUcmlnZ2Vyc09uQW5pbWF0aW9uU3RhcnQuYmluZCh0aGlzKTtcbiAgICAgICAgICAgIHRoaXMudHJpZ2dlckVsZW1lbnRzLmNvbnRhaW5lci5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgICAgICAgICAgIGNzcy5nZXRBbmltYXRpb25Qcm9wZXJ0aWVzRm9yQnJvd3NlcigpLmFuaW1hdGlvblN0YXJ0RXZlbnQsXG4gICAgICAgICAgICAgICAgdGhpcy5ib3VuZEFuaW1hdGlvblN0YXJ0TGlzdGVuZXJcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBJbml0aWFsIHZhbHVlIHJlc2V0IG9mIGFsbCB0cmlnZ2Vyc1xuICAgICAgICB0aGlzLnJlc2V0VHJpZ2dlcnMoKTtcbiAgICB9O1xuXG4gICAgcmVzaXplU2Vuc29yLnByb3RvdHlwZS5pbnNlcnRSZXNpemVUcmlnZ2VyRWxlbWVudHMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciByZXNpemVUcmlnZ2VyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIHZhciBleHBhbmRUcmlnZ2VyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIHZhciBleHBhbmRUcmlnZ2VyQ2hpbGQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgdmFyIGNvbnRyYWN0VHJpZ2dlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuXG4gICAgICAgIHJlc2l6ZVRyaWdnZXIuY2xhc3NOYW1lID0gJ1Jlc2l6ZVNlbnNvciBSZXNpemVTZW5zb3JfX3Jlc2l6ZVRyaWdnZXJzJztcbiAgICAgICAgZXhwYW5kVHJpZ2dlci5jbGFzc05hbWUgPSAnUmVzaXplU2Vuc29yX19leHBhbmRUcmlnZ2VyJztcbiAgICAgICAgY29udHJhY3RUcmlnZ2VyLmNsYXNzTmFtZSA9ICdSZXNpemVTZW5zb3JfX2NvbnRyYWN0VHJpZ2dlcic7XG5cbiAgICAgICAgZXhwYW5kVHJpZ2dlci5hcHBlbmRDaGlsZChleHBhbmRUcmlnZ2VyQ2hpbGQpO1xuICAgICAgICByZXNpemVUcmlnZ2VyLmFwcGVuZENoaWxkKGV4cGFuZFRyaWdnZXIpO1xuICAgICAgICByZXNpemVUcmlnZ2VyLmFwcGVuZENoaWxkKGNvbnRyYWN0VHJpZ2dlcik7XG5cbiAgICAgICAgdGhpcy50cmlnZ2VyRWxlbWVudHMuY29udGFpbmVyID0gcmVzaXplVHJpZ2dlcjtcbiAgICAgICAgdGhpcy50cmlnZ2VyRWxlbWVudHMuZXhwYW5kID0gZXhwYW5kVHJpZ2dlcjtcbiAgICAgICAgdGhpcy50cmlnZ2VyRWxlbWVudHMuZXhwYW5kQ2hpbGQgPSBleHBhbmRUcmlnZ2VyQ2hpbGQ7XG4gICAgICAgIHRoaXMudHJpZ2dlckVsZW1lbnRzLmNvbnRyYWN0ID0gY29udHJhY3RUcmlnZ2VyO1xuXG4gICAgICAgIHRoaXMudGFyZ2V0RWxlbWVudC5hcHBlbmRDaGlsZChyZXNpemVUcmlnZ2VyKTtcbiAgICB9O1xuXG4gICAgcmVzaXplU2Vuc29yLnByb3RvdHlwZS5vbkVsZW1lbnRSZXNpemUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBjdXJyZW50RGltZW5zaW9ucyA9IHRoaXMuZ2V0RGltZW5zaW9ucygpO1xuXG4gICAgICAgIGlmICh0aGlzLmlzUmVzaXplZChjdXJyZW50RGltZW5zaW9ucykpIHtcbiAgICAgICAgICAgIHRoaXMuZGltZW5zaW9ucy53aWR0aCA9IGN1cnJlbnREaW1lbnNpb25zLndpZHRoO1xuICAgICAgICAgICAgdGhpcy5kaW1lbnNpb25zLmhlaWdodCA9IGN1cnJlbnREaW1lbnNpb25zLmhlaWdodDtcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudFJlc2l6ZWQoKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICByZXNpemVTZW5zb3IucHJvdG90eXBlLmhhbmRsZUVsZW1lbnRTY3JvbGwgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgICAgdGhpcy5yZXNldFRyaWdnZXJzKCk7XG5cbiAgICAgICAgaWYgKHRoaXMucmVzaXplUkFGKSB7XG4gICAgICAgICAgICB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUodGhpcy5yZXNpemVSQUYpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5yZXNpemVSQUYgPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBjdXJyZW50RGltZW5zaW9ucyA9IF90aGlzLmdldERpbWVuc2lvbnMoKTtcbiAgICAgICAgICAgIGlmIChfdGhpcy5pc1Jlc2l6ZWQoY3VycmVudERpbWVuc2lvbnMpKSB7XG4gICAgICAgICAgICAgICAgX3RoaXMuZGltZW5zaW9ucy53aWR0aCA9IGN1cnJlbnREaW1lbnNpb25zLndpZHRoO1xuICAgICAgICAgICAgICAgIF90aGlzLmRpbWVuc2lvbnMuaGVpZ2h0ID0gY3VycmVudERpbWVuc2lvbnMuaGVpZ2h0O1xuICAgICAgICAgICAgICAgIF90aGlzLmVsZW1lbnRSZXNpemVkKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge3t3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn19IGN1cnJlbnREaW1lbnNpb25zXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAgICovXG4gICAgcmVzaXplU2Vuc29yLnByb3RvdHlwZS5pc1Jlc2l6ZWQgPSBmdW5jdGlvbiAoY3VycmVudERpbWVuc2lvbnMpIHtcbiAgICAgICAgcmV0dXJuIChjdXJyZW50RGltZW5zaW9ucy53aWR0aCAhPT0gdGhpcy5kaW1lbnNpb25zLndpZHRoIHx8IGN1cnJlbnREaW1lbnNpb25zLmhlaWdodCAhPT0gdGhpcy5kaW1lbnNpb25zLmhlaWdodClcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQHJldHVybnMge3t3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn19XG4gICAgICovXG4gICAgcmVzaXplU2Vuc29yLnByb3RvdHlwZS5nZXREaW1lbnNpb25zID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgd2lkdGg6IHRoaXMudGFyZ2V0RWxlbWVudC5vZmZzZXRXaWR0aCxcbiAgICAgICAgICAgIGhlaWdodDogdGhpcy50YXJnZXRFbGVtZW50Lm9mZnNldEhlaWdodFxuICAgICAgICB9O1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge0V2ZW50fSBldmVudFxuICAgICAqL1xuICAgIHJlc2l6ZVNlbnNvci5wcm90b3R5cGUucmVzZXRUcmlnZ2Vyc09uQW5pbWF0aW9uU3RhcnQgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgaWYgKGV2ZW50LmFuaW1hdGlvbk5hbWUgPT09IGNzcy5nZXRBbmltYXRpb25Qcm9wZXJ0aWVzRm9yQnJvd3NlcigpLmFuaW1hdGlvbk5hbWUpIHtcbiAgICAgICAgICAgIHRoaXMucmVzZXRUcmlnZ2VycygpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHJlc2l6ZVNlbnNvci5wcm90b3R5cGUucmVzZXRUcmlnZ2VycyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy50cmlnZ2VyRWxlbWVudHMuY29udHJhY3Quc2Nyb2xsTGVmdCA9IHRoaXMudHJpZ2dlckVsZW1lbnRzLmNvbnRyYWN0LnNjcm9sbFdpZHRoO1xuICAgICAgICB0aGlzLnRyaWdnZXJFbGVtZW50cy5jb250cmFjdC5zY3JvbGxUb3AgPSB0aGlzLnRyaWdnZXJFbGVtZW50cy5jb250cmFjdC5zY3JvbGxIZWlnaHQ7XG4gICAgICAgIHRoaXMudHJpZ2dlckVsZW1lbnRzLmV4cGFuZENoaWxkLnN0eWxlLndpZHRoID0gdGhpcy50cmlnZ2VyRWxlbWVudHMuZXhwYW5kLm9mZnNldFdpZHRoICsgMSArICdweCc7XG4gICAgICAgIHRoaXMudHJpZ2dlckVsZW1lbnRzLmV4cGFuZENoaWxkLnN0eWxlLmhlaWdodCA9IHRoaXMudHJpZ2dlckVsZW1lbnRzLmV4cGFuZC5vZmZzZXRIZWlnaHQgKyAxICsgJ3B4JztcbiAgICAgICAgdGhpcy50cmlnZ2VyRWxlbWVudHMuZXhwYW5kLnNjcm9sbExlZnQgPSB0aGlzLnRyaWdnZXJFbGVtZW50cy5leHBhbmQuc2Nyb2xsV2lkdGg7XG4gICAgICAgIHRoaXMudHJpZ2dlckVsZW1lbnRzLmV4cGFuZC5zY3JvbGxUb3AgPSB0aGlzLnRyaWdnZXJFbGVtZW50cy5leHBhbmQuc2Nyb2xsSGVpZ2h0O1xuICAgIH07XG5cbiAgICByZXNpemVTZW5zb3IucHJvdG90eXBlLmVsZW1lbnRSZXNpemVkID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmNhbGxiYWNrKHRoaXMuZGltZW5zaW9ucyk7XG4gICAgfTtcblxuICAgIHJlc2l6ZVNlbnNvci5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5yZW1vdmVFdmVudExpc3RlbmVycygpO1xuICAgICAgICB0aGlzLnRhcmdldEVsZW1lbnQucmVtb3ZlQ2hpbGQodGhpcy50cmlnZ2VyRWxlbWVudHMuY29udGFpbmVyKTtcbiAgICAgICAgZGVsZXRlIHRoaXMuYm91bmRBbmltYXRpb25TdGFydExpc3RlbmVyO1xuICAgICAgICBkZWxldGUgdGhpcy5ib3VuZFNjcm9sbExpc3RlbmVyO1xuICAgICAgICBkZWxldGUgdGhpcy5jYWxsYmFjaztcbiAgICAgICAgZGVsZXRlIHRoaXMudGFyZ2V0RWxlbWVudDtcbiAgICB9O1xuXG4gICAgcmVzaXplU2Vuc29yLnByb3RvdHlwZS5yZW1vdmVFdmVudExpc3RlbmVycyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKCdhdHRhY2hFdmVudCcgaW4gZG9jdW1lbnQpIHtcbiAgICAgICAgICAgIHRoaXMudGFyZ2V0RWxlbWVudC5kZXRhY2hFdmVudCgnb25yZXNpemUnLCB0aGlzLmJvdW5kT25SZXNpemVIYW5kbGVyKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMudHJpZ2dlckVsZW1lbnRzLmNvbnRhaW5lci5yZW1vdmVFdmVudExpc3RlbmVyKFxuICAgICAgICAgICAgY3NzLmdldEFuaW1hdGlvblByb3BlcnRpZXNGb3JCcm93c2VyKCkuYW5pbWF0aW9uU3RhcnRFdmVudCxcbiAgICAgICAgICAgIHRoaXMuYm91bmRBbmltYXRpb25TdGFydExpc3RlbmVyXG4gICAgICAgICk7XG4gICAgICAgIHRoaXMudGFyZ2V0RWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdzY3JvbGwnLCB0aGlzLmJvdW5kU2Nyb2xsTGlzdGVuZXIsIHRydWUpO1xuICAgIH07XG5cbiAgICByZXR1cm4ge1xuICAgICAgICAvKipcbiAgICAgICAgICogQHBhcmFtIHtFbGVtZW50fSB0YXJnZXRFbGVtZW50XG4gICAgICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrXG4gICAgICAgICAqIEByZXR1cm5zIHtyZXNpemVTZW5zb3J9XG4gICAgICAgICAqL1xuICAgICAgICBjcmVhdGU6IGZ1bmN0aW9uICh0YXJnZXRFbGVtZW50LCBjYWxsYmFjaykge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyByZXNpemVTZW5zb3IodGFyZ2V0RWxlbWVudCwgY2FsbGJhY2spO1xuICAgICAgICB9XG4gICAgfVxufSkoKTtcblxubW9kdWxlLmV4cG9ydHMgPSByZXNpemVTZW5zb3JGYWN0b3J5O1xuIiwidmFyIHNlbnNvcnMgPSAoZnVuY3Rpb24gKCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIC8qKiBAdmFyIHtPYmplY3R9ICovXG4gICAgdmFyIGNzcyA9IHJlcXVpcmUoJy4vY3NzJyk7XG4gICAgLyoqIEB2YXIge09iamVjdH0gKi9cbiAgICB2YXIgcG9seWZpbGwgPSByZXF1aXJlKCcuL3BvbHlmaWxsJyk7XG4gICAgLyoqIEB2YXIge09iamVjdH0gKi9cbiAgICB2YXIgcmVzaXplU2Vuc29yRmFjdG9yeSA9IHJlcXVpcmUoJy4vcmVzaXplU2Vuc29yJyk7XG5cbiAgICAvKioge2FycmF5fSAqL1xuICAgIHZhciB1bnN1aXRhYmxlRWxlbWVudHMgPSBbJ0lNRycsICdDT0wnLCAnVFInLCAnVEhFQUQnLCAnVEZPT1QnXTtcbiAgICAvKioge2Jvb2xlYW59ICovXG4gICAgdmFyIHN1cHBvcnRzQXR0YWNoRXZlbnQgPSAoJ2F0dGFjaEV2ZW50JyBpbiBkb2N1bWVudCk7XG5cbiAgICAvKioge3t9fSBNYXAgb2YgYWxsIHJlc2l6ZSBzZW5zb3JzIChpZCA9PiBSZXNpemVTZW5zb3IpICovXG4gICAgdmFyIGFsbFJlc2l6ZVNlbnNvcnMgPSB7fTtcblxuICAgIGlmICghc3VwcG9ydHNBdHRhY2hFdmVudCkge1xuICAgICAgICBjc3MuaW5zZXJ0UmVzaXplU2Vuc29yU3R5bGVzKCk7XG5cbiAgICAgICAgaWYgKCEoJ3JlcXVlc3RBbmltYXRpb25GcmFtZScgaW4gd2luZG93KSB8fCAhKCdjYW5jZWxBbmltYXRpb25GcmFtZScgaW4gd2luZG93KSkge1xuICAgICAgICAgICAgcG9seWZpbGwucmVxdWVzdEFuaW1hdGlvbkZyYW1lKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge0VsZW1lbnR9IHRhcmdldEVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFja1xuICAgICAqIEByZXR1cm5zIHtyZXNpemVTZW5zb3J9XG4gICAgICovXG4gICAgZnVuY3Rpb24gY3JlYXRlICh0YXJnZXRFbGVtZW50LCBjYWxsYmFjaykge1xuICAgICAgICBpZiAoaXNVbnN1aXRhYmxlRWxlbWVudCh0YXJnZXRFbGVtZW50KSkge1xuICAgICAgICAgICAgY29uc29sZSAmJiBjb25zb2xlLmVycm9yKFwiR2l2ZW4gZWxlbWVudCBpc24ndCBzdWl0YWJsZSB0byBhY3QgYXMgYSByZXNpemUgc2Vuc29yLiBUcnkgd3JhcHBpbmcgaXQgd2l0aCBvbmUgdGhhdCBpcy4gVW5zdWl0YWJsZSBlbGVtZW50cyBhcmU6XCIsIHVuc3VpdGFibGVFbGVtZW50cyk7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBzZW5zb3JJZCA9IGdldFNlbnNvcklkKHRhcmdldEVsZW1lbnQpO1xuXG4gICAgICAgIGlmIChhbGxSZXNpemVTZW5zb3JzW3NlbnNvcklkXSkge1xuICAgICAgICAgICAgcmV0dXJuIGFsbFJlc2l6ZVNlbnNvcnNbc2Vuc29ySWRdO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHNlbnNvciA9IHJlc2l6ZVNlbnNvckZhY3RvcnkuY3JlYXRlKHRhcmdldEVsZW1lbnQsIGNhbGxiYWNrKTtcbiAgICAgICAgYWxsUmVzaXplU2Vuc29yc1tzZW5zb3JJZF0gPSBzZW5zb3I7XG4gICAgICAgIHJldHVybiBzZW5zb3I7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtFbGVtZW50fSB0YXJnZXRFbGVtZW50XG4gICAgICovXG4gICAgZnVuY3Rpb24gZGVzdHJveSAodGFyZ2V0RWxlbWVudCkge1xuICAgICAgICB2YXIgc2Vuc29ySWQgPSBnZXRTZW5zb3JJZCh0YXJnZXRFbGVtZW50KTtcbiAgICAgICAgdmFyIHNlbnNvciA9IGFsbFJlc2l6ZVNlbnNvcnNbc2Vuc29ySWRdO1xuXG4gICAgICAgIGlmICghc2Vuc29yKSB7XG4gICAgICAgICAgICBjb25zb2xlICYmIGNvbnNvbGUuZXJyb3IoXCJDYW4ndCBkZXN0cm95IFJlc2l6ZVNlbnNvciAoNDA0IG5vdCBmb3VuZCkuXCIsIHRhcmdldEVsZW1lbnQpO1xuICAgICAgICB9XG5cbiAgICAgICAgc2Vuc29yLmRlc3Ryb3koKTtcbiAgICAgICAgZGVsZXRlIGFsbFJlc2l6ZVNlbnNvcnNbc2Vuc29ySWRdO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7RWxlbWVudH0gdGFyZ2V0RWxlbWVudFxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAgICovXG4gICAgZnVuY3Rpb24gZ2V0U2Vuc29ySWQgKHRhcmdldEVsZW1lbnQpIHtcbiAgICAgICAgcmV0dXJuIHRhcmdldEVsZW1lbnQuaWQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gdGFyZ2V0RWxlbWVudFxuICAgICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGlzVW5zdWl0YWJsZUVsZW1lbnQgKHRhcmdldEVsZW1lbnQpIHtcbiAgICAgICAgdmFyIHRhZ05hbWUgPSB0YXJnZXRFbGVtZW50LnRhZ05hbWUudG9VcHBlckNhc2UoKTtcbiAgICAgICAgcmV0dXJuICh1bnN1aXRhYmxlRWxlbWVudHMuaW5kZXhPZih0YWdOYW1lKSA+IC0xKTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBjcmVhdGU6IGNyZWF0ZSxcbiAgICAgICAgZGVzdHJveTogZGVzdHJveVxuICAgIH1cbn0pKCk7XG5cbm1vZHVsZS5leHBvcnRzID0gc2Vuc29yczsiXX0=
