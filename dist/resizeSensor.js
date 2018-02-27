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
    
    function clear () {
        allResizeSensors = {};
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
        destroy: destroy,
        clear: clear
    };
})(typeof window !== 'undefined' ? window : this);

module.exports = sensors;

},{"./css":1,"./polyfill":3,"./resizeSensor":4}]},{},[5])(5)
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlc1xcYnJvd3Nlci1wYWNrXFxfcHJlbHVkZS5qcyIsInNyYy9jc3MuanMiLCJzcmMvZ2V0U3R5bGUuanMiLCJzcmMvcG9seWZpbGwuanMiLCJzcmMvcmVzaXplU2Vuc29yLmpzIiwic3JjL3NlbnNvcnMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBjc3MgPSAoZnVuY3Rpb24gKGdsb2JhbCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIC8qKiBAdmFyIHtudWxsfE9iamVjdH0gKi9cbiAgICB2YXIgYW5pbWF0aW9uUHJvcGVydGllc0ZvckJyb3dzZXIgPSBudWxsO1xuICAgIC8qKiBAdmFyIHtudWxsfGJvb2xlYW59ICovXG4gICAgdmFyIGlzQ3NzQW5pbWF0aW9uU3VwcG9ydGVkID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIERldGVybWluZXMgd2hpY2ggc3R5bGUgY29udmVudGlvbiAocHJvcGVydGllcykgdG8gZm9sbG93XG4gICAgICogQHNlZSBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9HdWlkZS9DU1MvVXNpbmdfQ1NTX2FuaW1hdGlvbnMvRGV0ZWN0aW5nX0NTU19hbmltYXRpb25fc3VwcG9ydFxuICAgICAqIEByZXR1cm5zIHt7a2V5ZnJhbWVzUnVsZTogc3RyaW5nLCBzdHlsZURlY2xhcmF0aW9uOiBzdHJpbmcsIGFuaW1hdGlvblN0YXJ0RXZlbnQ6IHN0cmluZywgYW5pbWF0aW9uTmFtZTogc3RyaW5nfX1cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBnZXRBbmltYXRpb25Qcm9wZXJ0aWVzRm9yQnJvd3NlciAoKSB7XG4gICAgICAgIGlmIChhbmltYXRpb25Qcm9wZXJ0aWVzRm9yQnJvd3NlciAhPT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuIGFuaW1hdGlvblByb3BlcnRpZXNGb3JCcm93c2VyO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHRlc3RFbGVtZW50ID0gZ2xvYmFsLmRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICB2YXIgc3VwcG9ydHNVbnByZWZpeGVkQW5pbWF0aW9uUHJvcGVydGllcyA9ICgnYW5pbWF0aW9uTmFtZScgaW4gdGVzdEVsZW1lbnQuc3R5bGUpO1xuXG4gICAgICAgIC8vIFVucHJlZml4ZWQgYW5pbWF0aW9uIHByb3BlcnRpZXNcbiAgICAgICAgdmFyIGFuaW1hdGlvblN0YXJ0RXZlbnQgPSAnYW5pbWF0aW9uc3RhcnQnO1xuICAgICAgICB2YXIgYW5pbWF0aW9uTmFtZSA9ICdyZXNpemVhbmltJztcblxuICAgICAgICBpZiAoc3VwcG9ydHNVbnByZWZpeGVkQW5pbWF0aW9uUHJvcGVydGllcykge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBrZXlmcmFtZXNSdWxlOiAnQGtleWZyYW1lcyAnICsgYW5pbWF0aW9uTmFtZSArICcge2Zyb20geyBvcGFjaXR5OiAwOyB9IHRvIHsgb3BhY2l0eTogMDsgfX0nLFxuICAgICAgICAgICAgICAgIHN0eWxlRGVjbGFyYXRpb246ICdhbmltYXRpb246IDFtcyAnICsgYW5pbWF0aW9uTmFtZSArICc7JyxcbiAgICAgICAgICAgICAgICBhbmltYXRpb25TdGFydEV2ZW50OiBhbmltYXRpb25TdGFydEV2ZW50LFxuICAgICAgICAgICAgICAgIGFuaW1hdGlvbk5hbWU6IGFuaW1hdGlvbk5hbWVcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICAvLyBCcm93c2VyIHNwZWNpZmljIGFuaW1hdGlvbiBwcm9wZXJ0aWVzXG4gICAgICAgIHZhciBrZXlmcmFtZVByZWZpeCA9ICcnO1xuICAgICAgICB2YXIgYnJvd3NlclByZWZpeGVzID0gWydXZWJraXQnLCAnTW96JywgJ08nLCAnbXMnXTtcbiAgICAgICAgdmFyIHN0YXJ0RXZlbnRzID0gWyd3ZWJraXRBbmltYXRpb25TdGFydCcsICdhbmltYXRpb25zdGFydCcsICdvQW5pbWF0aW9uU3RhcnQnLCAnTVNBbmltYXRpb25TdGFydCddO1xuXG4gICAgICAgIHZhciBpO1xuICAgICAgICB2YXIgbCA9IGJyb3dzZXJQcmVmaXhlcy5sZW5ndGg7XG5cbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgICAgaWYgKChicm93c2VyUHJlZml4ZXNbaV0gKyAnQW5pbWF0aW9uTmFtZScpIGluIHRlc3RFbGVtZW50LnN0eWxlKSB7XG4gICAgICAgICAgICAgICAga2V5ZnJhbWVQcmVmaXggPSAnLScgKyBicm93c2VyUHJlZml4ZXNbaV0udG9Mb3dlckNhc2UoKSArICctJztcbiAgICAgICAgICAgICAgICBhbmltYXRpb25TdGFydEV2ZW50ID0gc3RhcnRFdmVudHNbaV07XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBhbmltYXRpb25Qcm9wZXJ0aWVzRm9yQnJvd3NlciA9IHtcbiAgICAgICAgICAgIGtleWZyYW1lc1J1bGU6ICdAJyArIGtleWZyYW1lUHJlZml4ICsgJ2tleWZyYW1lcyAnICsgYW5pbWF0aW9uTmFtZSArICcge2Zyb20geyBvcGFjaXR5OiAwOyB9IHRvIHsgb3BhY2l0eTogMDsgfX0nLFxuICAgICAgICAgICAgc3R5bGVEZWNsYXJhdGlvbjoga2V5ZnJhbWVQcmVmaXggKyAnYW5pbWF0aW9uOiAxbXMgJyArIGFuaW1hdGlvbk5hbWUgKyAnOycsXG4gICAgICAgICAgICBhbmltYXRpb25TdGFydEV2ZW50OiBhbmltYXRpb25TdGFydEV2ZW50LFxuICAgICAgICAgICAgYW5pbWF0aW9uTmFtZTogYW5pbWF0aW9uTmFtZVxuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiBhbmltYXRpb25Qcm9wZXJ0aWVzRm9yQnJvd3NlcjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBpc0NTU0FuaW1hdGlvblN1cHBvcnRlZCAoKSB7XG4gICAgICAgIGlmIChpc0Nzc0FuaW1hdGlvblN1cHBvcnRlZCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuIGlzQ3NzQW5pbWF0aW9uU3VwcG9ydGVkO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHRlc3RFbGVtZW50ID0gZ2xvYmFsLmRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICB2YXIgaXNBbmltYXRpb25TdXBwb3J0ZWQgPSAoJ2FuaW1hdGlvbk5hbWUnIGluIHRlc3RFbGVtZW50LnN0eWxlKTtcblxuICAgICAgICBpZiAoaXNBbmltYXRpb25TdXBwb3J0ZWQpIHtcbiAgICAgICAgICAgIGlzQ3NzQW5pbWF0aW9uU3VwcG9ydGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIHJldHVybiBpc0Nzc0FuaW1hdGlvblN1cHBvcnRlZDtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBicm93c2VyUHJlZml4ZXMgPSAnV2Via2l0IE1veiBPIG1zJy5zcGxpdCgnICcpO1xuICAgICAgICB2YXIgaSA9IDA7XG4gICAgICAgIHZhciBsID0gYnJvd3NlclByZWZpeGVzLmxlbmd0aDtcblxuICAgICAgICBmb3IgKDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgICAgaWYgKChicm93c2VyUHJlZml4ZXNbaV0gKyAnQW5pbWF0aW9uTmFtZScpIGluIHRlc3RFbGVtZW50LnN0eWxlKSB7XG4gICAgICAgICAgICAgICAgaXNDc3NBbmltYXRpb25TdXBwb3J0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHJldHVybiBpc0Nzc0FuaW1hdGlvblN1cHBvcnRlZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlzQ3NzQW5pbWF0aW9uU3VwcG9ydGVkID0gZmFsc2U7XG4gICAgICAgIHJldHVybiBpc0Nzc0FuaW1hdGlvblN1cHBvcnRlZDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBZGRzIGEgc3R5bGUgYmxvY2sgdGhhdCBjb250YWlucyBDU1MgZXNzZW50aWFsIGZvciBkZXRlY3RpbmcgcmVzaXplIGV2ZW50c1xuICAgICAqL1xuICAgIGZ1bmN0aW9uIGluc2VydFJlc2l6ZVNlbnNvclN0eWxlcyAoKSB7XG4gICAgICAgIHZhciBjc3NSdWxlcyA9IFtcbiAgICAgICAgICAgIChnZXRBbmltYXRpb25Qcm9wZXJ0aWVzRm9yQnJvd3NlcigpLmtleWZyYW1lc1J1bGUpID8gZ2V0QW5pbWF0aW9uUHJvcGVydGllc0ZvckJyb3dzZXIoKS5rZXlmcmFtZXNSdWxlIDogJycsXG4gICAgICAgICAgICAnLlJlc2l6ZVNlbnNvcl9fcmVzaXplVHJpZ2dlcnMgeyAnICsgKChnZXRBbmltYXRpb25Qcm9wZXJ0aWVzRm9yQnJvd3NlcigpLnN0eWxlRGVjbGFyYXRpb24pID8gZ2V0QW5pbWF0aW9uUHJvcGVydGllc0ZvckJyb3dzZXIoKS5zdHlsZURlY2xhcmF0aW9uIDogJycpICsgJyB2aXNpYmlsaXR5OiBoaWRkZW47IG9wYWNpdHk6IDA7IH0nLFxuICAgICAgICAgICAgJy5SZXNpemVTZW5zb3JfX3Jlc2l6ZVRyaWdnZXJzLCAuUmVzaXplU2Vuc29yX19yZXNpemVUcmlnZ2VycyA+IGRpdiwgLlJlc2l6ZVNlbnNvcl9fY29udHJhY3RUcmlnZ2VyOmJlZm9yZSB7IGNvbnRlbnQ6IFxcJyBcXCc7IGRpc3BsYXk6IGJsb2NrOyBwb3NpdGlvbjogYWJzb2x1dGU7IHRvcDogMDsgbGVmdDogMDsgaGVpZ2h0OiAxMDAlOyB3aWR0aDogMTAwJTsgb3ZlcmZsb3c6IGhpZGRlbjsgfSAuUmVzaXplU2Vuc29yX19yZXNpemVUcmlnZ2VycyA+IGRpdiB7IGJhY2tncm91bmQ6ICNlZWU7IG92ZXJmbG93OiBhdXRvOyB9IC5SZXNpemVTZW5zb3JfX2NvbnRyYWN0VHJpZ2dlcjpiZWZvcmUgeyB3aWR0aDogMjAwJTsgaGVpZ2h0OiAyMDAlOyB9J1xuICAgICAgICBdO1xuXG4gICAgICAgIGNzc1J1bGVzID0gY3NzUnVsZXMuam9pbignICcpO1xuXG4gICAgICAgIHZhciBoZWFkRWxlbSA9IGdsb2JhbC5kb2N1bWVudC5oZWFkIHx8IGdsb2JhbC5kb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaGVhZCcpWzBdO1xuXG4gICAgICAgIHZhciBzdHlsZUVsZW0gPSBnbG9iYWwuZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKTtcbiAgICAgICAgc3R5bGVFbGVtLnR5cGUgPSAndGV4dC9jc3MnO1xuXG4gICAgICAgIGlmIChzdHlsZUVsZW0uc3R5bGVTaGVldCkge1xuICAgICAgICAgICAgc3R5bGVFbGVtLnN0eWxlU2hlZXQuY3NzVGV4dCA9IGNzc1J1bGVzO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3R5bGVFbGVtLmFwcGVuZENoaWxkKGdsb2JhbC5kb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShjc3NSdWxlcykpO1xuICAgICAgICB9XG5cbiAgICAgICAgaGVhZEVsZW0uYXBwZW5kQ2hpbGQoc3R5bGVFbGVtKTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBpbnNlcnRSZXNpemVTZW5zb3JTdHlsZXM6IGluc2VydFJlc2l6ZVNlbnNvclN0eWxlcyxcbiAgICAgICAgaXNBbmltYXRpb25TdXBwb3J0ZWQ6IGlzQ1NTQW5pbWF0aW9uU3VwcG9ydGVkLFxuICAgICAgICBnZXRBbmltYXRpb25Qcm9wZXJ0aWVzRm9yQnJvd3NlcjogZ2V0QW5pbWF0aW9uUHJvcGVydGllc0ZvckJyb3dzZXJcbiAgICB9O1xufSkodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgPyB3aW5kb3cgOiB0aGlzKTtcblxubW9kdWxlLmV4cG9ydHMgPSBjc3M7XG4iLCJ2YXIgZ2V0U3R5bGUgPSAoZnVuY3Rpb24gKGdsb2JhbCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gcHJvcGVydHlcbiAgICAgKiBAcmV0dXJucyB7bnVsbHxzdHJpbmd9XG4gICAgICovXG4gICAgcmV0dXJuIGZ1bmN0aW9uIChlbGVtZW50LCBwcm9wZXJ0eSkge1xuICAgICAgICBpZiAoISgnY3VycmVudFN0eWxlJyBpbiBlbGVtZW50KSAmJiAhKCdnZXRDb21wdXRlZFN0eWxlJyBpbiBnbG9iYWwpKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChlbGVtZW50LmN1cnJlbnRTdHlsZSkge1xuICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnQuY3VycmVudFN0eWxlW3Byb3BlcnR5XTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBnbG9iYWwuZG9jdW1lbnQuZGVmYXVsdFZpZXcuZ2V0Q29tcHV0ZWRTdHlsZShlbGVtZW50LCBudWxsKS5nZXRQcm9wZXJ0eVZhbHVlKHByb3BlcnR5KTtcbiAgICB9O1xufSkodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgPyB3aW5kb3cgOiB0aGlzKTtcblxubW9kdWxlLmV4cG9ydHMgPSBnZXRTdHlsZTtcbiIsInZhciBwb2x5ZmlsbCA9IChmdW5jdGlvbiAoZ2xvYmFsKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgLyoqXG4gICAgICogQHNlZSBodHRwczovL2dpc3QuZ2l0aHViLmNvbS9tcmRvb2IvODM4Nzg1XG4gICAgICovXG4gICAgZnVuY3Rpb24gcG9seWZpbGxSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgKCkge1xuICAgICAgICBpZiAoIWdsb2JhbC5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUpIHtcbiAgICAgICAgICAgIGdsb2JhbC5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBnbG9iYWwud2Via2l0UmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8XG4gICAgICAgICAgICAgICAgICAgIGdsb2JhbC5tb3pSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHxcbiAgICAgICAgICAgICAgICAgICAgZ2xvYmFsLm9SZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHxcbiAgICAgICAgICAgICAgICAgICAgZ2xvYmFsLm1zUmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8XG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uIChjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZ2xvYmFsLnNldFRpbWVvdXQoY2FsbGJhY2ssIDEwMDAgLyA2MCk7XG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9KSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFnbG9iYWwuY2FuY2VsQW5pbWF0aW9uRnJhbWUpIHtcbiAgICAgICAgICAgIGdsb2JhbC5jYW5jZWxBbmltYXRpb25GcmFtZSA9IChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGdsb2JhbC53ZWJraXRDYW5jZWxBbmltYXRpb25GcmFtZSB8fFxuICAgICAgICAgICAgICAgICAgICBnbG9iYWwubW96Q2FuY2VsQW5pbWF0aW9uRnJhbWUgfHxcbiAgICAgICAgICAgICAgICAgICAgZ2xvYmFsLm9DYW5jZWxBbmltYXRpb25GcmFtZSB8fFxuICAgICAgICAgICAgICAgICAgICBnbG9iYWwubXNDYW5jZWxBbmltYXRpb25GcmFtZSB8fFxuICAgICAgICAgICAgICAgICAgICBnbG9iYWwuY2xlYXJUaW1lb3V0O1xuICAgICAgICAgICAgfSkoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZTogcG9seWZpbGxSZXF1ZXN0QW5pbWF0aW9uRnJhbWVcbiAgICB9O1xufSkodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgPyB3aW5kb3cgOiB0aGlzKTtcblxubW9kdWxlLmV4cG9ydHMgPSBwb2x5ZmlsbDtcbiIsInZhciByZXNpemVTZW5zb3JGYWN0b3J5ID0gKGZ1bmN0aW9uIChnbG9iYWwpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICAvKiogQHZhciB7RnVuY3Rpb259ICovXG4gICAgdmFyIGdldFN0eWxlID0gcmVxdWlyZSgnLi9nZXRTdHlsZScpO1xuICAgIC8qKiBAdmFyIHtPYmplY3R9ICovXG4gICAgdmFyIGNzcyA9IHJlcXVpcmUoJy4vY3NzJyk7XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSB0YXJnZXRFbGVtZW50XG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2tcbiAgICAgKiBAY29uc3RydWN0b3JcbiAgICAgKi9cbiAgICB2YXIgcmVzaXplU2Vuc29yID0gZnVuY3Rpb24gKHRhcmdldEVsZW1lbnQsIGNhbGxiYWNrKSB7XG4gICAgICAgIC8qKiBAdmFyIHtIVE1MRWxlbWVudH0gKi9cbiAgICAgICAgdGhpcy50YXJnZXRFbGVtZW50ID0gdGFyZ2V0RWxlbWVudDtcbiAgICAgICAgLyoqIEB2YXIge0Z1bmN0aW9ufSAqL1xuICAgICAgICB0aGlzLmNhbGxiYWNrID0gY2FsbGJhY2s7XG4gICAgICAgIC8qKiBAdmFyIHt7d2lkdGg6IGludCwgaGVpZ2h0OiBpbnR9fSAqL1xuICAgICAgICB0aGlzLmRpbWVuc2lvbnMgPSB7XG4gICAgICAgICAgICB3aWR0aDogMCxcbiAgICAgICAgICAgIGhlaWdodDogMFxuICAgICAgICB9O1xuXG4gICAgICAgIGlmICgnYXR0YWNoRXZlbnQnIGluIGdsb2JhbC5kb2N1bWVudCkge1xuICAgICAgICAgICAgdGhpcy5ib3VuZE9uUmVzaXplSGFuZGxlciA9IHRoaXMub25FbGVtZW50UmVzaXplLmJpbmQodGhpcyk7XG4gICAgICAgICAgICB0aGlzLnRhcmdldEVsZW1lbnQuYXR0YWNoRXZlbnQoJ29ucmVzaXplJywgdGhpcy5ib3VuZE9uUmVzaXplSGFuZGxlcik7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvKiogQHZhciB7e2NvbnRhaW5lcjogSFRNTEVsZW1lbnQsIGV4cGFuZDogSFRNTEVsZW1lbnQsIGV4cGFuZENoaWxkOiBIVE1MRWxlbWVudCwgY29udHJhY3Q6IEhUTUxFbGVtZW50fX0gKi9cbiAgICAgICAgdGhpcy50cmlnZ2VyRWxlbWVudHMgPSB7fTtcbiAgICAgICAgLyoqIEB2YXIge2ludH0gKi9cbiAgICAgICAgdGhpcy5yZXNpemVSQUYgPSAwO1xuXG4gICAgICAgIHRoaXMuc2V0dXAoKTtcbiAgICB9O1xuXG4gICAgcmVzaXplU2Vuc29yLnByb3RvdHlwZS5zZXR1cCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy8gTWFrZSBzdXJlIHRoZSB0YXJnZXQgZWxlbWVudCBpcyBcInBvc2l0aW9uZWRcIlxuICAgICAgICBpZiAoZ2V0U3R5bGUodGhpcy50YXJnZXRFbGVtZW50LCAncG9zaXRpb24nKSA9PT0gJ3N0YXRpYycpIHtcbiAgICAgICAgICAgIHRoaXMudGFyZ2V0RWxlbWVudC5zdHlsZS5wb3NpdGlvbiA9ICdyZWxhdGl2ZSc7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDcmVhdGUgYW5kIGFwcGVuZCByZXNpemUgdHJpZ2dlciBlbGVtZW50c1xuICAgICAgICB0aGlzLmluc2VydFJlc2l6ZVRyaWdnZXJFbGVtZW50cygpO1xuXG4gICAgICAgIC8vIFN0YXJ0IGxpc3RlbmluZyB0byBldmVudHNcbiAgICAgICAgdGhpcy5ib3VuZFNjcm9sbExpc3RlbmVyID0gdGhpcy5oYW5kbGVFbGVtZW50U2Nyb2xsLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMudGFyZ2V0RWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdzY3JvbGwnLCB0aGlzLmJvdW5kU2Nyb2xsTGlzdGVuZXIsIHRydWUpO1xuXG4gICAgICAgIGlmIChjc3MuaXNBbmltYXRpb25TdXBwb3J0ZWQoKSkge1xuICAgICAgICAgICAgdGhpcy5ib3VuZEFuaW1hdGlvblN0YXJ0TGlzdGVuZXIgPSB0aGlzLnJlc2V0VHJpZ2dlcnNPbkFuaW1hdGlvblN0YXJ0LmJpbmQodGhpcyk7XG4gICAgICAgICAgICB0aGlzLnRyaWdnZXJFbGVtZW50cy5jb250YWluZXIuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgICAgICAgICAgICBjc3MuZ2V0QW5pbWF0aW9uUHJvcGVydGllc0ZvckJyb3dzZXIoKS5hbmltYXRpb25TdGFydEV2ZW50LFxuICAgICAgICAgICAgICAgIHRoaXMuYm91bmRBbmltYXRpb25TdGFydExpc3RlbmVyXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gSW5pdGlhbCB2YWx1ZSByZXNldCBvZiBhbGwgdHJpZ2dlcnNcbiAgICAgICAgdGhpcy5yZXNldFRyaWdnZXJzKCk7XG4gICAgfTtcblxuICAgIHJlc2l6ZVNlbnNvci5wcm90b3R5cGUuaW5zZXJ0UmVzaXplVHJpZ2dlckVsZW1lbnRzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgcmVzaXplVHJpZ2dlciA9IGdsb2JhbC5kb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgdmFyIGV4cGFuZFRyaWdnZXIgPSBnbG9iYWwuZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIHZhciBleHBhbmRUcmlnZ2VyQ2hpbGQgPSBnbG9iYWwuZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIHZhciBjb250cmFjdFRyaWdnZXIgPSBnbG9iYWwuZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG5cbiAgICAgICAgcmVzaXplVHJpZ2dlci5jbGFzc05hbWUgPSAnUmVzaXplU2Vuc29yIFJlc2l6ZVNlbnNvcl9fcmVzaXplVHJpZ2dlcnMnO1xuICAgICAgICBleHBhbmRUcmlnZ2VyLmNsYXNzTmFtZSA9ICdSZXNpemVTZW5zb3JfX2V4cGFuZFRyaWdnZXInO1xuICAgICAgICBjb250cmFjdFRyaWdnZXIuY2xhc3NOYW1lID0gJ1Jlc2l6ZVNlbnNvcl9fY29udHJhY3RUcmlnZ2VyJztcblxuICAgICAgICBleHBhbmRUcmlnZ2VyLmFwcGVuZENoaWxkKGV4cGFuZFRyaWdnZXJDaGlsZCk7XG4gICAgICAgIHJlc2l6ZVRyaWdnZXIuYXBwZW5kQ2hpbGQoZXhwYW5kVHJpZ2dlcik7XG4gICAgICAgIHJlc2l6ZVRyaWdnZXIuYXBwZW5kQ2hpbGQoY29udHJhY3RUcmlnZ2VyKTtcblxuICAgICAgICB0aGlzLnRyaWdnZXJFbGVtZW50cy5jb250YWluZXIgPSByZXNpemVUcmlnZ2VyO1xuICAgICAgICB0aGlzLnRyaWdnZXJFbGVtZW50cy5leHBhbmQgPSBleHBhbmRUcmlnZ2VyO1xuICAgICAgICB0aGlzLnRyaWdnZXJFbGVtZW50cy5leHBhbmRDaGlsZCA9IGV4cGFuZFRyaWdnZXJDaGlsZDtcbiAgICAgICAgdGhpcy50cmlnZ2VyRWxlbWVudHMuY29udHJhY3QgPSBjb250cmFjdFRyaWdnZXI7XG5cbiAgICAgICAgdGhpcy50YXJnZXRFbGVtZW50LmFwcGVuZENoaWxkKHJlc2l6ZVRyaWdnZXIpO1xuICAgIH07XG5cbiAgICByZXNpemVTZW5zb3IucHJvdG90eXBlLm9uRWxlbWVudFJlc2l6ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGN1cnJlbnREaW1lbnNpb25zID0gdGhpcy5nZXREaW1lbnNpb25zKCk7XG5cbiAgICAgICAgaWYgKHRoaXMuaXNSZXNpemVkKGN1cnJlbnREaW1lbnNpb25zKSkge1xuICAgICAgICAgICAgdGhpcy5kaW1lbnNpb25zLndpZHRoID0gY3VycmVudERpbWVuc2lvbnMud2lkdGg7XG4gICAgICAgICAgICB0aGlzLmRpbWVuc2lvbnMuaGVpZ2h0ID0gY3VycmVudERpbWVuc2lvbnMuaGVpZ2h0O1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50UmVzaXplZCgpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHJlc2l6ZVNlbnNvci5wcm90b3R5cGUuaGFuZGxlRWxlbWVudFNjcm9sbCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgICB0aGlzLnJlc2V0VHJpZ2dlcnMoKTtcblxuICAgICAgICBpZiAodGhpcy5yZXNpemVSQUYpIHtcbiAgICAgICAgICAgIGdsb2JhbC5jYW5jZWxBbmltYXRpb25GcmFtZSh0aGlzLnJlc2l6ZVJBRik7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnJlc2l6ZVJBRiA9IGdsb2JhbC5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGN1cnJlbnREaW1lbnNpb25zID0gX3RoaXMuZ2V0RGltZW5zaW9ucygpO1xuICAgICAgICAgICAgaWYgKF90aGlzLmlzUmVzaXplZChjdXJyZW50RGltZW5zaW9ucykpIHtcbiAgICAgICAgICAgICAgICBfdGhpcy5kaW1lbnNpb25zLndpZHRoID0gY3VycmVudERpbWVuc2lvbnMud2lkdGg7XG4gICAgICAgICAgICAgICAgX3RoaXMuZGltZW5zaW9ucy5oZWlnaHQgPSBjdXJyZW50RGltZW5zaW9ucy5oZWlnaHQ7XG4gICAgICAgICAgICAgICAgX3RoaXMuZWxlbWVudFJlc2l6ZWQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7e3dpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfX0gY3VycmVudERpbWVuc2lvbnNcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICAgKi9cbiAgICByZXNpemVTZW5zb3IucHJvdG90eXBlLmlzUmVzaXplZCA9IGZ1bmN0aW9uIChjdXJyZW50RGltZW5zaW9ucykge1xuICAgICAgICByZXR1cm4gKGN1cnJlbnREaW1lbnNpb25zLndpZHRoICE9PSB0aGlzLmRpbWVuc2lvbnMud2lkdGggfHwgY3VycmVudERpbWVuc2lvbnMuaGVpZ2h0ICE9PSB0aGlzLmRpbWVuc2lvbnMuaGVpZ2h0KTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQHJldHVybnMge3t3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn19XG4gICAgICovXG4gICAgcmVzaXplU2Vuc29yLnByb3RvdHlwZS5nZXREaW1lbnNpb25zID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgd2lkdGg6IHRoaXMudGFyZ2V0RWxlbWVudC5vZmZzZXRXaWR0aCxcbiAgICAgICAgICAgIGhlaWdodDogdGhpcy50YXJnZXRFbGVtZW50Lm9mZnNldEhlaWdodFxuICAgICAgICB9O1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge0V2ZW50fSBldmVudFxuICAgICAqL1xuICAgIHJlc2l6ZVNlbnNvci5wcm90b3R5cGUucmVzZXRUcmlnZ2Vyc09uQW5pbWF0aW9uU3RhcnQgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgaWYgKGV2ZW50LmFuaW1hdGlvbk5hbWUgPT09IGNzcy5nZXRBbmltYXRpb25Qcm9wZXJ0aWVzRm9yQnJvd3NlcigpLmFuaW1hdGlvbk5hbWUpIHtcbiAgICAgICAgICAgIHRoaXMucmVzZXRUcmlnZ2VycygpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHJlc2l6ZVNlbnNvci5wcm90b3R5cGUucmVzZXRUcmlnZ2VycyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy50cmlnZ2VyRWxlbWVudHMuY29udHJhY3Quc2Nyb2xsTGVmdCA9IHRoaXMudHJpZ2dlckVsZW1lbnRzLmNvbnRyYWN0LnNjcm9sbFdpZHRoO1xuICAgICAgICB0aGlzLnRyaWdnZXJFbGVtZW50cy5jb250cmFjdC5zY3JvbGxUb3AgPSB0aGlzLnRyaWdnZXJFbGVtZW50cy5jb250cmFjdC5zY3JvbGxIZWlnaHQ7XG4gICAgICAgIHRoaXMudHJpZ2dlckVsZW1lbnRzLmV4cGFuZENoaWxkLnN0eWxlLndpZHRoID0gdGhpcy50cmlnZ2VyRWxlbWVudHMuZXhwYW5kLm9mZnNldFdpZHRoICsgMSArICdweCc7XG4gICAgICAgIHRoaXMudHJpZ2dlckVsZW1lbnRzLmV4cGFuZENoaWxkLnN0eWxlLmhlaWdodCA9IHRoaXMudHJpZ2dlckVsZW1lbnRzLmV4cGFuZC5vZmZzZXRIZWlnaHQgKyAxICsgJ3B4JztcbiAgICAgICAgdGhpcy50cmlnZ2VyRWxlbWVudHMuZXhwYW5kLnNjcm9sbExlZnQgPSB0aGlzLnRyaWdnZXJFbGVtZW50cy5leHBhbmQuc2Nyb2xsV2lkdGg7XG4gICAgICAgIHRoaXMudHJpZ2dlckVsZW1lbnRzLmV4cGFuZC5zY3JvbGxUb3AgPSB0aGlzLnRyaWdnZXJFbGVtZW50cy5leHBhbmQuc2Nyb2xsSGVpZ2h0O1xuICAgIH07XG5cbiAgICByZXNpemVTZW5zb3IucHJvdG90eXBlLmVsZW1lbnRSZXNpemVkID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmNhbGxiYWNrKHRoaXMuZGltZW5zaW9ucyk7XG4gICAgfTtcblxuICAgIHJlc2l6ZVNlbnNvci5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5yZW1vdmVFdmVudExpc3RlbmVycygpO1xuICAgICAgICB0aGlzLnRhcmdldEVsZW1lbnQucmVtb3ZlQ2hpbGQodGhpcy50cmlnZ2VyRWxlbWVudHMuY29udGFpbmVyKTtcbiAgICAgICAgZGVsZXRlIHRoaXMuYm91bmRBbmltYXRpb25TdGFydExpc3RlbmVyO1xuICAgICAgICBkZWxldGUgdGhpcy5ib3VuZFNjcm9sbExpc3RlbmVyO1xuICAgICAgICBkZWxldGUgdGhpcy5jYWxsYmFjaztcbiAgICAgICAgZGVsZXRlIHRoaXMudGFyZ2V0RWxlbWVudDtcbiAgICB9O1xuXG4gICAgcmVzaXplU2Vuc29yLnByb3RvdHlwZS5yZW1vdmVFdmVudExpc3RlbmVycyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKCdhdHRhY2hFdmVudCcgaW4gZ2xvYmFsLmRvY3VtZW50KSB7XG4gICAgICAgICAgICB0aGlzLnRhcmdldEVsZW1lbnQuZGV0YWNoRXZlbnQoJ29ucmVzaXplJywgdGhpcy5ib3VuZE9uUmVzaXplSGFuZGxlcik7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnRyaWdnZXJFbGVtZW50cy5jb250YWluZXIucmVtb3ZlRXZlbnRMaXN0ZW5lcihcbiAgICAgICAgICAgIGNzcy5nZXRBbmltYXRpb25Qcm9wZXJ0aWVzRm9yQnJvd3NlcigpLmFuaW1hdGlvblN0YXJ0RXZlbnQsXG4gICAgICAgICAgICB0aGlzLmJvdW5kQW5pbWF0aW9uU3RhcnRMaXN0ZW5lclxuICAgICAgICApO1xuICAgICAgICB0aGlzLnRhcmdldEVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgdGhpcy5ib3VuZFNjcm9sbExpc3RlbmVyLCB0cnVlKTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwYXJhbSB7RWxlbWVudH0gdGFyZ2V0RWxlbWVudFxuICAgICAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFja1xuICAgICAgICAgKiBAcmV0dXJucyB7cmVzaXplU2Vuc29yfVxuICAgICAgICAgKi9cbiAgICAgICAgY3JlYXRlOiBmdW5jdGlvbiAodGFyZ2V0RWxlbWVudCwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgcmVzaXplU2Vuc29yKHRhcmdldEVsZW1lbnQsIGNhbGxiYWNrKTtcbiAgICAgICAgfVxuICAgIH07XG59KSh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyA/IHdpbmRvdyA6IHRoaXMpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHJlc2l6ZVNlbnNvckZhY3Rvcnk7XG4iLCJ2YXIgc2Vuc29ycyA9IChmdW5jdGlvbiAoZ2xvYmFsKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgLyoqIEB2YXIge09iamVjdH0gKi9cbiAgICB2YXIgY3NzID0gcmVxdWlyZSgnLi9jc3MnKTtcbiAgICAvKiogQHZhciB7T2JqZWN0fSAqL1xuICAgIHZhciBwb2x5ZmlsbCA9IHJlcXVpcmUoJy4vcG9seWZpbGwnKTtcbiAgICAvKiogQHZhciB7T2JqZWN0fSAqL1xuICAgIHZhciByZXNpemVTZW5zb3JGYWN0b3J5ID0gcmVxdWlyZSgnLi9yZXNpemVTZW5zb3InKTtcblxuICAgIC8qKiB7YXJyYXl9ICovXG4gICAgdmFyIHVuc3VpdGFibGVFbGVtZW50cyA9IFsnSU1HJywgJ0NPTCcsICdUUicsICdUSEVBRCcsICdURk9PVCddO1xuICAgIC8qKiB7Ym9vbGVhbn0gKi9cbiAgICB2YXIgc3VwcG9ydHNBdHRhY2hFdmVudCA9ICgnYXR0YWNoRXZlbnQnIGluIGdsb2JhbC5kb2N1bWVudCk7XG5cbiAgICAvKioge3t9fSBNYXAgb2YgYWxsIHJlc2l6ZSBzZW5zb3JzIChpZCA9PiBSZXNpemVTZW5zb3IpICovXG4gICAgdmFyIGFsbFJlc2l6ZVNlbnNvcnMgPSB7fTtcblxuICAgIGlmICghc3VwcG9ydHNBdHRhY2hFdmVudCkge1xuICAgICAgICBjc3MuaW5zZXJ0UmVzaXplU2Vuc29yU3R5bGVzKCk7XG5cbiAgICAgICAgaWYgKCEoJ3JlcXVlc3RBbmltYXRpb25GcmFtZScgaW4gZ2xvYmFsKSB8fCAhKCdjYW5jZWxBbmltYXRpb25GcmFtZScgaW4gZ2xvYmFsKSkge1xuICAgICAgICAgICAgcG9seWZpbGwucmVxdWVzdEFuaW1hdGlvbkZyYW1lKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge0VsZW1lbnR9IHRhcmdldEVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFja1xuICAgICAqIEByZXR1cm5zIHtyZXNpemVTZW5zb3J9XG4gICAgICovXG4gICAgZnVuY3Rpb24gY3JlYXRlICh0YXJnZXRFbGVtZW50LCBjYWxsYmFjaykge1xuICAgICAgICBpZiAoaXNVbnN1aXRhYmxlRWxlbWVudCh0YXJnZXRFbGVtZW50KSkge1xuICAgICAgICAgICAgY29uc29sZSAmJiBjb25zb2xlLmVycm9yKFwiR2l2ZW4gZWxlbWVudCBpc24ndCBzdWl0YWJsZSB0byBhY3QgYXMgYSByZXNpemUgc2Vuc29yLiBUcnkgd3JhcHBpbmcgaXQgd2l0aCBvbmUgdGhhdCBpcy4gVW5zdWl0YWJsZSBlbGVtZW50cyBhcmU6XCIsIHVuc3VpdGFibGVFbGVtZW50cyk7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBzZW5zb3JJZCA9IGdldFNlbnNvcklkKHRhcmdldEVsZW1lbnQpO1xuXG4gICAgICAgIGlmIChhbGxSZXNpemVTZW5zb3JzW3NlbnNvcklkXSkge1xuICAgICAgICAgICAgcmV0dXJuIGFsbFJlc2l6ZVNlbnNvcnNbc2Vuc29ySWRdO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHNlbnNvciA9IHJlc2l6ZVNlbnNvckZhY3RvcnkuY3JlYXRlKHRhcmdldEVsZW1lbnQsIGNhbGxiYWNrKTtcbiAgICAgICAgYWxsUmVzaXplU2Vuc29yc1tzZW5zb3JJZF0gPSBzZW5zb3I7XG4gICAgICAgIHJldHVybiBzZW5zb3I7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtFbGVtZW50fSB0YXJnZXRFbGVtZW50XG4gICAgICovXG4gICAgZnVuY3Rpb24gZGVzdHJveSAodGFyZ2V0RWxlbWVudCkge1xuICAgICAgICB2YXIgc2Vuc29ySWQgPSBnZXRTZW5zb3JJZCh0YXJnZXRFbGVtZW50KTtcbiAgICAgICAgdmFyIHNlbnNvciA9IGFsbFJlc2l6ZVNlbnNvcnNbc2Vuc29ySWRdO1xuXG4gICAgICAgIGlmICghc2Vuc29yKSB7XG4gICAgICAgICAgICBjb25zb2xlICYmIGNvbnNvbGUuZXJyb3IoXCJDYW4ndCBkZXN0cm95IFJlc2l6ZVNlbnNvciAoNDA0IG5vdCBmb3VuZCkuXCIsIHRhcmdldEVsZW1lbnQpO1xuICAgICAgICB9XG5cbiAgICAgICAgc2Vuc29yLmRlc3Ryb3koKTtcbiAgICAgICAgZGVsZXRlIGFsbFJlc2l6ZVNlbnNvcnNbc2Vuc29ySWRdO1xuICAgIH1cbiAgICBcbiAgICBmdW5jdGlvbiBjbGVhciAoKSB7XG4gICAgICAgIGFsbFJlc2l6ZVNlbnNvcnMgPSB7fTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge0VsZW1lbnR9IHRhcmdldEVsZW1lbnRcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGdldFNlbnNvcklkICh0YXJnZXRFbGVtZW50KSB7XG4gICAgICAgIHJldHVybiB0YXJnZXRFbGVtZW50LmlkO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IHRhcmdldEVsZW1lbnRcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBpc1Vuc3VpdGFibGVFbGVtZW50ICh0YXJnZXRFbGVtZW50KSB7XG4gICAgICAgIHZhciB0YWdOYW1lID0gdGFyZ2V0RWxlbWVudC50YWdOYW1lLnRvVXBwZXJDYXNlKCk7XG4gICAgICAgIHJldHVybiAodW5zdWl0YWJsZUVsZW1lbnRzLmluZGV4T2YodGFnTmFtZSkgPiAtMSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgY3JlYXRlOiBjcmVhdGUsXG4gICAgICAgIGRlc3Ryb3k6IGRlc3Ryb3ksXG4gICAgICAgIGNsZWFyOiBjbGVhclxuICAgIH07XG59KSh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyA/IHdpbmRvdyA6IHRoaXMpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHNlbnNvcnM7XG4iXX0=
