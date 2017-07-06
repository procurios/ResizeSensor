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
    };
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvY3NzLmpzIiwic3JjL2dldFN0eWxlLmpzIiwic3JjL3BvbHlmaWxsLmpzIiwic3JjL3Jlc2l6ZVNlbnNvci5qcyIsInNyYy9zZW5zb3JzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgY3NzID0gKGZ1bmN0aW9uICgpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICAvKiogQHZhciB7bnVsbHxPYmplY3R9ICovXG4gICAgdmFyIGFuaW1hdGlvblByb3BlcnRpZXNGb3JCcm93c2VyID0gbnVsbDtcbiAgICAvKiogQHZhciB7bnVsbHxib29sZWFufSAqL1xuICAgIHZhciBpc0Nzc0FuaW1hdGlvblN1cHBvcnRlZCA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBEZXRlcm1pbmVzIHdoaWNoIHN0eWxlIGNvbnZlbnRpb24gKHByb3BlcnRpZXMpIHRvIGZvbGxvd1xuICAgICAqIEBzZWUgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvR3VpZGUvQ1NTL1VzaW5nX0NTU19hbmltYXRpb25zL0RldGVjdGluZ19DU1NfYW5pbWF0aW9uX3N1cHBvcnRcbiAgICAgKiBAcmV0dXJucyB7e2tleWZyYW1lc1J1bGU6IHN0cmluZywgc3R5bGVEZWNsYXJhdGlvbjogc3RyaW5nLCBhbmltYXRpb25TdGFydEV2ZW50OiBzdHJpbmcsIGFuaW1hdGlvbk5hbWU6IHN0cmluZ319XG4gICAgICovXG4gICAgZnVuY3Rpb24gZ2V0QW5pbWF0aW9uUHJvcGVydGllc0ZvckJyb3dzZXIgKCkge1xuICAgICAgICBpZiAoYW5pbWF0aW9uUHJvcGVydGllc0ZvckJyb3dzZXIgIT09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiBhbmltYXRpb25Qcm9wZXJ0aWVzRm9yQnJvd3NlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciB0ZXN0RWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICB2YXIgc3VwcG9ydHNVbnByZWZpeGVkQW5pbWF0aW9uUHJvcGVydGllcyA9ICgnYW5pbWF0aW9uTmFtZScgaW4gdGVzdEVsZW1lbnQuc3R5bGUpO1xuXG4gICAgICAgIC8vIFVucHJlZml4ZWQgYW5pbWF0aW9uIHByb3BlcnRpZXNcbiAgICAgICAgdmFyIGFuaW1hdGlvblN0YXJ0RXZlbnQgPSAnYW5pbWF0aW9uc3RhcnQnO1xuICAgICAgICB2YXIgYW5pbWF0aW9uTmFtZSA9ICdyZXNpemVhbmltJztcblxuICAgICAgICBpZiAoc3VwcG9ydHNVbnByZWZpeGVkQW5pbWF0aW9uUHJvcGVydGllcykge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBrZXlmcmFtZXNSdWxlOiAnQGtleWZyYW1lcyAnICsgYW5pbWF0aW9uTmFtZSArICcge2Zyb20geyBvcGFjaXR5OiAwOyB9IHRvIHsgb3BhY2l0eTogMDsgfX0nLFxuICAgICAgICAgICAgICAgIHN0eWxlRGVjbGFyYXRpb246ICdhbmltYXRpb246IDFtcyAnICsgYW5pbWF0aW9uTmFtZSArICc7JyxcbiAgICAgICAgICAgICAgICBhbmltYXRpb25TdGFydEV2ZW50OiBhbmltYXRpb25TdGFydEV2ZW50LFxuICAgICAgICAgICAgICAgIGFuaW1hdGlvbk5hbWU6IGFuaW1hdGlvbk5hbWVcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICAvLyBCcm93c2VyIHNwZWNpZmljIGFuaW1hdGlvbiBwcm9wZXJ0aWVzXG4gICAgICAgIHZhciBrZXlmcmFtZVByZWZpeCA9ICcnO1xuICAgICAgICB2YXIgYnJvd3NlclByZWZpeGVzID0gJ1dlYmtpdCBNb3ogTyBtcycuc3BsaXQoJyAnKTtcbiAgICAgICAgdmFyIHN0YXJ0RXZlbnRzID0gJ3dlYmtpdEFuaW1hdGlvblN0YXJ0IGFuaW1hdGlvbnN0YXJ0IG9BbmltYXRpb25TdGFydCBNU0FuaW1hdGlvblN0YXJ0Jy5zcGxpdCgnICcpO1xuXG4gICAgICAgIHZhciBpO1xuICAgICAgICB2YXIgbCA9IGJyb3dzZXJQcmVmaXhlcy5sZW5ndGg7XG5cbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgICAgaWYgKChicm93c2VyUHJlZml4ZXNbaV0gKyAnQW5pbWF0aW9uTmFtZScpIGluIHRlc3RFbGVtZW50LnN0eWxlKSB7XG4gICAgICAgICAgICAgICAga2V5ZnJhbWVQcmVmaXggPSAnLScgKyBicm93c2VyUHJlZml4ZXNbaV0udG9Mb3dlckNhc2UoKSArICctJztcbiAgICAgICAgICAgICAgICBhbmltYXRpb25TdGFydEV2ZW50ID0gc3RhcnRFdmVudHNbaV07XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBhbmltYXRpb25Qcm9wZXJ0aWVzRm9yQnJvd3NlciA9IHtcbiAgICAgICAgICAgIGtleWZyYW1lc1J1bGU6ICdAJyArIGtleWZyYW1lUHJlZml4ICsgJ2tleWZyYW1lcyAnICsgYW5pbWF0aW9uTmFtZSArICcge2Zyb20geyBvcGFjaXR5OiAwOyB9IHRvIHsgb3BhY2l0eTogMDsgfX0nLFxuICAgICAgICAgICAgc3R5bGVEZWNsYXJhdGlvbjoga2V5ZnJhbWVQcmVmaXggKyAnYW5pbWF0aW9uOiAxbXMgJyArIGFuaW1hdGlvbk5hbWUgKyAnOycsXG4gICAgICAgICAgICBhbmltYXRpb25TdGFydEV2ZW50OiBhbmltYXRpb25TdGFydEV2ZW50LFxuICAgICAgICAgICAgYW5pbWF0aW9uTmFtZTogYW5pbWF0aW9uTmFtZVxuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiBhbmltYXRpb25Qcm9wZXJ0aWVzRm9yQnJvd3NlcjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBpc0NTU0FuaW1hdGlvblN1cHBvcnRlZCAoKSB7XG4gICAgICAgIGlmIChpc0Nzc0FuaW1hdGlvblN1cHBvcnRlZCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuIGlzQ3NzQW5pbWF0aW9uU3VwcG9ydGVkO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHRlc3RFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIHZhciBpc0FuaW1hdGlvblN1cHBvcnRlZCA9ICgnYW5pbWF0aW9uTmFtZScgaW4gdGVzdEVsZW1lbnQuc3R5bGUpO1xuXG4gICAgICAgIGlmIChpc0FuaW1hdGlvblN1cHBvcnRlZCkge1xuICAgICAgICAgICAgaXNDc3NBbmltYXRpb25TdXBwb3J0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgcmV0dXJuIGlzQ3NzQW5pbWF0aW9uU3VwcG9ydGVkO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGJyb3dzZXJQcmVmaXhlcyA9ICdXZWJraXQgTW96IE8gbXMnLnNwbGl0KCcgJyk7XG4gICAgICAgIHZhciBpID0gMDtcbiAgICAgICAgdmFyIGwgPSBicm93c2VyUHJlZml4ZXMubGVuZ3RoO1xuXG4gICAgICAgIGZvciAoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoKGJyb3dzZXJQcmVmaXhlc1tpXSArICdBbmltYXRpb25OYW1lJykgaW4gdGVzdEVsZW1lbnQuc3R5bGUpIHtcbiAgICAgICAgICAgICAgICBpc0Nzc0FuaW1hdGlvblN1cHBvcnRlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGlzQ3NzQW5pbWF0aW9uU3VwcG9ydGVkO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaXNDc3NBbmltYXRpb25TdXBwb3J0ZWQgPSBmYWxzZTtcbiAgICAgICAgcmV0dXJuIGlzQ3NzQW5pbWF0aW9uU3VwcG9ydGVkO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFkZHMgYSBzdHlsZSBibG9jayB0aGF0IGNvbnRhaW5zIENTUyBlc3NlbnRpYWwgZm9yIGRldGVjdGluZyByZXNpemUgZXZlbnRzXG4gICAgICovXG4gICAgZnVuY3Rpb24gaW5zZXJ0UmVzaXplU2Vuc29yU3R5bGVzICgpIHtcbiAgICAgICAgdmFyIGNzc1J1bGVzID0gW1xuICAgICAgICAgICAgKGdldEFuaW1hdGlvblByb3BlcnRpZXNGb3JCcm93c2VyKCkua2V5ZnJhbWVzUnVsZSkgPyBnZXRBbmltYXRpb25Qcm9wZXJ0aWVzRm9yQnJvd3NlcigpLmtleWZyYW1lc1J1bGUgOiAnJyxcbiAgICAgICAgICAgICcuUmVzaXplU2Vuc29yX19yZXNpemVUcmlnZ2VycyB7ICcgKyAoKGdldEFuaW1hdGlvblByb3BlcnRpZXNGb3JCcm93c2VyKCkuc3R5bGVEZWNsYXJhdGlvbikgPyBnZXRBbmltYXRpb25Qcm9wZXJ0aWVzRm9yQnJvd3NlcigpLnN0eWxlRGVjbGFyYXRpb24gOiAnJykgKyAnIHZpc2liaWxpdHk6IGhpZGRlbjsgb3BhY2l0eTogMDsgfScsXG4gICAgICAgICAgICAnLlJlc2l6ZVNlbnNvcl9fcmVzaXplVHJpZ2dlcnMsIC5SZXNpemVTZW5zb3JfX3Jlc2l6ZVRyaWdnZXJzID4gZGl2LCAuUmVzaXplU2Vuc29yX19jb250cmFjdFRyaWdnZXI6YmVmb3JlIHsgY29udGVudDogXFwnIFxcJzsgZGlzcGxheTogYmxvY2s7IHBvc2l0aW9uOiBhYnNvbHV0ZTsgdG9wOiAwOyBsZWZ0OiAwOyBoZWlnaHQ6IDEwMCU7IHdpZHRoOiAxMDAlOyBvdmVyZmxvdzogaGlkZGVuOyB9IC5SZXNpemVTZW5zb3JfX3Jlc2l6ZVRyaWdnZXJzID4gZGl2IHsgYmFja2dyb3VuZDogI2VlZTsgb3ZlcmZsb3c6IGF1dG87IH0gLlJlc2l6ZVNlbnNvcl9fY29udHJhY3RUcmlnZ2VyOmJlZm9yZSB7IHdpZHRoOiAyMDAlOyBoZWlnaHQ6IDIwMCU7IH0nXG4gICAgICAgIF07XG5cbiAgICAgICAgY3NzUnVsZXMgPSBjc3NSdWxlcy5qb2luKCcgJyk7XG5cbiAgICAgICAgdmFyIGhlYWRFbGVtID0gZG9jdW1lbnQuaGVhZCB8fCBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaGVhZCcpWzBdO1xuXG4gICAgICAgIHZhciBzdHlsZUVsZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpO1xuICAgICAgICBzdHlsZUVsZW0udHlwZSA9ICd0ZXh0L2Nzcyc7XG5cbiAgICAgICAgaWYgKHN0eWxlRWxlbS5zdHlsZVNoZWV0KSB7XG4gICAgICAgICAgICBzdHlsZUVsZW0uc3R5bGVTaGVldC5jc3NUZXh0ID0gY3NzUnVsZXM7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzdHlsZUVsZW0uYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoY3NzUnVsZXMpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGhlYWRFbGVtLmFwcGVuZENoaWxkKHN0eWxlRWxlbSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgaW5zZXJ0UmVzaXplU2Vuc29yU3R5bGVzOiBpbnNlcnRSZXNpemVTZW5zb3JTdHlsZXMsXG4gICAgICAgIGlzQW5pbWF0aW9uU3VwcG9ydGVkOiBpc0NTU0FuaW1hdGlvblN1cHBvcnRlZCxcbiAgICAgICAgZ2V0QW5pbWF0aW9uUHJvcGVydGllc0ZvckJyb3dzZXI6IGdldEFuaW1hdGlvblByb3BlcnRpZXNGb3JCcm93c2VyXG4gICAgfTtcbn0pKCk7XG5cbm1vZHVsZS5leHBvcnRzID0gY3NzO1xuIiwidmFyIGdldFN0eWxlID0gKGZ1bmN0aW9uIChnbG9iYWwpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50XG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHByb3BlcnR5XG4gICAgICogQHJldHVybnMge251bGx8c3RyaW5nfVxuICAgICAqL1xuICAgIHJldHVybiBmdW5jdGlvbiAoZWxlbWVudCwgcHJvcGVydHkpIHtcbiAgICAgICAgaWYgKCEoJ2N1cnJlbnRTdHlsZScgaW4gZWxlbWVudCkgJiYgISgnZ2V0Q29tcHV0ZWRTdHlsZScgaW4gZ2xvYmFsKSkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZWxlbWVudC5jdXJyZW50U3R5bGUpIHtcbiAgICAgICAgICAgIHJldHVybiBlbGVtZW50LmN1cnJlbnRTdHlsZVtwcm9wZXJ0eV07XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZ2xvYmFsLmRvY3VtZW50LmRlZmF1bHRWaWV3LmdldENvbXB1dGVkU3R5bGUoZWxlbWVudCwgbnVsbCkuZ2V0UHJvcGVydHlWYWx1ZShwcm9wZXJ0eSk7XG4gICAgfVxufSkodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgPyB3aW5kb3cgOiB0aGlzKTtcblxubW9kdWxlLmV4cG9ydHMgPSBnZXRTdHlsZTtcbiIsInZhciBwb2x5ZmlsbCA9IChmdW5jdGlvbiAoKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgLyoqXG4gICAgICogQHNlZSBodHRwczovL2dpc3QuZ2l0aHViLmNvbS9tcmRvb2IvODM4Nzg1XG4gICAgICovXG4gICAgZnVuY3Rpb24gcG9seWZpbGxSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgKCkge1xuICAgIFx0aWYgKCF3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKSB7XG4gICAgXHRcdHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSAoZnVuY3Rpb24gKCkge1xuICAgIFx0XHRcdHJldHVybiB3aW5kb3cud2Via2l0UmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8XG4gICAgXHRcdFx0XHR3aW5kb3cubW96UmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8XG4gICAgXHRcdFx0XHR3aW5kb3cub1JlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICAgIFx0XHRcdFx0d2luZG93Lm1zUmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8XG4gICAgXHRcdFx0XHRmdW5jdGlvbiAoY2FsbGJhY2spIHtcbiAgICBcdFx0XHRcdFx0d2luZG93LnNldFRpbWVvdXQoY2FsbGJhY2ssIDEwMDAgLyA2MCk7XG4gICAgXHRcdFx0XHR9O1xuICAgIFx0XHR9KSgpO1xuICAgIFx0fVxuXG4gICAgXHRpZiAoIXdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZSkge1xuICAgIFx0XHR3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUgPSAoZnVuY3Rpb24gKCkge1xuICAgIFx0XHRcdHJldHVybiB3aW5kb3cud2Via2l0Q2FuY2VsQW5pbWF0aW9uRnJhbWUgfHxcbiAgICBcdFx0XHRcdHdpbmRvdy5tb3pDYW5jZWxBbmltYXRpb25GcmFtZSB8fFxuICAgIFx0XHRcdFx0d2luZG93Lm9DYW5jZWxBbmltYXRpb25GcmFtZSB8fFxuICAgIFx0XHRcdFx0d2luZG93Lm1zQ2FuY2VsQW5pbWF0aW9uRnJhbWUgfHxcbiAgICBcdFx0XHRcdHdpbmRvdy5jbGVhclRpbWVvdXQ7XG4gICAgXHRcdH0pKCk7XG4gICAgXHR9XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lOiBwb2x5ZmlsbFJlcXVlc3RBbmltYXRpb25GcmFtZVxuICAgIH1cbn0pKCk7XG5cbm1vZHVsZS5leHBvcnRzID0gcG9seWZpbGw7XG4iLCJ2YXIgcmVzaXplU2Vuc29yRmFjdG9yeSA9IChmdW5jdGlvbiAoKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgLyoqIEB2YXIge0Z1bmN0aW9ufSAqL1xuICAgIHZhciBnZXRTdHlsZSA9IHJlcXVpcmUoJy4vZ2V0U3R5bGUnKTtcbiAgICAvKiogQHZhciB7T2JqZWN0fSAqL1xuICAgIHZhciBjc3MgPSByZXF1aXJlKCcuL2NzcycpO1xuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gdGFyZ2V0RWxlbWVudFxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrXG4gICAgICogQGNvbnN0cnVjdG9yXG4gICAgICovXG4gICAgdmFyIHJlc2l6ZVNlbnNvciA9IGZ1bmN0aW9uICh0YXJnZXRFbGVtZW50LCBjYWxsYmFjaykge1xuICAgICAgICAvKiogQHZhciB7SFRNTEVsZW1lbnR9ICovXG4gICAgICAgIHRoaXMudGFyZ2V0RWxlbWVudCA9IHRhcmdldEVsZW1lbnQ7XG4gICAgICAgIC8qKiBAdmFyIHtGdW5jdGlvbn0gKi9cbiAgICAgICAgdGhpcy5jYWxsYmFjayA9IGNhbGxiYWNrO1xuICAgICAgICAvKiogQHZhciB7e3dpZHRoOiBpbnQsIGhlaWdodDogaW50fX0gKi9cbiAgICAgICAgdGhpcy5kaW1lbnNpb25zID0ge1xuICAgICAgICAgICAgd2lkdGg6IDAsXG4gICAgICAgICAgICBoZWlnaHQ6IDBcbiAgICAgICAgfTtcblxuICAgICAgICBpZiAoJ2F0dGFjaEV2ZW50JyBpbiBkb2N1bWVudCkge1xuICAgICAgICAgICAgdGhpcy5ib3VuZE9uUmVzaXplSGFuZGxlciA9IHRoaXMub25FbGVtZW50UmVzaXplLmJpbmQodGhpcyk7XG4gICAgICAgICAgICB0aGlzLnRhcmdldEVsZW1lbnQuYXR0YWNoRXZlbnQoJ29ucmVzaXplJywgdGhpcy5ib3VuZE9uUmVzaXplSGFuZGxlcik7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvKiogQHZhciB7e2NvbnRhaW5lcjogSFRNTEVsZW1lbnQsIGV4cGFuZDogSFRNTEVsZW1lbnQsIGV4cGFuZENoaWxkOiBIVE1MRWxlbWVudCwgY29udHJhY3Q6IEhUTUxFbGVtZW50fX0gKi9cbiAgICAgICAgdGhpcy50cmlnZ2VyRWxlbWVudHMgPSB7fTtcbiAgICAgICAgLyoqIEB2YXIge2ludH0gKi9cbiAgICAgICAgdGhpcy5yZXNpemVSQUYgPSAwO1xuXG4gICAgICAgIHRoaXMuc2V0dXAoKTtcbiAgICB9O1xuXG4gICAgcmVzaXplU2Vuc29yLnByb3RvdHlwZS5zZXR1cCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy8gTWFrZSBzdXJlIHRoZSB0YXJnZXQgZWxlbWVudCBpcyBcInBvc2l0aW9uZWRcIlxuICAgICAgICBpZiAoZ2V0U3R5bGUodGhpcy50YXJnZXRFbGVtZW50LCAncG9zaXRpb24nKSA9PT0gJ3N0YXRpYycpIHtcbiAgICAgICAgICAgIHRoaXMudGFyZ2V0RWxlbWVudC5zdHlsZS5wb3NpdGlvbiA9ICdyZWxhdGl2ZSc7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDcmVhdGUgYW5kIGFwcGVuZCByZXNpemUgdHJpZ2dlciBlbGVtZW50c1xuICAgICAgICB0aGlzLmluc2VydFJlc2l6ZVRyaWdnZXJFbGVtZW50cygpO1xuXG4gICAgICAgIC8vIFN0YXJ0IGxpc3RlbmluZyB0byBldmVudHNcbiAgICAgICAgdGhpcy5ib3VuZFNjcm9sbExpc3RlbmVyID0gdGhpcy5oYW5kbGVFbGVtZW50U2Nyb2xsLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMudGFyZ2V0RWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdzY3JvbGwnLCB0aGlzLmJvdW5kU2Nyb2xsTGlzdGVuZXIsIHRydWUpO1xuXG4gICAgICAgIGlmIChjc3MuaXNBbmltYXRpb25TdXBwb3J0ZWQoKSkge1xuICAgICAgICAgICAgdGhpcy5ib3VuZEFuaW1hdGlvblN0YXJ0TGlzdGVuZXIgPSB0aGlzLnJlc2V0VHJpZ2dlcnNPbkFuaW1hdGlvblN0YXJ0LmJpbmQodGhpcyk7XG4gICAgICAgICAgICB0aGlzLnRyaWdnZXJFbGVtZW50cy5jb250YWluZXIuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgICAgICAgICAgICBjc3MuZ2V0QW5pbWF0aW9uUHJvcGVydGllc0ZvckJyb3dzZXIoKS5hbmltYXRpb25TdGFydEV2ZW50LFxuICAgICAgICAgICAgICAgIHRoaXMuYm91bmRBbmltYXRpb25TdGFydExpc3RlbmVyXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gSW5pdGlhbCB2YWx1ZSByZXNldCBvZiBhbGwgdHJpZ2dlcnNcbiAgICAgICAgdGhpcy5yZXNldFRyaWdnZXJzKCk7XG4gICAgfTtcblxuICAgIHJlc2l6ZVNlbnNvci5wcm90b3R5cGUuaW5zZXJ0UmVzaXplVHJpZ2dlckVsZW1lbnRzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgcmVzaXplVHJpZ2dlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICB2YXIgZXhwYW5kVHJpZ2dlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICB2YXIgZXhwYW5kVHJpZ2dlckNoaWxkID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIHZhciBjb250cmFjdFRyaWdnZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcblxuICAgICAgICByZXNpemVUcmlnZ2VyLmNsYXNzTmFtZSA9ICdSZXNpemVTZW5zb3IgUmVzaXplU2Vuc29yX19yZXNpemVUcmlnZ2Vycyc7XG4gICAgICAgIGV4cGFuZFRyaWdnZXIuY2xhc3NOYW1lID0gJ1Jlc2l6ZVNlbnNvcl9fZXhwYW5kVHJpZ2dlcic7XG4gICAgICAgIGNvbnRyYWN0VHJpZ2dlci5jbGFzc05hbWUgPSAnUmVzaXplU2Vuc29yX19jb250cmFjdFRyaWdnZXInO1xuXG4gICAgICAgIGV4cGFuZFRyaWdnZXIuYXBwZW5kQ2hpbGQoZXhwYW5kVHJpZ2dlckNoaWxkKTtcbiAgICAgICAgcmVzaXplVHJpZ2dlci5hcHBlbmRDaGlsZChleHBhbmRUcmlnZ2VyKTtcbiAgICAgICAgcmVzaXplVHJpZ2dlci5hcHBlbmRDaGlsZChjb250cmFjdFRyaWdnZXIpO1xuXG4gICAgICAgIHRoaXMudHJpZ2dlckVsZW1lbnRzLmNvbnRhaW5lciA9IHJlc2l6ZVRyaWdnZXI7XG4gICAgICAgIHRoaXMudHJpZ2dlckVsZW1lbnRzLmV4cGFuZCA9IGV4cGFuZFRyaWdnZXI7XG4gICAgICAgIHRoaXMudHJpZ2dlckVsZW1lbnRzLmV4cGFuZENoaWxkID0gZXhwYW5kVHJpZ2dlckNoaWxkO1xuICAgICAgICB0aGlzLnRyaWdnZXJFbGVtZW50cy5jb250cmFjdCA9IGNvbnRyYWN0VHJpZ2dlcjtcblxuICAgICAgICB0aGlzLnRhcmdldEVsZW1lbnQuYXBwZW5kQ2hpbGQocmVzaXplVHJpZ2dlcik7XG4gICAgfTtcblxuICAgIHJlc2l6ZVNlbnNvci5wcm90b3R5cGUub25FbGVtZW50UmVzaXplID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgY3VycmVudERpbWVuc2lvbnMgPSB0aGlzLmdldERpbWVuc2lvbnMoKTtcblxuICAgICAgICBpZiAodGhpcy5pc1Jlc2l6ZWQoY3VycmVudERpbWVuc2lvbnMpKSB7XG4gICAgICAgICAgICB0aGlzLmRpbWVuc2lvbnMud2lkdGggPSBjdXJyZW50RGltZW5zaW9ucy53aWR0aDtcbiAgICAgICAgICAgIHRoaXMuZGltZW5zaW9ucy5oZWlnaHQgPSBjdXJyZW50RGltZW5zaW9ucy5oZWlnaHQ7XG4gICAgICAgICAgICB0aGlzLmVsZW1lbnRSZXNpemVkKCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcmVzaXplU2Vuc29yLnByb3RvdHlwZS5oYW5kbGVFbGVtZW50U2Nyb2xsID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICAgIHRoaXMucmVzZXRUcmlnZ2VycygpO1xuXG4gICAgICAgIGlmICh0aGlzLnJlc2l6ZVJBRikge1xuICAgICAgICAgICAgd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lKHRoaXMucmVzaXplUkFGKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMucmVzaXplUkFGID0gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgY3VycmVudERpbWVuc2lvbnMgPSBfdGhpcy5nZXREaW1lbnNpb25zKCk7XG4gICAgICAgICAgICBpZiAoX3RoaXMuaXNSZXNpemVkKGN1cnJlbnREaW1lbnNpb25zKSkge1xuICAgICAgICAgICAgICAgIF90aGlzLmRpbWVuc2lvbnMud2lkdGggPSBjdXJyZW50RGltZW5zaW9ucy53aWR0aDtcbiAgICAgICAgICAgICAgICBfdGhpcy5kaW1lbnNpb25zLmhlaWdodCA9IGN1cnJlbnREaW1lbnNpb25zLmhlaWdodDtcbiAgICAgICAgICAgICAgICBfdGhpcy5lbGVtZW50UmVzaXplZCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHt7d2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9fSBjdXJyZW50RGltZW5zaW9uc1xuICAgICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgICAqL1xuICAgIHJlc2l6ZVNlbnNvci5wcm90b3R5cGUuaXNSZXNpemVkID0gZnVuY3Rpb24gKGN1cnJlbnREaW1lbnNpb25zKSB7XG4gICAgICAgIHJldHVybiAoY3VycmVudERpbWVuc2lvbnMud2lkdGggIT09IHRoaXMuZGltZW5zaW9ucy53aWR0aCB8fCBjdXJyZW50RGltZW5zaW9ucy5oZWlnaHQgIT09IHRoaXMuZGltZW5zaW9ucy5oZWlnaHQpXG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEByZXR1cm5zIHt7d2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9fVxuICAgICAqL1xuICAgIHJlc2l6ZVNlbnNvci5wcm90b3R5cGUuZ2V0RGltZW5zaW9ucyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHdpZHRoOiB0aGlzLnRhcmdldEVsZW1lbnQub2Zmc2V0V2lkdGgsXG4gICAgICAgICAgICBoZWlnaHQ6IHRoaXMudGFyZ2V0RWxlbWVudC5vZmZzZXRIZWlnaHRcbiAgICAgICAgfTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtFdmVudH0gZXZlbnRcbiAgICAgKi9cbiAgICByZXNpemVTZW5zb3IucHJvdG90eXBlLnJlc2V0VHJpZ2dlcnNPbkFuaW1hdGlvblN0YXJ0ID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgIGlmIChldmVudC5hbmltYXRpb25OYW1lID09PSBjc3MuZ2V0QW5pbWF0aW9uUHJvcGVydGllc0ZvckJyb3dzZXIoKS5hbmltYXRpb25OYW1lKSB7XG4gICAgICAgICAgICB0aGlzLnJlc2V0VHJpZ2dlcnMoKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICByZXNpemVTZW5zb3IucHJvdG90eXBlLnJlc2V0VHJpZ2dlcnMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMudHJpZ2dlckVsZW1lbnRzLmNvbnRyYWN0LnNjcm9sbExlZnQgPSB0aGlzLnRyaWdnZXJFbGVtZW50cy5jb250cmFjdC5zY3JvbGxXaWR0aDtcbiAgICAgICAgdGhpcy50cmlnZ2VyRWxlbWVudHMuY29udHJhY3Quc2Nyb2xsVG9wID0gdGhpcy50cmlnZ2VyRWxlbWVudHMuY29udHJhY3Quc2Nyb2xsSGVpZ2h0O1xuICAgICAgICB0aGlzLnRyaWdnZXJFbGVtZW50cy5leHBhbmRDaGlsZC5zdHlsZS53aWR0aCA9IHRoaXMudHJpZ2dlckVsZW1lbnRzLmV4cGFuZC5vZmZzZXRXaWR0aCArIDEgKyAncHgnO1xuICAgICAgICB0aGlzLnRyaWdnZXJFbGVtZW50cy5leHBhbmRDaGlsZC5zdHlsZS5oZWlnaHQgPSB0aGlzLnRyaWdnZXJFbGVtZW50cy5leHBhbmQub2Zmc2V0SGVpZ2h0ICsgMSArICdweCc7XG4gICAgICAgIHRoaXMudHJpZ2dlckVsZW1lbnRzLmV4cGFuZC5zY3JvbGxMZWZ0ID0gdGhpcy50cmlnZ2VyRWxlbWVudHMuZXhwYW5kLnNjcm9sbFdpZHRoO1xuICAgICAgICB0aGlzLnRyaWdnZXJFbGVtZW50cy5leHBhbmQuc2Nyb2xsVG9wID0gdGhpcy50cmlnZ2VyRWxlbWVudHMuZXhwYW5kLnNjcm9sbEhlaWdodDtcbiAgICB9O1xuXG4gICAgcmVzaXplU2Vuc29yLnByb3RvdHlwZS5lbGVtZW50UmVzaXplZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5jYWxsYmFjayh0aGlzLmRpbWVuc2lvbnMpO1xuICAgIH07XG5cbiAgICByZXNpemVTZW5zb3IucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMucmVtb3ZlRXZlbnRMaXN0ZW5lcnMoKTtcbiAgICAgICAgdGhpcy50YXJnZXRFbGVtZW50LnJlbW92ZUNoaWxkKHRoaXMudHJpZ2dlckVsZW1lbnRzLmNvbnRhaW5lcik7XG4gICAgICAgIGRlbGV0ZSB0aGlzLmJvdW5kQW5pbWF0aW9uU3RhcnRMaXN0ZW5lcjtcbiAgICAgICAgZGVsZXRlIHRoaXMuYm91bmRTY3JvbGxMaXN0ZW5lcjtcbiAgICAgICAgZGVsZXRlIHRoaXMuY2FsbGJhY2s7XG4gICAgICAgIGRlbGV0ZSB0aGlzLnRhcmdldEVsZW1lbnQ7XG4gICAgfTtcblxuICAgIHJlc2l6ZVNlbnNvci5wcm90b3R5cGUucmVtb3ZlRXZlbnRMaXN0ZW5lcnMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICgnYXR0YWNoRXZlbnQnIGluIGRvY3VtZW50KSB7XG4gICAgICAgICAgICB0aGlzLnRhcmdldEVsZW1lbnQuZGV0YWNoRXZlbnQoJ29ucmVzaXplJywgdGhpcy5ib3VuZE9uUmVzaXplSGFuZGxlcik7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnRyaWdnZXJFbGVtZW50cy5jb250YWluZXIucmVtb3ZlRXZlbnRMaXN0ZW5lcihcbiAgICAgICAgICAgIGNzcy5nZXRBbmltYXRpb25Qcm9wZXJ0aWVzRm9yQnJvd3NlcigpLmFuaW1hdGlvblN0YXJ0RXZlbnQsXG4gICAgICAgICAgICB0aGlzLmJvdW5kQW5pbWF0aW9uU3RhcnRMaXN0ZW5lclxuICAgICAgICApO1xuICAgICAgICB0aGlzLnRhcmdldEVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgdGhpcy5ib3VuZFNjcm9sbExpc3RlbmVyLCB0cnVlKTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwYXJhbSB7RWxlbWVudH0gdGFyZ2V0RWxlbWVudFxuICAgICAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFja1xuICAgICAgICAgKiBAcmV0dXJucyB7cmVzaXplU2Vuc29yfVxuICAgICAgICAgKi9cbiAgICAgICAgY3JlYXRlOiBmdW5jdGlvbiAodGFyZ2V0RWxlbWVudCwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgcmVzaXplU2Vuc29yKHRhcmdldEVsZW1lbnQsIGNhbGxiYWNrKTtcbiAgICAgICAgfVxuICAgIH1cbn0pKCk7XG5cbm1vZHVsZS5leHBvcnRzID0gcmVzaXplU2Vuc29yRmFjdG9yeTtcbiIsInZhciBzZW5zb3JzID0gKGZ1bmN0aW9uICgpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICAvKiogQHZhciB7T2JqZWN0fSAqL1xuICAgIHZhciBjc3MgPSByZXF1aXJlKCcuL2NzcycpO1xuICAgIC8qKiBAdmFyIHtPYmplY3R9ICovXG4gICAgdmFyIHBvbHlmaWxsID0gcmVxdWlyZSgnLi9wb2x5ZmlsbCcpO1xuICAgIC8qKiBAdmFyIHtPYmplY3R9ICovXG4gICAgdmFyIHJlc2l6ZVNlbnNvckZhY3RvcnkgPSByZXF1aXJlKCcuL3Jlc2l6ZVNlbnNvcicpO1xuXG4gICAgLyoqIHthcnJheX0gKi9cbiAgICB2YXIgdW5zdWl0YWJsZUVsZW1lbnRzID0gWydJTUcnLCAnQ09MJywgJ1RSJywgJ1RIRUFEJywgJ1RGT09UJ107XG4gICAgLyoqIHtib29sZWFufSAqL1xuICAgIHZhciBzdXBwb3J0c0F0dGFjaEV2ZW50ID0gKCdhdHRhY2hFdmVudCcgaW4gZG9jdW1lbnQpO1xuXG4gICAgLyoqIHt7fX0gTWFwIG9mIGFsbCByZXNpemUgc2Vuc29ycyAoaWQgPT4gUmVzaXplU2Vuc29yKSAqL1xuICAgIHZhciBhbGxSZXNpemVTZW5zb3JzID0ge307XG5cbiAgICBpZiAoIXN1cHBvcnRzQXR0YWNoRXZlbnQpIHtcbiAgICAgICAgY3NzLmluc2VydFJlc2l6ZVNlbnNvclN0eWxlcygpO1xuXG4gICAgICAgIGlmICghKCdyZXF1ZXN0QW5pbWF0aW9uRnJhbWUnIGluIHdpbmRvdykgfHwgISgnY2FuY2VsQW5pbWF0aW9uRnJhbWUnIGluIHdpbmRvdykpIHtcbiAgICAgICAgICAgIHBvbHlmaWxsLnJlcXVlc3RBbmltYXRpb25GcmFtZSgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtFbGVtZW50fSB0YXJnZXRFbGVtZW50XG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2tcbiAgICAgKiBAcmV0dXJucyB7cmVzaXplU2Vuc29yfVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGNyZWF0ZSAodGFyZ2V0RWxlbWVudCwgY2FsbGJhY2spIHtcbiAgICAgICAgaWYgKGlzVW5zdWl0YWJsZUVsZW1lbnQodGFyZ2V0RWxlbWVudCkpIHtcbiAgICAgICAgICAgIGNvbnNvbGUgJiYgY29uc29sZS5lcnJvcihcIkdpdmVuIGVsZW1lbnQgaXNuJ3Qgc3VpdGFibGUgdG8gYWN0IGFzIGEgcmVzaXplIHNlbnNvci4gVHJ5IHdyYXBwaW5nIGl0IHdpdGggb25lIHRoYXQgaXMuIFVuc3VpdGFibGUgZWxlbWVudHMgYXJlOlwiLCB1bnN1aXRhYmxlRWxlbWVudHMpO1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgc2Vuc29ySWQgPSBnZXRTZW5zb3JJZCh0YXJnZXRFbGVtZW50KTtcblxuICAgICAgICBpZiAoYWxsUmVzaXplU2Vuc29yc1tzZW5zb3JJZF0pIHtcbiAgICAgICAgICAgIHJldHVybiBhbGxSZXNpemVTZW5zb3JzW3NlbnNvcklkXTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBzZW5zb3IgPSByZXNpemVTZW5zb3JGYWN0b3J5LmNyZWF0ZSh0YXJnZXRFbGVtZW50LCBjYWxsYmFjayk7XG4gICAgICAgIGFsbFJlc2l6ZVNlbnNvcnNbc2Vuc29ySWRdID0gc2Vuc29yO1xuICAgICAgICByZXR1cm4gc2Vuc29yO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7RWxlbWVudH0gdGFyZ2V0RWxlbWVudFxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGRlc3Ryb3kgKHRhcmdldEVsZW1lbnQpIHtcbiAgICAgICAgdmFyIHNlbnNvcklkID0gZ2V0U2Vuc29ySWQodGFyZ2V0RWxlbWVudCk7XG4gICAgICAgIHZhciBzZW5zb3IgPSBhbGxSZXNpemVTZW5zb3JzW3NlbnNvcklkXTtcblxuICAgICAgICBpZiAoIXNlbnNvcikge1xuICAgICAgICAgICAgY29uc29sZSAmJiBjb25zb2xlLmVycm9yKFwiQ2FuJ3QgZGVzdHJveSBSZXNpemVTZW5zb3IgKDQwNCBub3QgZm91bmQpLlwiLCB0YXJnZXRFbGVtZW50KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHNlbnNvci5kZXN0cm95KCk7XG4gICAgICAgIGRlbGV0ZSBhbGxSZXNpemVTZW5zb3JzW3NlbnNvcklkXTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge0VsZW1lbnR9IHRhcmdldEVsZW1lbnRcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGdldFNlbnNvcklkICh0YXJnZXRFbGVtZW50KSB7XG4gICAgICAgIHJldHVybiB0YXJnZXRFbGVtZW50LmlkO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IHRhcmdldEVsZW1lbnRcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBpc1Vuc3VpdGFibGVFbGVtZW50ICh0YXJnZXRFbGVtZW50KSB7XG4gICAgICAgIHZhciB0YWdOYW1lID0gdGFyZ2V0RWxlbWVudC50YWdOYW1lLnRvVXBwZXJDYXNlKCk7XG4gICAgICAgIHJldHVybiAodW5zdWl0YWJsZUVsZW1lbnRzLmluZGV4T2YodGFnTmFtZSkgPiAtMSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgY3JlYXRlOiBjcmVhdGUsXG4gICAgICAgIGRlc3Ryb3k6IGRlc3Ryb3lcbiAgICB9XG59KSgpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHNlbnNvcnM7Il19
