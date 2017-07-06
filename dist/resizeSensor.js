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
var resizeSensorFactory = (function (global) {
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

        if ('attachEvent' in global.document) {
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
        var resizeTrigger = global.document.createElement('div');
        var expandTrigger = global.document.createElement('div');
        var expandTriggerChild = global.document.createElement('div');
        var contractTrigger = global.document.createElement('div');

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
            global.cancelAnimationFrame(this.resizeRAF);
        }

        this.resizeRAF = global.requestAnimationFrame(function () {
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
        if ('attachEvent' in global.document) {
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
})(typeof window !== 'undefined' ? window : this);

module.exports = resizeSensorFactory;

},{"./css":1,"./getStyle":2}],5:[function(require,module,exports){
var sensors = (function (global) {
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
    var supportsAttachEvent = ('attachEvent' in global.document);

    /** {{}} Map of all resize sensors (id => ResizeSensor) */
    var allResizeSensors = {};

    if (!supportsAttachEvent) {
        css.insertResizeSensorStyles();

        if (!('requestAnimationFrame' in global) || !('cancelAnimationFrame' in global)) {
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
    };
})(typeof window !== 'undefined' ? window : this);

module.exports = sensors;
},{"./css":1,"./polyfill":3,"./resizeSensor":4}]},{},[5])(5)
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvY3NzLmpzIiwic3JjL2dldFN0eWxlLmpzIiwic3JjL3BvbHlmaWxsLmpzIiwic3JjL3Jlc2l6ZVNlbnNvci5qcyIsInNyYy9zZW5zb3JzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgY3NzID0gKGZ1bmN0aW9uIChnbG9iYWwpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICAvKiogQHZhciB7bnVsbHxPYmplY3R9ICovXG4gICAgdmFyIGFuaW1hdGlvblByb3BlcnRpZXNGb3JCcm93c2VyID0gbnVsbDtcbiAgICAvKiogQHZhciB7bnVsbHxib29sZWFufSAqL1xuICAgIHZhciBpc0Nzc0FuaW1hdGlvblN1cHBvcnRlZCA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBEZXRlcm1pbmVzIHdoaWNoIHN0eWxlIGNvbnZlbnRpb24gKHByb3BlcnRpZXMpIHRvIGZvbGxvd1xuICAgICAqIEBzZWUgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvR3VpZGUvQ1NTL1VzaW5nX0NTU19hbmltYXRpb25zL0RldGVjdGluZ19DU1NfYW5pbWF0aW9uX3N1cHBvcnRcbiAgICAgKiBAcmV0dXJucyB7e2tleWZyYW1lc1J1bGU6IHN0cmluZywgc3R5bGVEZWNsYXJhdGlvbjogc3RyaW5nLCBhbmltYXRpb25TdGFydEV2ZW50OiBzdHJpbmcsIGFuaW1hdGlvbk5hbWU6IHN0cmluZ319XG4gICAgICovXG4gICAgZnVuY3Rpb24gZ2V0QW5pbWF0aW9uUHJvcGVydGllc0ZvckJyb3dzZXIgKCkge1xuICAgICAgICBpZiAoYW5pbWF0aW9uUHJvcGVydGllc0ZvckJyb3dzZXIgIT09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiBhbmltYXRpb25Qcm9wZXJ0aWVzRm9yQnJvd3NlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciB0ZXN0RWxlbWVudCA9IGdsb2JhbC5kb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgdmFyIHN1cHBvcnRzVW5wcmVmaXhlZEFuaW1hdGlvblByb3BlcnRpZXMgPSAoJ2FuaW1hdGlvbk5hbWUnIGluIHRlc3RFbGVtZW50LnN0eWxlKTtcblxuICAgICAgICAvLyBVbnByZWZpeGVkIGFuaW1hdGlvbiBwcm9wZXJ0aWVzXG4gICAgICAgIHZhciBhbmltYXRpb25TdGFydEV2ZW50ID0gJ2FuaW1hdGlvbnN0YXJ0JztcbiAgICAgICAgdmFyIGFuaW1hdGlvbk5hbWUgPSAncmVzaXplYW5pbSc7XG5cbiAgICAgICAgaWYgKHN1cHBvcnRzVW5wcmVmaXhlZEFuaW1hdGlvblByb3BlcnRpZXMpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAga2V5ZnJhbWVzUnVsZTogJ0BrZXlmcmFtZXMgJyArIGFuaW1hdGlvbk5hbWUgKyAnIHtmcm9tIHsgb3BhY2l0eTogMDsgfSB0byB7IG9wYWNpdHk6IDA7IH19JyxcbiAgICAgICAgICAgICAgICBzdHlsZURlY2xhcmF0aW9uOiAnYW5pbWF0aW9uOiAxbXMgJyArIGFuaW1hdGlvbk5hbWUgKyAnOycsXG4gICAgICAgICAgICAgICAgYW5pbWF0aW9uU3RhcnRFdmVudDogYW5pbWF0aW9uU3RhcnRFdmVudCxcbiAgICAgICAgICAgICAgICBhbmltYXRpb25OYW1lOiBhbmltYXRpb25OYW1lXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQnJvd3NlciBzcGVjaWZpYyBhbmltYXRpb24gcHJvcGVydGllc1xuICAgICAgICB2YXIga2V5ZnJhbWVQcmVmaXggPSAnJztcbiAgICAgICAgdmFyIGJyb3dzZXJQcmVmaXhlcyA9IFsnV2Via2l0JywgJ01veicsICdPJywgJ21zJ107XG4gICAgICAgIHZhciBzdGFydEV2ZW50cyA9IFsnd2Via2l0QW5pbWF0aW9uU3RhcnQnLCAnYW5pbWF0aW9uc3RhcnQnLCAnb0FuaW1hdGlvblN0YXJ0JywgJ01TQW5pbWF0aW9uU3RhcnQnXTtcblxuICAgICAgICB2YXIgaTtcbiAgICAgICAgdmFyIGwgPSBicm93c2VyUHJlZml4ZXMubGVuZ3RoO1xuXG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICAgIGlmICgoYnJvd3NlclByZWZpeGVzW2ldICsgJ0FuaW1hdGlvbk5hbWUnKSBpbiB0ZXN0RWxlbWVudC5zdHlsZSkge1xuICAgICAgICAgICAgICAgIGtleWZyYW1lUHJlZml4ID0gJy0nICsgYnJvd3NlclByZWZpeGVzW2ldLnRvTG93ZXJDYXNlKCkgKyAnLSc7XG4gICAgICAgICAgICAgICAgYW5pbWF0aW9uU3RhcnRFdmVudCA9IHN0YXJ0RXZlbnRzW2ldO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgYW5pbWF0aW9uUHJvcGVydGllc0ZvckJyb3dzZXIgPSB7XG4gICAgICAgICAgICBrZXlmcmFtZXNSdWxlOiAnQCcgKyBrZXlmcmFtZVByZWZpeCArICdrZXlmcmFtZXMgJyArIGFuaW1hdGlvbk5hbWUgKyAnIHtmcm9tIHsgb3BhY2l0eTogMDsgfSB0byB7IG9wYWNpdHk6IDA7IH19JyxcbiAgICAgICAgICAgIHN0eWxlRGVjbGFyYXRpb246IGtleWZyYW1lUHJlZml4ICsgJ2FuaW1hdGlvbjogMW1zICcgKyBhbmltYXRpb25OYW1lICsgJzsnLFxuICAgICAgICAgICAgYW5pbWF0aW9uU3RhcnRFdmVudDogYW5pbWF0aW9uU3RhcnRFdmVudCxcbiAgICAgICAgICAgIGFuaW1hdGlvbk5hbWU6IGFuaW1hdGlvbk5hbWVcbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gYW5pbWF0aW9uUHJvcGVydGllc0ZvckJyb3dzZXI7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAgICovXG4gICAgZnVuY3Rpb24gaXNDU1NBbmltYXRpb25TdXBwb3J0ZWQgKCkge1xuICAgICAgICBpZiAoaXNDc3NBbmltYXRpb25TdXBwb3J0ZWQgIT09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiBpc0Nzc0FuaW1hdGlvblN1cHBvcnRlZDtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciB0ZXN0RWxlbWVudCA9IGdsb2JhbC5kb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgdmFyIGlzQW5pbWF0aW9uU3VwcG9ydGVkID0gKCdhbmltYXRpb25OYW1lJyBpbiB0ZXN0RWxlbWVudC5zdHlsZSk7XG5cbiAgICAgICAgaWYgKGlzQW5pbWF0aW9uU3VwcG9ydGVkKSB7XG4gICAgICAgICAgICBpc0Nzc0FuaW1hdGlvblN1cHBvcnRlZCA9IHRydWU7XG4gICAgICAgICAgICByZXR1cm4gaXNDc3NBbmltYXRpb25TdXBwb3J0ZWQ7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgYnJvd3NlclByZWZpeGVzID0gJ1dlYmtpdCBNb3ogTyBtcycuc3BsaXQoJyAnKTtcbiAgICAgICAgdmFyIGkgPSAwO1xuICAgICAgICB2YXIgbCA9IGJyb3dzZXJQcmVmaXhlcy5sZW5ndGg7XG5cbiAgICAgICAgZm9yICg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICAgIGlmICgoYnJvd3NlclByZWZpeGVzW2ldICsgJ0FuaW1hdGlvbk5hbWUnKSBpbiB0ZXN0RWxlbWVudC5zdHlsZSkge1xuICAgICAgICAgICAgICAgIGlzQ3NzQW5pbWF0aW9uU3VwcG9ydGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICByZXR1cm4gaXNDc3NBbmltYXRpb25TdXBwb3J0ZWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpc0Nzc0FuaW1hdGlvblN1cHBvcnRlZCA9IGZhbHNlO1xuICAgICAgICByZXR1cm4gaXNDc3NBbmltYXRpb25TdXBwb3J0ZWQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQWRkcyBhIHN0eWxlIGJsb2NrIHRoYXQgY29udGFpbnMgQ1NTIGVzc2VudGlhbCBmb3IgZGV0ZWN0aW5nIHJlc2l6ZSBldmVudHNcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBpbnNlcnRSZXNpemVTZW5zb3JTdHlsZXMgKCkge1xuICAgICAgICB2YXIgY3NzUnVsZXMgPSBbXG4gICAgICAgICAgICAoZ2V0QW5pbWF0aW9uUHJvcGVydGllc0ZvckJyb3dzZXIoKS5rZXlmcmFtZXNSdWxlKSA/IGdldEFuaW1hdGlvblByb3BlcnRpZXNGb3JCcm93c2VyKCkua2V5ZnJhbWVzUnVsZSA6ICcnLFxuICAgICAgICAgICAgJy5SZXNpemVTZW5zb3JfX3Jlc2l6ZVRyaWdnZXJzIHsgJyArICgoZ2V0QW5pbWF0aW9uUHJvcGVydGllc0ZvckJyb3dzZXIoKS5zdHlsZURlY2xhcmF0aW9uKSA/IGdldEFuaW1hdGlvblByb3BlcnRpZXNGb3JCcm93c2VyKCkuc3R5bGVEZWNsYXJhdGlvbiA6ICcnKSArICcgdmlzaWJpbGl0eTogaGlkZGVuOyBvcGFjaXR5OiAwOyB9JyxcbiAgICAgICAgICAgICcuUmVzaXplU2Vuc29yX19yZXNpemVUcmlnZ2VycywgLlJlc2l6ZVNlbnNvcl9fcmVzaXplVHJpZ2dlcnMgPiBkaXYsIC5SZXNpemVTZW5zb3JfX2NvbnRyYWN0VHJpZ2dlcjpiZWZvcmUgeyBjb250ZW50OiBcXCcgXFwnOyBkaXNwbGF5OiBibG9jazsgcG9zaXRpb246IGFic29sdXRlOyB0b3A6IDA7IGxlZnQ6IDA7IGhlaWdodDogMTAwJTsgd2lkdGg6IDEwMCU7IG92ZXJmbG93OiBoaWRkZW47IH0gLlJlc2l6ZVNlbnNvcl9fcmVzaXplVHJpZ2dlcnMgPiBkaXYgeyBiYWNrZ3JvdW5kOiAjZWVlOyBvdmVyZmxvdzogYXV0bzsgfSAuUmVzaXplU2Vuc29yX19jb250cmFjdFRyaWdnZXI6YmVmb3JlIHsgd2lkdGg6IDIwMCU7IGhlaWdodDogMjAwJTsgfSdcbiAgICAgICAgXTtcblxuICAgICAgICBjc3NSdWxlcyA9IGNzc1J1bGVzLmpvaW4oJyAnKTtcblxuICAgICAgICB2YXIgaGVhZEVsZW0gPSBnbG9iYWwuZG9jdW1lbnQuaGVhZCB8fCBnbG9iYWwuZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2hlYWQnKVswXTtcblxuICAgICAgICB2YXIgc3R5bGVFbGVtID0gZ2xvYmFsLmRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJyk7XG4gICAgICAgIHN0eWxlRWxlbS50eXBlID0gJ3RleHQvY3NzJztcblxuICAgICAgICBpZiAoc3R5bGVFbGVtLnN0eWxlU2hlZXQpIHtcbiAgICAgICAgICAgIHN0eWxlRWxlbS5zdHlsZVNoZWV0LmNzc1RleHQgPSBjc3NSdWxlcztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN0eWxlRWxlbS5hcHBlbmRDaGlsZChnbG9iYWwuZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoY3NzUnVsZXMpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGhlYWRFbGVtLmFwcGVuZENoaWxkKHN0eWxlRWxlbSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgaW5zZXJ0UmVzaXplU2Vuc29yU3R5bGVzOiBpbnNlcnRSZXNpemVTZW5zb3JTdHlsZXMsXG4gICAgICAgIGlzQW5pbWF0aW9uU3VwcG9ydGVkOiBpc0NTU0FuaW1hdGlvblN1cHBvcnRlZCxcbiAgICAgICAgZ2V0QW5pbWF0aW9uUHJvcGVydGllc0ZvckJyb3dzZXI6IGdldEFuaW1hdGlvblByb3BlcnRpZXNGb3JCcm93c2VyXG4gICAgfTtcbn0pKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93IDogdGhpcyk7XG5cbm1vZHVsZS5leHBvcnRzID0gY3NzO1xuIiwidmFyIGdldFN0eWxlID0gKGZ1bmN0aW9uIChnbG9iYWwpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50XG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHByb3BlcnR5XG4gICAgICogQHJldHVybnMge251bGx8c3RyaW5nfVxuICAgICAqL1xuICAgIHJldHVybiBmdW5jdGlvbiAoZWxlbWVudCwgcHJvcGVydHkpIHtcbiAgICAgICAgaWYgKCEoJ2N1cnJlbnRTdHlsZScgaW4gZWxlbWVudCkgJiYgISgnZ2V0Q29tcHV0ZWRTdHlsZScgaW4gZ2xvYmFsKSkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZWxlbWVudC5jdXJyZW50U3R5bGUpIHtcbiAgICAgICAgICAgIHJldHVybiBlbGVtZW50LmN1cnJlbnRTdHlsZVtwcm9wZXJ0eV07XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZ2xvYmFsLmRvY3VtZW50LmRlZmF1bHRWaWV3LmdldENvbXB1dGVkU3R5bGUoZWxlbWVudCwgbnVsbCkuZ2V0UHJvcGVydHlWYWx1ZShwcm9wZXJ0eSk7XG4gICAgfTtcbn0pKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93IDogdGhpcyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZ2V0U3R5bGU7XG4iLCJ2YXIgcG9seWZpbGwgPSAoZnVuY3Rpb24gKGdsb2JhbCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIC8qKlxuICAgICAqIEBzZWUgaHR0cHM6Ly9naXN0LmdpdGh1Yi5jb20vbXJkb29iLzgzODc4NVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHBvbHlmaWxsUmVxdWVzdEFuaW1hdGlvbkZyYW1lICgpIHtcbiAgICAgICAgaWYgKCFnbG9iYWwucmVxdWVzdEFuaW1hdGlvbkZyYW1lKSB7XG4gICAgICAgICAgICBnbG9iYWwucmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZ2xvYmFsLndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICAgICAgICAgICAgICAgICAgICBnbG9iYWwubW96UmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8XG4gICAgICAgICAgICAgICAgICAgIGdsb2JhbC5vUmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8XG4gICAgICAgICAgICAgICAgICAgIGdsb2JhbC5tc1JlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGdsb2JhbC5zZXRUaW1lb3V0KGNhbGxiYWNrLCAxMDAwIC8gNjApO1xuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSkoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghZ2xvYmFsLmNhbmNlbEFuaW1hdGlvbkZyYW1lKSB7XG4gICAgICAgICAgICBnbG9iYWwuY2FuY2VsQW5pbWF0aW9uRnJhbWUgPSAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBnbG9iYWwud2Via2l0Q2FuY2VsQW5pbWF0aW9uRnJhbWUgfHxcbiAgICAgICAgICAgICAgICAgICAgZ2xvYmFsLm1vekNhbmNlbEFuaW1hdGlvbkZyYW1lIHx8XG4gICAgICAgICAgICAgICAgICAgIGdsb2JhbC5vQ2FuY2VsQW5pbWF0aW9uRnJhbWUgfHxcbiAgICAgICAgICAgICAgICAgICAgZ2xvYmFsLm1zQ2FuY2VsQW5pbWF0aW9uRnJhbWUgfHxcbiAgICAgICAgICAgICAgICAgICAgZ2xvYmFsLmNsZWFyVGltZW91dDtcbiAgICAgICAgICAgIH0pKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWU6IHBvbHlmaWxsUmVxdWVzdEFuaW1hdGlvbkZyYW1lXG4gICAgfTtcbn0pKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93IDogdGhpcyk7XG5cbm1vZHVsZS5leHBvcnRzID0gcG9seWZpbGw7XG4iLCJ2YXIgcmVzaXplU2Vuc29yRmFjdG9yeSA9IChmdW5jdGlvbiAoZ2xvYmFsKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgLyoqIEB2YXIge0Z1bmN0aW9ufSAqL1xuICAgIHZhciBnZXRTdHlsZSA9IHJlcXVpcmUoJy4vZ2V0U3R5bGUnKTtcbiAgICAvKiogQHZhciB7T2JqZWN0fSAqL1xuICAgIHZhciBjc3MgPSByZXF1aXJlKCcuL2NzcycpO1xuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gdGFyZ2V0RWxlbWVudFxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrXG4gICAgICogQGNvbnN0cnVjdG9yXG4gICAgICovXG4gICAgdmFyIHJlc2l6ZVNlbnNvciA9IGZ1bmN0aW9uICh0YXJnZXRFbGVtZW50LCBjYWxsYmFjaykge1xuICAgICAgICAvKiogQHZhciB7SFRNTEVsZW1lbnR9ICovXG4gICAgICAgIHRoaXMudGFyZ2V0RWxlbWVudCA9IHRhcmdldEVsZW1lbnQ7XG4gICAgICAgIC8qKiBAdmFyIHtGdW5jdGlvbn0gKi9cbiAgICAgICAgdGhpcy5jYWxsYmFjayA9IGNhbGxiYWNrO1xuICAgICAgICAvKiogQHZhciB7e3dpZHRoOiBpbnQsIGhlaWdodDogaW50fX0gKi9cbiAgICAgICAgdGhpcy5kaW1lbnNpb25zID0ge1xuICAgICAgICAgICAgd2lkdGg6IDAsXG4gICAgICAgICAgICBoZWlnaHQ6IDBcbiAgICAgICAgfTtcblxuICAgICAgICBpZiAoJ2F0dGFjaEV2ZW50JyBpbiBnbG9iYWwuZG9jdW1lbnQpIHtcbiAgICAgICAgICAgIHRoaXMuYm91bmRPblJlc2l6ZUhhbmRsZXIgPSB0aGlzLm9uRWxlbWVudFJlc2l6ZS5iaW5kKHRoaXMpO1xuICAgICAgICAgICAgdGhpcy50YXJnZXRFbGVtZW50LmF0dGFjaEV2ZW50KCdvbnJlc2l6ZScsIHRoaXMuYm91bmRPblJlc2l6ZUhhbmRsZXIpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLyoqIEB2YXIge3tjb250YWluZXI6IEhUTUxFbGVtZW50LCBleHBhbmQ6IEhUTUxFbGVtZW50LCBleHBhbmRDaGlsZDogSFRNTEVsZW1lbnQsIGNvbnRyYWN0OiBIVE1MRWxlbWVudH19ICovXG4gICAgICAgIHRoaXMudHJpZ2dlckVsZW1lbnRzID0ge307XG4gICAgICAgIC8qKiBAdmFyIHtpbnR9ICovXG4gICAgICAgIHRoaXMucmVzaXplUkFGID0gMDtcblxuICAgICAgICB0aGlzLnNldHVwKCk7XG4gICAgfTtcblxuICAgIHJlc2l6ZVNlbnNvci5wcm90b3R5cGUuc2V0dXAgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vIE1ha2Ugc3VyZSB0aGUgdGFyZ2V0IGVsZW1lbnQgaXMgXCJwb3NpdGlvbmVkXCJcbiAgICAgICAgaWYgKGdldFN0eWxlKHRoaXMudGFyZ2V0RWxlbWVudCwgJ3Bvc2l0aW9uJykgPT09ICdzdGF0aWMnKSB7XG4gICAgICAgICAgICB0aGlzLnRhcmdldEVsZW1lbnQuc3R5bGUucG9zaXRpb24gPSAncmVsYXRpdmUnO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ3JlYXRlIGFuZCBhcHBlbmQgcmVzaXplIHRyaWdnZXIgZWxlbWVudHNcbiAgICAgICAgdGhpcy5pbnNlcnRSZXNpemVUcmlnZ2VyRWxlbWVudHMoKTtcblxuICAgICAgICAvLyBTdGFydCBsaXN0ZW5pbmcgdG8gZXZlbnRzXG4gICAgICAgIHRoaXMuYm91bmRTY3JvbGxMaXN0ZW5lciA9IHRoaXMuaGFuZGxlRWxlbWVudFNjcm9sbC5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLnRhcmdldEVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgdGhpcy5ib3VuZFNjcm9sbExpc3RlbmVyLCB0cnVlKTtcblxuICAgICAgICBpZiAoY3NzLmlzQW5pbWF0aW9uU3VwcG9ydGVkKCkpIHtcbiAgICAgICAgICAgIHRoaXMuYm91bmRBbmltYXRpb25TdGFydExpc3RlbmVyID0gdGhpcy5yZXNldFRyaWdnZXJzT25BbmltYXRpb25TdGFydC5iaW5kKHRoaXMpO1xuICAgICAgICAgICAgdGhpcy50cmlnZ2VyRWxlbWVudHMuY29udGFpbmVyLmFkZEV2ZW50TGlzdGVuZXIoXG4gICAgICAgICAgICAgICAgY3NzLmdldEFuaW1hdGlvblByb3BlcnRpZXNGb3JCcm93c2VyKCkuYW5pbWF0aW9uU3RhcnRFdmVudCxcbiAgICAgICAgICAgICAgICB0aGlzLmJvdW5kQW5pbWF0aW9uU3RhcnRMaXN0ZW5lclxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEluaXRpYWwgdmFsdWUgcmVzZXQgb2YgYWxsIHRyaWdnZXJzXG4gICAgICAgIHRoaXMucmVzZXRUcmlnZ2VycygpO1xuICAgIH07XG5cbiAgICByZXNpemVTZW5zb3IucHJvdG90eXBlLmluc2VydFJlc2l6ZVRyaWdnZXJFbGVtZW50cyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIHJlc2l6ZVRyaWdnZXIgPSBnbG9iYWwuZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIHZhciBleHBhbmRUcmlnZ2VyID0gZ2xvYmFsLmRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICB2YXIgZXhwYW5kVHJpZ2dlckNoaWxkID0gZ2xvYmFsLmRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICB2YXIgY29udHJhY3RUcmlnZ2VyID0gZ2xvYmFsLmRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuXG4gICAgICAgIHJlc2l6ZVRyaWdnZXIuY2xhc3NOYW1lID0gJ1Jlc2l6ZVNlbnNvciBSZXNpemVTZW5zb3JfX3Jlc2l6ZVRyaWdnZXJzJztcbiAgICAgICAgZXhwYW5kVHJpZ2dlci5jbGFzc05hbWUgPSAnUmVzaXplU2Vuc29yX19leHBhbmRUcmlnZ2VyJztcbiAgICAgICAgY29udHJhY3RUcmlnZ2VyLmNsYXNzTmFtZSA9ICdSZXNpemVTZW5zb3JfX2NvbnRyYWN0VHJpZ2dlcic7XG5cbiAgICAgICAgZXhwYW5kVHJpZ2dlci5hcHBlbmRDaGlsZChleHBhbmRUcmlnZ2VyQ2hpbGQpO1xuICAgICAgICByZXNpemVUcmlnZ2VyLmFwcGVuZENoaWxkKGV4cGFuZFRyaWdnZXIpO1xuICAgICAgICByZXNpemVUcmlnZ2VyLmFwcGVuZENoaWxkKGNvbnRyYWN0VHJpZ2dlcik7XG5cbiAgICAgICAgdGhpcy50cmlnZ2VyRWxlbWVudHMuY29udGFpbmVyID0gcmVzaXplVHJpZ2dlcjtcbiAgICAgICAgdGhpcy50cmlnZ2VyRWxlbWVudHMuZXhwYW5kID0gZXhwYW5kVHJpZ2dlcjtcbiAgICAgICAgdGhpcy50cmlnZ2VyRWxlbWVudHMuZXhwYW5kQ2hpbGQgPSBleHBhbmRUcmlnZ2VyQ2hpbGQ7XG4gICAgICAgIHRoaXMudHJpZ2dlckVsZW1lbnRzLmNvbnRyYWN0ID0gY29udHJhY3RUcmlnZ2VyO1xuXG4gICAgICAgIHRoaXMudGFyZ2V0RWxlbWVudC5hcHBlbmRDaGlsZChyZXNpemVUcmlnZ2VyKTtcbiAgICB9O1xuXG4gICAgcmVzaXplU2Vuc29yLnByb3RvdHlwZS5vbkVsZW1lbnRSZXNpemUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBjdXJyZW50RGltZW5zaW9ucyA9IHRoaXMuZ2V0RGltZW5zaW9ucygpO1xuXG4gICAgICAgIGlmICh0aGlzLmlzUmVzaXplZChjdXJyZW50RGltZW5zaW9ucykpIHtcbiAgICAgICAgICAgIHRoaXMuZGltZW5zaW9ucy53aWR0aCA9IGN1cnJlbnREaW1lbnNpb25zLndpZHRoO1xuICAgICAgICAgICAgdGhpcy5kaW1lbnNpb25zLmhlaWdodCA9IGN1cnJlbnREaW1lbnNpb25zLmhlaWdodDtcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudFJlc2l6ZWQoKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICByZXNpemVTZW5zb3IucHJvdG90eXBlLmhhbmRsZUVsZW1lbnRTY3JvbGwgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgICAgdGhpcy5yZXNldFRyaWdnZXJzKCk7XG5cbiAgICAgICAgaWYgKHRoaXMucmVzaXplUkFGKSB7XG4gICAgICAgICAgICBnbG9iYWwuY2FuY2VsQW5pbWF0aW9uRnJhbWUodGhpcy5yZXNpemVSQUYpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5yZXNpemVSQUYgPSBnbG9iYWwucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBjdXJyZW50RGltZW5zaW9ucyA9IF90aGlzLmdldERpbWVuc2lvbnMoKTtcbiAgICAgICAgICAgIGlmIChfdGhpcy5pc1Jlc2l6ZWQoY3VycmVudERpbWVuc2lvbnMpKSB7XG4gICAgICAgICAgICAgICAgX3RoaXMuZGltZW5zaW9ucy53aWR0aCA9IGN1cnJlbnREaW1lbnNpb25zLndpZHRoO1xuICAgICAgICAgICAgICAgIF90aGlzLmRpbWVuc2lvbnMuaGVpZ2h0ID0gY3VycmVudERpbWVuc2lvbnMuaGVpZ2h0O1xuICAgICAgICAgICAgICAgIF90aGlzLmVsZW1lbnRSZXNpemVkKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge3t3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn19IGN1cnJlbnREaW1lbnNpb25zXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAgICovXG4gICAgcmVzaXplU2Vuc29yLnByb3RvdHlwZS5pc1Jlc2l6ZWQgPSBmdW5jdGlvbiAoY3VycmVudERpbWVuc2lvbnMpIHtcbiAgICAgICAgcmV0dXJuIChjdXJyZW50RGltZW5zaW9ucy53aWR0aCAhPT0gdGhpcy5kaW1lbnNpb25zLndpZHRoIHx8IGN1cnJlbnREaW1lbnNpb25zLmhlaWdodCAhPT0gdGhpcy5kaW1lbnNpb25zLmhlaWdodCk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEByZXR1cm5zIHt7d2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9fVxuICAgICAqL1xuICAgIHJlc2l6ZVNlbnNvci5wcm90b3R5cGUuZ2V0RGltZW5zaW9ucyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHdpZHRoOiB0aGlzLnRhcmdldEVsZW1lbnQub2Zmc2V0V2lkdGgsXG4gICAgICAgICAgICBoZWlnaHQ6IHRoaXMudGFyZ2V0RWxlbWVudC5vZmZzZXRIZWlnaHRcbiAgICAgICAgfTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtFdmVudH0gZXZlbnRcbiAgICAgKi9cbiAgICByZXNpemVTZW5zb3IucHJvdG90eXBlLnJlc2V0VHJpZ2dlcnNPbkFuaW1hdGlvblN0YXJ0ID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgIGlmIChldmVudC5hbmltYXRpb25OYW1lID09PSBjc3MuZ2V0QW5pbWF0aW9uUHJvcGVydGllc0ZvckJyb3dzZXIoKS5hbmltYXRpb25OYW1lKSB7XG4gICAgICAgICAgICB0aGlzLnJlc2V0VHJpZ2dlcnMoKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICByZXNpemVTZW5zb3IucHJvdG90eXBlLnJlc2V0VHJpZ2dlcnMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMudHJpZ2dlckVsZW1lbnRzLmNvbnRyYWN0LnNjcm9sbExlZnQgPSB0aGlzLnRyaWdnZXJFbGVtZW50cy5jb250cmFjdC5zY3JvbGxXaWR0aDtcbiAgICAgICAgdGhpcy50cmlnZ2VyRWxlbWVudHMuY29udHJhY3Quc2Nyb2xsVG9wID0gdGhpcy50cmlnZ2VyRWxlbWVudHMuY29udHJhY3Quc2Nyb2xsSGVpZ2h0O1xuICAgICAgICB0aGlzLnRyaWdnZXJFbGVtZW50cy5leHBhbmRDaGlsZC5zdHlsZS53aWR0aCA9IHRoaXMudHJpZ2dlckVsZW1lbnRzLmV4cGFuZC5vZmZzZXRXaWR0aCArIDEgKyAncHgnO1xuICAgICAgICB0aGlzLnRyaWdnZXJFbGVtZW50cy5leHBhbmRDaGlsZC5zdHlsZS5oZWlnaHQgPSB0aGlzLnRyaWdnZXJFbGVtZW50cy5leHBhbmQub2Zmc2V0SGVpZ2h0ICsgMSArICdweCc7XG4gICAgICAgIHRoaXMudHJpZ2dlckVsZW1lbnRzLmV4cGFuZC5zY3JvbGxMZWZ0ID0gdGhpcy50cmlnZ2VyRWxlbWVudHMuZXhwYW5kLnNjcm9sbFdpZHRoO1xuICAgICAgICB0aGlzLnRyaWdnZXJFbGVtZW50cy5leHBhbmQuc2Nyb2xsVG9wID0gdGhpcy50cmlnZ2VyRWxlbWVudHMuZXhwYW5kLnNjcm9sbEhlaWdodDtcbiAgICB9O1xuXG4gICAgcmVzaXplU2Vuc29yLnByb3RvdHlwZS5lbGVtZW50UmVzaXplZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5jYWxsYmFjayh0aGlzLmRpbWVuc2lvbnMpO1xuICAgIH07XG5cbiAgICByZXNpemVTZW5zb3IucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMucmVtb3ZlRXZlbnRMaXN0ZW5lcnMoKTtcbiAgICAgICAgdGhpcy50YXJnZXRFbGVtZW50LnJlbW92ZUNoaWxkKHRoaXMudHJpZ2dlckVsZW1lbnRzLmNvbnRhaW5lcik7XG4gICAgICAgIGRlbGV0ZSB0aGlzLmJvdW5kQW5pbWF0aW9uU3RhcnRMaXN0ZW5lcjtcbiAgICAgICAgZGVsZXRlIHRoaXMuYm91bmRTY3JvbGxMaXN0ZW5lcjtcbiAgICAgICAgZGVsZXRlIHRoaXMuY2FsbGJhY2s7XG4gICAgICAgIGRlbGV0ZSB0aGlzLnRhcmdldEVsZW1lbnQ7XG4gICAgfTtcblxuICAgIHJlc2l6ZVNlbnNvci5wcm90b3R5cGUucmVtb3ZlRXZlbnRMaXN0ZW5lcnMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICgnYXR0YWNoRXZlbnQnIGluIGdsb2JhbC5kb2N1bWVudCkge1xuICAgICAgICAgICAgdGhpcy50YXJnZXRFbGVtZW50LmRldGFjaEV2ZW50KCdvbnJlc2l6ZScsIHRoaXMuYm91bmRPblJlc2l6ZUhhbmRsZXIpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy50cmlnZ2VyRWxlbWVudHMuY29udGFpbmVyLnJlbW92ZUV2ZW50TGlzdGVuZXIoXG4gICAgICAgICAgICBjc3MuZ2V0QW5pbWF0aW9uUHJvcGVydGllc0ZvckJyb3dzZXIoKS5hbmltYXRpb25TdGFydEV2ZW50LFxuICAgICAgICAgICAgdGhpcy5ib3VuZEFuaW1hdGlvblN0YXJ0TGlzdGVuZXJcbiAgICAgICAgKTtcbiAgICAgICAgdGhpcy50YXJnZXRFbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIHRoaXMuYm91bmRTY3JvbGxMaXN0ZW5lciwgdHJ1ZSk7XG4gICAgfTtcblxuICAgIHJldHVybiB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcGFyYW0ge0VsZW1lbnR9IHRhcmdldEVsZW1lbnRcbiAgICAgICAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2tcbiAgICAgICAgICogQHJldHVybnMge3Jlc2l6ZVNlbnNvcn1cbiAgICAgICAgICovXG4gICAgICAgIGNyZWF0ZTogZnVuY3Rpb24gKHRhcmdldEVsZW1lbnQsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IHJlc2l6ZVNlbnNvcih0YXJnZXRFbGVtZW50LCBjYWxsYmFjayk7XG4gICAgICAgIH1cbiAgICB9O1xufSkodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgPyB3aW5kb3cgOiB0aGlzKTtcblxubW9kdWxlLmV4cG9ydHMgPSByZXNpemVTZW5zb3JGYWN0b3J5O1xuIiwidmFyIHNlbnNvcnMgPSAoZnVuY3Rpb24gKGdsb2JhbCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIC8qKiBAdmFyIHtPYmplY3R9ICovXG4gICAgdmFyIGNzcyA9IHJlcXVpcmUoJy4vY3NzJyk7XG4gICAgLyoqIEB2YXIge09iamVjdH0gKi9cbiAgICB2YXIgcG9seWZpbGwgPSByZXF1aXJlKCcuL3BvbHlmaWxsJyk7XG4gICAgLyoqIEB2YXIge09iamVjdH0gKi9cbiAgICB2YXIgcmVzaXplU2Vuc29yRmFjdG9yeSA9IHJlcXVpcmUoJy4vcmVzaXplU2Vuc29yJyk7XG5cbiAgICAvKioge2FycmF5fSAqL1xuICAgIHZhciB1bnN1aXRhYmxlRWxlbWVudHMgPSBbJ0lNRycsICdDT0wnLCAnVFInLCAnVEhFQUQnLCAnVEZPT1QnXTtcbiAgICAvKioge2Jvb2xlYW59ICovXG4gICAgdmFyIHN1cHBvcnRzQXR0YWNoRXZlbnQgPSAoJ2F0dGFjaEV2ZW50JyBpbiBnbG9iYWwuZG9jdW1lbnQpO1xuXG4gICAgLyoqIHt7fX0gTWFwIG9mIGFsbCByZXNpemUgc2Vuc29ycyAoaWQgPT4gUmVzaXplU2Vuc29yKSAqL1xuICAgIHZhciBhbGxSZXNpemVTZW5zb3JzID0ge307XG5cbiAgICBpZiAoIXN1cHBvcnRzQXR0YWNoRXZlbnQpIHtcbiAgICAgICAgY3NzLmluc2VydFJlc2l6ZVNlbnNvclN0eWxlcygpO1xuXG4gICAgICAgIGlmICghKCdyZXF1ZXN0QW5pbWF0aW9uRnJhbWUnIGluIGdsb2JhbCkgfHwgISgnY2FuY2VsQW5pbWF0aW9uRnJhbWUnIGluIGdsb2JhbCkpIHtcbiAgICAgICAgICAgIHBvbHlmaWxsLnJlcXVlc3RBbmltYXRpb25GcmFtZSgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtFbGVtZW50fSB0YXJnZXRFbGVtZW50XG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2tcbiAgICAgKiBAcmV0dXJucyB7cmVzaXplU2Vuc29yfVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGNyZWF0ZSAodGFyZ2V0RWxlbWVudCwgY2FsbGJhY2spIHtcbiAgICAgICAgaWYgKGlzVW5zdWl0YWJsZUVsZW1lbnQodGFyZ2V0RWxlbWVudCkpIHtcbiAgICAgICAgICAgIGNvbnNvbGUgJiYgY29uc29sZS5lcnJvcihcIkdpdmVuIGVsZW1lbnQgaXNuJ3Qgc3VpdGFibGUgdG8gYWN0IGFzIGEgcmVzaXplIHNlbnNvci4gVHJ5IHdyYXBwaW5nIGl0IHdpdGggb25lIHRoYXQgaXMuIFVuc3VpdGFibGUgZWxlbWVudHMgYXJlOlwiLCB1bnN1aXRhYmxlRWxlbWVudHMpO1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgc2Vuc29ySWQgPSBnZXRTZW5zb3JJZCh0YXJnZXRFbGVtZW50KTtcblxuICAgICAgICBpZiAoYWxsUmVzaXplU2Vuc29yc1tzZW5zb3JJZF0pIHtcbiAgICAgICAgICAgIHJldHVybiBhbGxSZXNpemVTZW5zb3JzW3NlbnNvcklkXTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBzZW5zb3IgPSByZXNpemVTZW5zb3JGYWN0b3J5LmNyZWF0ZSh0YXJnZXRFbGVtZW50LCBjYWxsYmFjayk7XG4gICAgICAgIGFsbFJlc2l6ZVNlbnNvcnNbc2Vuc29ySWRdID0gc2Vuc29yO1xuICAgICAgICByZXR1cm4gc2Vuc29yO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7RWxlbWVudH0gdGFyZ2V0RWxlbWVudFxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGRlc3Ryb3kgKHRhcmdldEVsZW1lbnQpIHtcbiAgICAgICAgdmFyIHNlbnNvcklkID0gZ2V0U2Vuc29ySWQodGFyZ2V0RWxlbWVudCk7XG4gICAgICAgIHZhciBzZW5zb3IgPSBhbGxSZXNpemVTZW5zb3JzW3NlbnNvcklkXTtcblxuICAgICAgICBpZiAoIXNlbnNvcikge1xuICAgICAgICAgICAgY29uc29sZSAmJiBjb25zb2xlLmVycm9yKFwiQ2FuJ3QgZGVzdHJveSBSZXNpemVTZW5zb3IgKDQwNCBub3QgZm91bmQpLlwiLCB0YXJnZXRFbGVtZW50KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHNlbnNvci5kZXN0cm95KCk7XG4gICAgICAgIGRlbGV0ZSBhbGxSZXNpemVTZW5zb3JzW3NlbnNvcklkXTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge0VsZW1lbnR9IHRhcmdldEVsZW1lbnRcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGdldFNlbnNvcklkICh0YXJnZXRFbGVtZW50KSB7XG4gICAgICAgIHJldHVybiB0YXJnZXRFbGVtZW50LmlkO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IHRhcmdldEVsZW1lbnRcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBpc1Vuc3VpdGFibGVFbGVtZW50ICh0YXJnZXRFbGVtZW50KSB7XG4gICAgICAgIHZhciB0YWdOYW1lID0gdGFyZ2V0RWxlbWVudC50YWdOYW1lLnRvVXBwZXJDYXNlKCk7XG4gICAgICAgIHJldHVybiAodW5zdWl0YWJsZUVsZW1lbnRzLmluZGV4T2YodGFnTmFtZSkgPiAtMSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgY3JlYXRlOiBjcmVhdGUsXG4gICAgICAgIGRlc3Ryb3k6IGRlc3Ryb3lcbiAgICB9O1xufSkodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgPyB3aW5kb3cgOiB0aGlzKTtcblxubW9kdWxlLmV4cG9ydHMgPSBzZW5zb3JzOyJdfQ==
