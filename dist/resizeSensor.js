!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define("resizeSensor",[],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.resizeSensor=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var css = (function (global) {
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

        var testElement = global.document.createElement('div');
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
        var browserPrefixes = ['Webkit', 'Moz', 'O', 'ms'];
        var startEvents = ['webkitAnimationStart', 'animationstart', 'oAnimationStart', 'MSAnimationStart'];

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

        var testElement = global.document.createElement('div');
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

        var headElem = global.document.head || global.document.getElementsByTagName('head')[0];

        var styleElem = global.document.createElement('style');
        styleElem.type = 'text/css';

        if (styleElem.styleSheet) {
            styleElem.styleSheet.cssText = cssRules;
        } else {
            styleElem.appendChild(global.document.createTextNode(cssRules));
        }

        headElem.appendChild(styleElem);
    }

    return {
        insertResizeSensorStyles: insertResizeSensorStyles,
        isAnimationSupported: isCSSAnimationSupported,
        getAnimationPropertiesForBrowser: getAnimationPropertiesForBrowser
    };
})(typeof window !== 'undefined' ? window : this);

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
    };
})(typeof window !== 'undefined' ? window : this);

module.exports = getStyle;

},{}],3:[function(require,module,exports){
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
        return (currentDimensions.width !== this.dimensions.width || currentDimensions.height !== this.dimensions.height);
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
    };
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvY3NzLmpzIiwic3JjL2dldFN0eWxlLmpzIiwic3JjL3BvbHlmaWxsLmpzIiwic3JjL3Jlc2l6ZVNlbnNvci5qcyIsInNyYy9zZW5zb3JzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgY3NzID0gKGZ1bmN0aW9uIChnbG9iYWwpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICAvKiogQHZhciB7bnVsbHxPYmplY3R9ICovXG4gICAgdmFyIGFuaW1hdGlvblByb3BlcnRpZXNGb3JCcm93c2VyID0gbnVsbDtcbiAgICAvKiogQHZhciB7bnVsbHxib29sZWFufSAqL1xuICAgIHZhciBpc0Nzc0FuaW1hdGlvblN1cHBvcnRlZCA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBEZXRlcm1pbmVzIHdoaWNoIHN0eWxlIGNvbnZlbnRpb24gKHByb3BlcnRpZXMpIHRvIGZvbGxvd1xuICAgICAqIEBzZWUgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvR3VpZGUvQ1NTL1VzaW5nX0NTU19hbmltYXRpb25zL0RldGVjdGluZ19DU1NfYW5pbWF0aW9uX3N1cHBvcnRcbiAgICAgKiBAcmV0dXJucyB7e2tleWZyYW1lc1J1bGU6IHN0cmluZywgc3R5bGVEZWNsYXJhdGlvbjogc3RyaW5nLCBhbmltYXRpb25TdGFydEV2ZW50OiBzdHJpbmcsIGFuaW1hdGlvbk5hbWU6IHN0cmluZ319XG4gICAgICovXG4gICAgZnVuY3Rpb24gZ2V0QW5pbWF0aW9uUHJvcGVydGllc0ZvckJyb3dzZXIgKCkge1xuICAgICAgICBpZiAoYW5pbWF0aW9uUHJvcGVydGllc0ZvckJyb3dzZXIgIT09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiBhbmltYXRpb25Qcm9wZXJ0aWVzRm9yQnJvd3NlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciB0ZXN0RWxlbWVudCA9IGdsb2JhbC5kb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgdmFyIHN1cHBvcnRzVW5wcmVmaXhlZEFuaW1hdGlvblByb3BlcnRpZXMgPSAoJ2FuaW1hdGlvbk5hbWUnIGluIHRlc3RFbGVtZW50LnN0eWxlKTtcblxuICAgICAgICAvLyBVbnByZWZpeGVkIGFuaW1hdGlvbiBwcm9wZXJ0aWVzXG4gICAgICAgIHZhciBhbmltYXRpb25TdGFydEV2ZW50ID0gJ2FuaW1hdGlvbnN0YXJ0JztcbiAgICAgICAgdmFyIGFuaW1hdGlvbk5hbWUgPSAncmVzaXplYW5pbSc7XG5cbiAgICAgICAgaWYgKHN1cHBvcnRzVW5wcmVmaXhlZEFuaW1hdGlvblByb3BlcnRpZXMpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAga2V5ZnJhbWVzUnVsZTogJ0BrZXlmcmFtZXMgJyArIGFuaW1hdGlvbk5hbWUgKyAnIHtmcm9tIHsgb3BhY2l0eTogMDsgfSB0byB7IG9wYWNpdHk6IDA7IH19JyxcbiAgICAgICAgICAgICAgICBzdHlsZURlY2xhcmF0aW9uOiAnYW5pbWF0aW9uOiAxbXMgJyArIGFuaW1hdGlvbk5hbWUgKyAnOycsXG4gICAgICAgICAgICAgICAgYW5pbWF0aW9uU3RhcnRFdmVudDogYW5pbWF0aW9uU3RhcnRFdmVudCxcbiAgICAgICAgICAgICAgICBhbmltYXRpb25OYW1lOiBhbmltYXRpb25OYW1lXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQnJvd3NlciBzcGVjaWZpYyBhbmltYXRpb24gcHJvcGVydGllc1xuICAgICAgICB2YXIga2V5ZnJhbWVQcmVmaXggPSAnJztcbiAgICAgICAgdmFyIGJyb3dzZXJQcmVmaXhlcyA9IFsnV2Via2l0JywgJ01veicsICdPJywgJ21zJ107XG4gICAgICAgIHZhciBzdGFydEV2ZW50cyA9IFsnd2Via2l0QW5pbWF0aW9uU3RhcnQnLCAnYW5pbWF0aW9uc3RhcnQnLCAnb0FuaW1hdGlvblN0YXJ0JywgJ01TQW5pbWF0aW9uU3RhcnQnXTtcblxuICAgICAgICB2YXIgaTtcbiAgICAgICAgdmFyIGwgPSBicm93c2VyUHJlZml4ZXMubGVuZ3RoO1xuXG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICAgIGlmICgoYnJvd3NlclByZWZpeGVzW2ldICsgJ0FuaW1hdGlvbk5hbWUnKSBpbiB0ZXN0RWxlbWVudC5zdHlsZSkge1xuICAgICAgICAgICAgICAgIGtleWZyYW1lUHJlZml4ID0gJy0nICsgYnJvd3NlclByZWZpeGVzW2ldLnRvTG93ZXJDYXNlKCkgKyAnLSc7XG4gICAgICAgICAgICAgICAgYW5pbWF0aW9uU3RhcnRFdmVudCA9IHN0YXJ0RXZlbnRzW2ldO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgYW5pbWF0aW9uUHJvcGVydGllc0ZvckJyb3dzZXIgPSB7XG4gICAgICAgICAgICBrZXlmcmFtZXNSdWxlOiAnQCcgKyBrZXlmcmFtZVByZWZpeCArICdrZXlmcmFtZXMgJyArIGFuaW1hdGlvbk5hbWUgKyAnIHtmcm9tIHsgb3BhY2l0eTogMDsgfSB0byB7IG9wYWNpdHk6IDA7IH19JyxcbiAgICAgICAgICAgIHN0eWxlRGVjbGFyYXRpb246IGtleWZyYW1lUHJlZml4ICsgJ2FuaW1hdGlvbjogMW1zICcgKyBhbmltYXRpb25OYW1lICsgJzsnLFxuICAgICAgICAgICAgYW5pbWF0aW9uU3RhcnRFdmVudDogYW5pbWF0aW9uU3RhcnRFdmVudCxcbiAgICAgICAgICAgIGFuaW1hdGlvbk5hbWU6IGFuaW1hdGlvbk5hbWVcbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gYW5pbWF0aW9uUHJvcGVydGllc0ZvckJyb3dzZXI7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAgICovXG4gICAgZnVuY3Rpb24gaXNDU1NBbmltYXRpb25TdXBwb3J0ZWQgKCkge1xuICAgICAgICBpZiAoaXNDc3NBbmltYXRpb25TdXBwb3J0ZWQgIT09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiBpc0Nzc0FuaW1hdGlvblN1cHBvcnRlZDtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciB0ZXN0RWxlbWVudCA9IGdsb2JhbC5kb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgdmFyIGlzQW5pbWF0aW9uU3VwcG9ydGVkID0gKCdhbmltYXRpb25OYW1lJyBpbiB0ZXN0RWxlbWVudC5zdHlsZSk7XG5cbiAgICAgICAgaWYgKGlzQW5pbWF0aW9uU3VwcG9ydGVkKSB7XG4gICAgICAgICAgICBpc0Nzc0FuaW1hdGlvblN1cHBvcnRlZCA9IHRydWU7XG4gICAgICAgICAgICByZXR1cm4gaXNDc3NBbmltYXRpb25TdXBwb3J0ZWQ7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgYnJvd3NlclByZWZpeGVzID0gJ1dlYmtpdCBNb3ogTyBtcycuc3BsaXQoJyAnKTtcbiAgICAgICAgdmFyIGkgPSAwO1xuICAgICAgICB2YXIgbCA9IGJyb3dzZXJQcmVmaXhlcy5sZW5ndGg7XG5cbiAgICAgICAgZm9yICg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICAgIGlmICgoYnJvd3NlclByZWZpeGVzW2ldICsgJ0FuaW1hdGlvbk5hbWUnKSBpbiB0ZXN0RWxlbWVudC5zdHlsZSkge1xuICAgICAgICAgICAgICAgIGlzQ3NzQW5pbWF0aW9uU3VwcG9ydGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICByZXR1cm4gaXNDc3NBbmltYXRpb25TdXBwb3J0ZWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpc0Nzc0FuaW1hdGlvblN1cHBvcnRlZCA9IGZhbHNlO1xuICAgICAgICByZXR1cm4gaXNDc3NBbmltYXRpb25TdXBwb3J0ZWQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQWRkcyBhIHN0eWxlIGJsb2NrIHRoYXQgY29udGFpbnMgQ1NTIGVzc2VudGlhbCBmb3IgZGV0ZWN0aW5nIHJlc2l6ZSBldmVudHNcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBpbnNlcnRSZXNpemVTZW5zb3JTdHlsZXMgKCkge1xuICAgICAgICB2YXIgY3NzUnVsZXMgPSBbXG4gICAgICAgICAgICAoZ2V0QW5pbWF0aW9uUHJvcGVydGllc0ZvckJyb3dzZXIoKS5rZXlmcmFtZXNSdWxlKSA/IGdldEFuaW1hdGlvblByb3BlcnRpZXNGb3JCcm93c2VyKCkua2V5ZnJhbWVzUnVsZSA6ICcnLFxuICAgICAgICAgICAgJy5SZXNpemVTZW5zb3JfX3Jlc2l6ZVRyaWdnZXJzIHsgJyArICgoZ2V0QW5pbWF0aW9uUHJvcGVydGllc0ZvckJyb3dzZXIoKS5zdHlsZURlY2xhcmF0aW9uKSA/IGdldEFuaW1hdGlvblByb3BlcnRpZXNGb3JCcm93c2VyKCkuc3R5bGVEZWNsYXJhdGlvbiA6ICcnKSArICcgdmlzaWJpbGl0eTogaGlkZGVuOyBvcGFjaXR5OiAwOyB9JyxcbiAgICAgICAgICAgICcuUmVzaXplU2Vuc29yX19yZXNpemVUcmlnZ2VycywgLlJlc2l6ZVNlbnNvcl9fcmVzaXplVHJpZ2dlcnMgPiBkaXYsIC5SZXNpemVTZW5zb3JfX2NvbnRyYWN0VHJpZ2dlcjpiZWZvcmUgeyBjb250ZW50OiBcXCcgXFwnOyBkaXNwbGF5OiBibG9jazsgcG9zaXRpb246IGFic29sdXRlOyB0b3A6IDA7IGxlZnQ6IDA7IGhlaWdodDogMTAwJTsgd2lkdGg6IDEwMCU7IG92ZXJmbG93OiBoaWRkZW47IH0gLlJlc2l6ZVNlbnNvcl9fcmVzaXplVHJpZ2dlcnMgPiBkaXYgeyBiYWNrZ3JvdW5kOiAjZWVlOyBvdmVyZmxvdzogYXV0bzsgfSAuUmVzaXplU2Vuc29yX19jb250cmFjdFRyaWdnZXI6YmVmb3JlIHsgd2lkdGg6IDIwMCU7IGhlaWdodDogMjAwJTsgfSdcbiAgICAgICAgXTtcblxuICAgICAgICBjc3NSdWxlcyA9IGNzc1J1bGVzLmpvaW4oJyAnKTtcblxuICAgICAgICB2YXIgaGVhZEVsZW0gPSBnbG9iYWwuZG9jdW1lbnQuaGVhZCB8fCBnbG9iYWwuZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2hlYWQnKVswXTtcblxuICAgICAgICB2YXIgc3R5bGVFbGVtID0gZ2xvYmFsLmRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJyk7XG4gICAgICAgIHN0eWxlRWxlbS50eXBlID0gJ3RleHQvY3NzJztcblxuICAgICAgICBpZiAoc3R5bGVFbGVtLnN0eWxlU2hlZXQpIHtcbiAgICAgICAgICAgIHN0eWxlRWxlbS5zdHlsZVNoZWV0LmNzc1RleHQgPSBjc3NSdWxlcztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN0eWxlRWxlbS5hcHBlbmRDaGlsZChnbG9iYWwuZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoY3NzUnVsZXMpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGhlYWRFbGVtLmFwcGVuZENoaWxkKHN0eWxlRWxlbSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgaW5zZXJ0UmVzaXplU2Vuc29yU3R5bGVzOiBpbnNlcnRSZXNpemVTZW5zb3JTdHlsZXMsXG4gICAgICAgIGlzQW5pbWF0aW9uU3VwcG9ydGVkOiBpc0NTU0FuaW1hdGlvblN1cHBvcnRlZCxcbiAgICAgICAgZ2V0QW5pbWF0aW9uUHJvcGVydGllc0ZvckJyb3dzZXI6IGdldEFuaW1hdGlvblByb3BlcnRpZXNGb3JCcm93c2VyXG4gICAgfTtcbn0pKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93IDogdGhpcyk7XG5cbm1vZHVsZS5leHBvcnRzID0gY3NzO1xuIiwidmFyIGdldFN0eWxlID0gKGZ1bmN0aW9uIChnbG9iYWwpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50XG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHByb3BlcnR5XG4gICAgICogQHJldHVybnMge251bGx8c3RyaW5nfVxuICAgICAqL1xuICAgIHJldHVybiBmdW5jdGlvbiAoZWxlbWVudCwgcHJvcGVydHkpIHtcbiAgICAgICAgaWYgKCEoJ2N1cnJlbnRTdHlsZScgaW4gZWxlbWVudCkgJiYgISgnZ2V0Q29tcHV0ZWRTdHlsZScgaW4gZ2xvYmFsKSkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZWxlbWVudC5jdXJyZW50U3R5bGUpIHtcbiAgICAgICAgICAgIHJldHVybiBlbGVtZW50LmN1cnJlbnRTdHlsZVtwcm9wZXJ0eV07XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZ2xvYmFsLmRvY3VtZW50LmRlZmF1bHRWaWV3LmdldENvbXB1dGVkU3R5bGUoZWxlbWVudCwgbnVsbCkuZ2V0UHJvcGVydHlWYWx1ZShwcm9wZXJ0eSk7XG4gICAgfTtcbn0pKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93IDogdGhpcyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZ2V0U3R5bGU7XG4iLCJ2YXIgcG9seWZpbGwgPSAoZnVuY3Rpb24gKGdsb2JhbCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIC8qKlxuICAgICAqIEBzZWUgaHR0cHM6Ly9naXN0LmdpdGh1Yi5jb20vbXJkb29iLzgzODc4NVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHBvbHlmaWxsUmVxdWVzdEFuaW1hdGlvbkZyYW1lICgpIHtcbiAgICAgICAgaWYgKCFnbG9iYWwucmVxdWVzdEFuaW1hdGlvbkZyYW1lKSB7XG4gICAgICAgICAgICBnbG9iYWwucmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZ2xvYmFsLndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICAgICAgICAgICAgICAgICAgICBnbG9iYWwubW96UmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8XG4gICAgICAgICAgICAgICAgICAgIGdsb2JhbC5vUmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8XG4gICAgICAgICAgICAgICAgICAgIGdsb2JhbC5tc1JlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGdsb2JhbC5zZXRUaW1lb3V0KGNhbGxiYWNrLCAxMDAwIC8gNjApO1xuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSkoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghZ2xvYmFsLmNhbmNlbEFuaW1hdGlvbkZyYW1lKSB7XG4gICAgICAgICAgICBnbG9iYWwuY2FuY2VsQW5pbWF0aW9uRnJhbWUgPSAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBnbG9iYWwud2Via2l0Q2FuY2VsQW5pbWF0aW9uRnJhbWUgfHxcbiAgICAgICAgICAgICAgICAgICAgZ2xvYmFsLm1vekNhbmNlbEFuaW1hdGlvbkZyYW1lIHx8XG4gICAgICAgICAgICAgICAgICAgIGdsb2JhbC5vQ2FuY2VsQW5pbWF0aW9uRnJhbWUgfHxcbiAgICAgICAgICAgICAgICAgICAgZ2xvYmFsLm1zQ2FuY2VsQW5pbWF0aW9uRnJhbWUgfHxcbiAgICAgICAgICAgICAgICAgICAgZ2xvYmFsLmNsZWFyVGltZW91dDtcbiAgICAgICAgICAgIH0pKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWU6IHBvbHlmaWxsUmVxdWVzdEFuaW1hdGlvbkZyYW1lXG4gICAgfTtcbn0pKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93IDogdGhpcyk7XG5cbm1vZHVsZS5leHBvcnRzID0gcG9seWZpbGw7XG4iLCJ2YXIgcmVzaXplU2Vuc29yRmFjdG9yeSA9IChmdW5jdGlvbiAoKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgLyoqIEB2YXIge0Z1bmN0aW9ufSAqL1xuICAgIHZhciBnZXRTdHlsZSA9IHJlcXVpcmUoJy4vZ2V0U3R5bGUnKTtcbiAgICAvKiogQHZhciB7T2JqZWN0fSAqL1xuICAgIHZhciBjc3MgPSByZXF1aXJlKCcuL2NzcycpO1xuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gdGFyZ2V0RWxlbWVudFxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrXG4gICAgICogQGNvbnN0cnVjdG9yXG4gICAgICovXG4gICAgdmFyIHJlc2l6ZVNlbnNvciA9IGZ1bmN0aW9uICh0YXJnZXRFbGVtZW50LCBjYWxsYmFjaykge1xuICAgICAgICAvKiogQHZhciB7SFRNTEVsZW1lbnR9ICovXG4gICAgICAgIHRoaXMudGFyZ2V0RWxlbWVudCA9IHRhcmdldEVsZW1lbnQ7XG4gICAgICAgIC8qKiBAdmFyIHtGdW5jdGlvbn0gKi9cbiAgICAgICAgdGhpcy5jYWxsYmFjayA9IGNhbGxiYWNrO1xuICAgICAgICAvKiogQHZhciB7e3dpZHRoOiBpbnQsIGhlaWdodDogaW50fX0gKi9cbiAgICAgICAgdGhpcy5kaW1lbnNpb25zID0ge1xuICAgICAgICAgICAgd2lkdGg6IDAsXG4gICAgICAgICAgICBoZWlnaHQ6IDBcbiAgICAgICAgfTtcblxuICAgICAgICBpZiAoJ2F0dGFjaEV2ZW50JyBpbiBkb2N1bWVudCkge1xuICAgICAgICAgICAgdGhpcy5ib3VuZE9uUmVzaXplSGFuZGxlciA9IHRoaXMub25FbGVtZW50UmVzaXplLmJpbmQodGhpcyk7XG4gICAgICAgICAgICB0aGlzLnRhcmdldEVsZW1lbnQuYXR0YWNoRXZlbnQoJ29ucmVzaXplJywgdGhpcy5ib3VuZE9uUmVzaXplSGFuZGxlcik7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvKiogQHZhciB7e2NvbnRhaW5lcjogSFRNTEVsZW1lbnQsIGV4cGFuZDogSFRNTEVsZW1lbnQsIGV4cGFuZENoaWxkOiBIVE1MRWxlbWVudCwgY29udHJhY3Q6IEhUTUxFbGVtZW50fX0gKi9cbiAgICAgICAgdGhpcy50cmlnZ2VyRWxlbWVudHMgPSB7fTtcbiAgICAgICAgLyoqIEB2YXIge2ludH0gKi9cbiAgICAgICAgdGhpcy5yZXNpemVSQUYgPSAwO1xuXG4gICAgICAgIHRoaXMuc2V0dXAoKTtcbiAgICB9O1xuXG4gICAgcmVzaXplU2Vuc29yLnByb3RvdHlwZS5zZXR1cCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy8gTWFrZSBzdXJlIHRoZSB0YXJnZXQgZWxlbWVudCBpcyBcInBvc2l0aW9uZWRcIlxuICAgICAgICBpZiAoZ2V0U3R5bGUodGhpcy50YXJnZXRFbGVtZW50LCAncG9zaXRpb24nKSA9PT0gJ3N0YXRpYycpIHtcbiAgICAgICAgICAgIHRoaXMudGFyZ2V0RWxlbWVudC5zdHlsZS5wb3NpdGlvbiA9ICdyZWxhdGl2ZSc7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDcmVhdGUgYW5kIGFwcGVuZCByZXNpemUgdHJpZ2dlciBlbGVtZW50c1xuICAgICAgICB0aGlzLmluc2VydFJlc2l6ZVRyaWdnZXJFbGVtZW50cygpO1xuXG4gICAgICAgIC8vIFN0YXJ0IGxpc3RlbmluZyB0byBldmVudHNcbiAgICAgICAgdGhpcy5ib3VuZFNjcm9sbExpc3RlbmVyID0gdGhpcy5oYW5kbGVFbGVtZW50U2Nyb2xsLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMudGFyZ2V0RWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdzY3JvbGwnLCB0aGlzLmJvdW5kU2Nyb2xsTGlzdGVuZXIsIHRydWUpO1xuXG4gICAgICAgIGlmIChjc3MuaXNBbmltYXRpb25TdXBwb3J0ZWQoKSkge1xuICAgICAgICAgICAgdGhpcy5ib3VuZEFuaW1hdGlvblN0YXJ0TGlzdGVuZXIgPSB0aGlzLnJlc2V0VHJpZ2dlcnNPbkFuaW1hdGlvblN0YXJ0LmJpbmQodGhpcyk7XG4gICAgICAgICAgICB0aGlzLnRyaWdnZXJFbGVtZW50cy5jb250YWluZXIuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgICAgICAgICAgICBjc3MuZ2V0QW5pbWF0aW9uUHJvcGVydGllc0ZvckJyb3dzZXIoKS5hbmltYXRpb25TdGFydEV2ZW50LFxuICAgICAgICAgICAgICAgIHRoaXMuYm91bmRBbmltYXRpb25TdGFydExpc3RlbmVyXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gSW5pdGlhbCB2YWx1ZSByZXNldCBvZiBhbGwgdHJpZ2dlcnNcbiAgICAgICAgdGhpcy5yZXNldFRyaWdnZXJzKCk7XG4gICAgfTtcblxuICAgIHJlc2l6ZVNlbnNvci5wcm90b3R5cGUuaW5zZXJ0UmVzaXplVHJpZ2dlckVsZW1lbnRzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgcmVzaXplVHJpZ2dlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICB2YXIgZXhwYW5kVHJpZ2dlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICB2YXIgZXhwYW5kVHJpZ2dlckNoaWxkID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIHZhciBjb250cmFjdFRyaWdnZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcblxuICAgICAgICByZXNpemVUcmlnZ2VyLmNsYXNzTmFtZSA9ICdSZXNpemVTZW5zb3IgUmVzaXplU2Vuc29yX19yZXNpemVUcmlnZ2Vycyc7XG4gICAgICAgIGV4cGFuZFRyaWdnZXIuY2xhc3NOYW1lID0gJ1Jlc2l6ZVNlbnNvcl9fZXhwYW5kVHJpZ2dlcic7XG4gICAgICAgIGNvbnRyYWN0VHJpZ2dlci5jbGFzc05hbWUgPSAnUmVzaXplU2Vuc29yX19jb250cmFjdFRyaWdnZXInO1xuXG4gICAgICAgIGV4cGFuZFRyaWdnZXIuYXBwZW5kQ2hpbGQoZXhwYW5kVHJpZ2dlckNoaWxkKTtcbiAgICAgICAgcmVzaXplVHJpZ2dlci5hcHBlbmRDaGlsZChleHBhbmRUcmlnZ2VyKTtcbiAgICAgICAgcmVzaXplVHJpZ2dlci5hcHBlbmRDaGlsZChjb250cmFjdFRyaWdnZXIpO1xuXG4gICAgICAgIHRoaXMudHJpZ2dlckVsZW1lbnRzLmNvbnRhaW5lciA9IHJlc2l6ZVRyaWdnZXI7XG4gICAgICAgIHRoaXMudHJpZ2dlckVsZW1lbnRzLmV4cGFuZCA9IGV4cGFuZFRyaWdnZXI7XG4gICAgICAgIHRoaXMudHJpZ2dlckVsZW1lbnRzLmV4cGFuZENoaWxkID0gZXhwYW5kVHJpZ2dlckNoaWxkO1xuICAgICAgICB0aGlzLnRyaWdnZXJFbGVtZW50cy5jb250cmFjdCA9IGNvbnRyYWN0VHJpZ2dlcjtcblxuICAgICAgICB0aGlzLnRhcmdldEVsZW1lbnQuYXBwZW5kQ2hpbGQocmVzaXplVHJpZ2dlcik7XG4gICAgfTtcblxuICAgIHJlc2l6ZVNlbnNvci5wcm90b3R5cGUub25FbGVtZW50UmVzaXplID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgY3VycmVudERpbWVuc2lvbnMgPSB0aGlzLmdldERpbWVuc2lvbnMoKTtcblxuICAgICAgICBpZiAodGhpcy5pc1Jlc2l6ZWQoY3VycmVudERpbWVuc2lvbnMpKSB7XG4gICAgICAgICAgICB0aGlzLmRpbWVuc2lvbnMud2lkdGggPSBjdXJyZW50RGltZW5zaW9ucy53aWR0aDtcbiAgICAgICAgICAgIHRoaXMuZGltZW5zaW9ucy5oZWlnaHQgPSBjdXJyZW50RGltZW5zaW9ucy5oZWlnaHQ7XG4gICAgICAgICAgICB0aGlzLmVsZW1lbnRSZXNpemVkKCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcmVzaXplU2Vuc29yLnByb3RvdHlwZS5oYW5kbGVFbGVtZW50U2Nyb2xsID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICAgIHRoaXMucmVzZXRUcmlnZ2VycygpO1xuXG4gICAgICAgIGlmICh0aGlzLnJlc2l6ZVJBRikge1xuICAgICAgICAgICAgd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lKHRoaXMucmVzaXplUkFGKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMucmVzaXplUkFGID0gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgY3VycmVudERpbWVuc2lvbnMgPSBfdGhpcy5nZXREaW1lbnNpb25zKCk7XG4gICAgICAgICAgICBpZiAoX3RoaXMuaXNSZXNpemVkKGN1cnJlbnREaW1lbnNpb25zKSkge1xuICAgICAgICAgICAgICAgIF90aGlzLmRpbWVuc2lvbnMud2lkdGggPSBjdXJyZW50RGltZW5zaW9ucy53aWR0aDtcbiAgICAgICAgICAgICAgICBfdGhpcy5kaW1lbnNpb25zLmhlaWdodCA9IGN1cnJlbnREaW1lbnNpb25zLmhlaWdodDtcbiAgICAgICAgICAgICAgICBfdGhpcy5lbGVtZW50UmVzaXplZCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHt7d2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9fSBjdXJyZW50RGltZW5zaW9uc1xuICAgICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgICAqL1xuICAgIHJlc2l6ZVNlbnNvci5wcm90b3R5cGUuaXNSZXNpemVkID0gZnVuY3Rpb24gKGN1cnJlbnREaW1lbnNpb25zKSB7XG4gICAgICAgIHJldHVybiAoY3VycmVudERpbWVuc2lvbnMud2lkdGggIT09IHRoaXMuZGltZW5zaW9ucy53aWR0aCB8fCBjdXJyZW50RGltZW5zaW9ucy5oZWlnaHQgIT09IHRoaXMuZGltZW5zaW9ucy5oZWlnaHQpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBAcmV0dXJucyB7e3dpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfX1cbiAgICAgKi9cbiAgICByZXNpemVTZW5zb3IucHJvdG90eXBlLmdldERpbWVuc2lvbnMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB3aWR0aDogdGhpcy50YXJnZXRFbGVtZW50Lm9mZnNldFdpZHRoLFxuICAgICAgICAgICAgaGVpZ2h0OiB0aGlzLnRhcmdldEVsZW1lbnQub2Zmc2V0SGVpZ2h0XG4gICAgICAgIH07XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50XG4gICAgICovXG4gICAgcmVzaXplU2Vuc29yLnByb3RvdHlwZS5yZXNldFRyaWdnZXJzT25BbmltYXRpb25TdGFydCA9IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICBpZiAoZXZlbnQuYW5pbWF0aW9uTmFtZSA9PT0gY3NzLmdldEFuaW1hdGlvblByb3BlcnRpZXNGb3JCcm93c2VyKCkuYW5pbWF0aW9uTmFtZSkge1xuICAgICAgICAgICAgdGhpcy5yZXNldFRyaWdnZXJzKCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcmVzaXplU2Vuc29yLnByb3RvdHlwZS5yZXNldFRyaWdnZXJzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLnRyaWdnZXJFbGVtZW50cy5jb250cmFjdC5zY3JvbGxMZWZ0ID0gdGhpcy50cmlnZ2VyRWxlbWVudHMuY29udHJhY3Quc2Nyb2xsV2lkdGg7XG4gICAgICAgIHRoaXMudHJpZ2dlckVsZW1lbnRzLmNvbnRyYWN0LnNjcm9sbFRvcCA9IHRoaXMudHJpZ2dlckVsZW1lbnRzLmNvbnRyYWN0LnNjcm9sbEhlaWdodDtcbiAgICAgICAgdGhpcy50cmlnZ2VyRWxlbWVudHMuZXhwYW5kQ2hpbGQuc3R5bGUud2lkdGggPSB0aGlzLnRyaWdnZXJFbGVtZW50cy5leHBhbmQub2Zmc2V0V2lkdGggKyAxICsgJ3B4JztcbiAgICAgICAgdGhpcy50cmlnZ2VyRWxlbWVudHMuZXhwYW5kQ2hpbGQuc3R5bGUuaGVpZ2h0ID0gdGhpcy50cmlnZ2VyRWxlbWVudHMuZXhwYW5kLm9mZnNldEhlaWdodCArIDEgKyAncHgnO1xuICAgICAgICB0aGlzLnRyaWdnZXJFbGVtZW50cy5leHBhbmQuc2Nyb2xsTGVmdCA9IHRoaXMudHJpZ2dlckVsZW1lbnRzLmV4cGFuZC5zY3JvbGxXaWR0aDtcbiAgICAgICAgdGhpcy50cmlnZ2VyRWxlbWVudHMuZXhwYW5kLnNjcm9sbFRvcCA9IHRoaXMudHJpZ2dlckVsZW1lbnRzLmV4cGFuZC5zY3JvbGxIZWlnaHQ7XG4gICAgfTtcblxuICAgIHJlc2l6ZVNlbnNvci5wcm90b3R5cGUuZWxlbWVudFJlc2l6ZWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuY2FsbGJhY2sodGhpcy5kaW1lbnNpb25zKTtcbiAgICB9O1xuXG4gICAgcmVzaXplU2Vuc29yLnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXJzKCk7XG4gICAgICAgIHRoaXMudGFyZ2V0RWxlbWVudC5yZW1vdmVDaGlsZCh0aGlzLnRyaWdnZXJFbGVtZW50cy5jb250YWluZXIpO1xuICAgICAgICBkZWxldGUgdGhpcy5ib3VuZEFuaW1hdGlvblN0YXJ0TGlzdGVuZXI7XG4gICAgICAgIGRlbGV0ZSB0aGlzLmJvdW5kU2Nyb2xsTGlzdGVuZXI7XG4gICAgICAgIGRlbGV0ZSB0aGlzLmNhbGxiYWNrO1xuICAgICAgICBkZWxldGUgdGhpcy50YXJnZXRFbGVtZW50O1xuICAgIH07XG5cbiAgICByZXNpemVTZW5zb3IucHJvdG90eXBlLnJlbW92ZUV2ZW50TGlzdGVuZXJzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAoJ2F0dGFjaEV2ZW50JyBpbiBkb2N1bWVudCkge1xuICAgICAgICAgICAgdGhpcy50YXJnZXRFbGVtZW50LmRldGFjaEV2ZW50KCdvbnJlc2l6ZScsIHRoaXMuYm91bmRPblJlc2l6ZUhhbmRsZXIpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy50cmlnZ2VyRWxlbWVudHMuY29udGFpbmVyLnJlbW92ZUV2ZW50TGlzdGVuZXIoXG4gICAgICAgICAgICBjc3MuZ2V0QW5pbWF0aW9uUHJvcGVydGllc0ZvckJyb3dzZXIoKS5hbmltYXRpb25TdGFydEV2ZW50LFxuICAgICAgICAgICAgdGhpcy5ib3VuZEFuaW1hdGlvblN0YXJ0TGlzdGVuZXJcbiAgICAgICAgKTtcbiAgICAgICAgdGhpcy50YXJnZXRFbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIHRoaXMuYm91bmRTY3JvbGxMaXN0ZW5lciwgdHJ1ZSk7XG4gICAgfTtcblxuICAgIHJldHVybiB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcGFyYW0ge0VsZW1lbnR9IHRhcmdldEVsZW1lbnRcbiAgICAgICAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2tcbiAgICAgICAgICogQHJldHVybnMge3Jlc2l6ZVNlbnNvcn1cbiAgICAgICAgICovXG4gICAgICAgIGNyZWF0ZTogZnVuY3Rpb24gKHRhcmdldEVsZW1lbnQsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IHJlc2l6ZVNlbnNvcih0YXJnZXRFbGVtZW50LCBjYWxsYmFjayk7XG4gICAgICAgIH1cbiAgICB9O1xufSkoKTtcblxubW9kdWxlLmV4cG9ydHMgPSByZXNpemVTZW5zb3JGYWN0b3J5O1xuIiwidmFyIHNlbnNvcnMgPSAoZnVuY3Rpb24gKCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIC8qKiBAdmFyIHtPYmplY3R9ICovXG4gICAgdmFyIGNzcyA9IHJlcXVpcmUoJy4vY3NzJyk7XG4gICAgLyoqIEB2YXIge09iamVjdH0gKi9cbiAgICB2YXIgcG9seWZpbGwgPSByZXF1aXJlKCcuL3BvbHlmaWxsJyk7XG4gICAgLyoqIEB2YXIge09iamVjdH0gKi9cbiAgICB2YXIgcmVzaXplU2Vuc29yRmFjdG9yeSA9IHJlcXVpcmUoJy4vcmVzaXplU2Vuc29yJyk7XG5cbiAgICAvKioge2FycmF5fSAqL1xuICAgIHZhciB1bnN1aXRhYmxlRWxlbWVudHMgPSBbJ0lNRycsICdDT0wnLCAnVFInLCAnVEhFQUQnLCAnVEZPT1QnXTtcbiAgICAvKioge2Jvb2xlYW59ICovXG4gICAgdmFyIHN1cHBvcnRzQXR0YWNoRXZlbnQgPSAoJ2F0dGFjaEV2ZW50JyBpbiBkb2N1bWVudCk7XG5cbiAgICAvKioge3t9fSBNYXAgb2YgYWxsIHJlc2l6ZSBzZW5zb3JzIChpZCA9PiBSZXNpemVTZW5zb3IpICovXG4gICAgdmFyIGFsbFJlc2l6ZVNlbnNvcnMgPSB7fTtcblxuICAgIGlmICghc3VwcG9ydHNBdHRhY2hFdmVudCkge1xuICAgICAgICBjc3MuaW5zZXJ0UmVzaXplU2Vuc29yU3R5bGVzKCk7XG5cbiAgICAgICAgaWYgKCEoJ3JlcXVlc3RBbmltYXRpb25GcmFtZScgaW4gd2luZG93KSB8fCAhKCdjYW5jZWxBbmltYXRpb25GcmFtZScgaW4gd2luZG93KSkge1xuICAgICAgICAgICAgcG9seWZpbGwucmVxdWVzdEFuaW1hdGlvbkZyYW1lKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge0VsZW1lbnR9IHRhcmdldEVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFja1xuICAgICAqIEByZXR1cm5zIHtyZXNpemVTZW5zb3J9XG4gICAgICovXG4gICAgZnVuY3Rpb24gY3JlYXRlICh0YXJnZXRFbGVtZW50LCBjYWxsYmFjaykge1xuICAgICAgICBpZiAoaXNVbnN1aXRhYmxlRWxlbWVudCh0YXJnZXRFbGVtZW50KSkge1xuICAgICAgICAgICAgY29uc29sZSAmJiBjb25zb2xlLmVycm9yKFwiR2l2ZW4gZWxlbWVudCBpc24ndCBzdWl0YWJsZSB0byBhY3QgYXMgYSByZXNpemUgc2Vuc29yLiBUcnkgd3JhcHBpbmcgaXQgd2l0aCBvbmUgdGhhdCBpcy4gVW5zdWl0YWJsZSBlbGVtZW50cyBhcmU6XCIsIHVuc3VpdGFibGVFbGVtZW50cyk7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBzZW5zb3JJZCA9IGdldFNlbnNvcklkKHRhcmdldEVsZW1lbnQpO1xuXG4gICAgICAgIGlmIChhbGxSZXNpemVTZW5zb3JzW3NlbnNvcklkXSkge1xuICAgICAgICAgICAgcmV0dXJuIGFsbFJlc2l6ZVNlbnNvcnNbc2Vuc29ySWRdO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHNlbnNvciA9IHJlc2l6ZVNlbnNvckZhY3RvcnkuY3JlYXRlKHRhcmdldEVsZW1lbnQsIGNhbGxiYWNrKTtcbiAgICAgICAgYWxsUmVzaXplU2Vuc29yc1tzZW5zb3JJZF0gPSBzZW5zb3I7XG4gICAgICAgIHJldHVybiBzZW5zb3I7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtFbGVtZW50fSB0YXJnZXRFbGVtZW50XG4gICAgICovXG4gICAgZnVuY3Rpb24gZGVzdHJveSAodGFyZ2V0RWxlbWVudCkge1xuICAgICAgICB2YXIgc2Vuc29ySWQgPSBnZXRTZW5zb3JJZCh0YXJnZXRFbGVtZW50KTtcbiAgICAgICAgdmFyIHNlbnNvciA9IGFsbFJlc2l6ZVNlbnNvcnNbc2Vuc29ySWRdO1xuXG4gICAgICAgIGlmICghc2Vuc29yKSB7XG4gICAgICAgICAgICBjb25zb2xlICYmIGNvbnNvbGUuZXJyb3IoXCJDYW4ndCBkZXN0cm95IFJlc2l6ZVNlbnNvciAoNDA0IG5vdCBmb3VuZCkuXCIsIHRhcmdldEVsZW1lbnQpO1xuICAgICAgICB9XG5cbiAgICAgICAgc2Vuc29yLmRlc3Ryb3koKTtcbiAgICAgICAgZGVsZXRlIGFsbFJlc2l6ZVNlbnNvcnNbc2Vuc29ySWRdO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7RWxlbWVudH0gdGFyZ2V0RWxlbWVudFxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAgICovXG4gICAgZnVuY3Rpb24gZ2V0U2Vuc29ySWQgKHRhcmdldEVsZW1lbnQpIHtcbiAgICAgICAgcmV0dXJuIHRhcmdldEVsZW1lbnQuaWQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gdGFyZ2V0RWxlbWVudFxuICAgICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGlzVW5zdWl0YWJsZUVsZW1lbnQgKHRhcmdldEVsZW1lbnQpIHtcbiAgICAgICAgdmFyIHRhZ05hbWUgPSB0YXJnZXRFbGVtZW50LnRhZ05hbWUudG9VcHBlckNhc2UoKTtcbiAgICAgICAgcmV0dXJuICh1bnN1aXRhYmxlRWxlbWVudHMuaW5kZXhPZih0YWdOYW1lKSA+IC0xKTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBjcmVhdGU6IGNyZWF0ZSxcbiAgICAgICAgZGVzdHJveTogZGVzdHJveVxuICAgIH1cbn0pKCk7XG5cbm1vZHVsZS5leHBvcnRzID0gc2Vuc29yczsiXX0=
