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
    	var	startEvents = 'webkitAnimationStart animationstart oAnimationStart MSAnimationStart'.split(' ');

    	var i;
    	var l = browserPrefixes.length;

    	for (i = 0; i < l ; i++) {
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
        var value = null;

        if (element.currentStyle) {
            value = element.currentStyle[property];
        } else if (global.getComputedStyle) {
            value = global.document.defaultView.getComputedStyle(element, null).getPropertyValue(property);
        }

        return value;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvY3NzLmpzIiwic3JjL2dldFN0eWxlLmpzIiwic3JjL3BvbHlmaWxsLmpzIiwic3JjL3Jlc2l6ZVNlbnNvci5qcyIsInNyYy9zZW5zb3JzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgY3NzID0gKGZ1bmN0aW9uICgpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICAvKiogQHZhciB7bnVsbHxPYmplY3R9ICovXG4gICAgdmFyIGFuaW1hdGlvblByb3BlcnRpZXNGb3JCcm93c2VyID0gbnVsbDtcbiAgICAvKiogQHZhciB7bnVsbHxib29sZWFufSAqL1xuICAgIHZhciBpc0Nzc0FuaW1hdGlvblN1cHBvcnRlZCA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBEZXRlcm1pbmVzIHdoaWNoIHN0eWxlIGNvbnZlbnRpb24gKHByb3BlcnRpZXMpIHRvIGZvbGxvd1xuICAgICAqIEBzZWUgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvR3VpZGUvQ1NTL1VzaW5nX0NTU19hbmltYXRpb25zL0RldGVjdGluZ19DU1NfYW5pbWF0aW9uX3N1cHBvcnRcbiAgICAgKiBAcmV0dXJucyB7e2tleWZyYW1lc1J1bGU6IHN0cmluZywgc3R5bGVEZWNsYXJhdGlvbjogc3RyaW5nLCBhbmltYXRpb25TdGFydEV2ZW50OiBzdHJpbmcsIGFuaW1hdGlvbk5hbWU6IHN0cmluZ319XG4gICAgICovXG4gICAgZnVuY3Rpb24gZ2V0QW5pbWF0aW9uUHJvcGVydGllc0ZvckJyb3dzZXIgKCkge1xuICAgICAgICBpZiAoYW5pbWF0aW9uUHJvcGVydGllc0ZvckJyb3dzZXIgIT09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiBhbmltYXRpb25Qcm9wZXJ0aWVzRm9yQnJvd3NlcjtcbiAgICAgICAgfVxuXG4gICAgXHR2YXIgdGVzdEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBcdHZhciBzdXBwb3J0c1VucHJlZml4ZWRBbmltYXRpb25Qcm9wZXJ0aWVzID0gKCdhbmltYXRpb25OYW1lJyBpbiB0ZXN0RWxlbWVudC5zdHlsZSk7XG5cbiAgICBcdC8vIFVucHJlZml4ZWQgYW5pbWF0aW9uIHByb3BlcnRpZXNcbiAgICBcdHZhciBhbmltYXRpb25TdGFydEV2ZW50ID0gJ2FuaW1hdGlvbnN0YXJ0JztcbiAgICBcdHZhciBhbmltYXRpb25OYW1lID0gJ3Jlc2l6ZWFuaW0nO1xuXG4gICAgXHRpZiAoc3VwcG9ydHNVbnByZWZpeGVkQW5pbWF0aW9uUHJvcGVydGllcykge1xuICAgIFx0XHRyZXR1cm4ge1xuICAgIFx0XHRcdGtleWZyYW1lc1J1bGU6ICdAa2V5ZnJhbWVzICcgKyBhbmltYXRpb25OYW1lICsgJyB7ZnJvbSB7IG9wYWNpdHk6IDA7IH0gdG8geyBvcGFjaXR5OiAwOyB9fScsXG4gICAgXHRcdFx0c3R5bGVEZWNsYXJhdGlvbjogJ2FuaW1hdGlvbjogMW1zICcgKyBhbmltYXRpb25OYW1lICsgJzsnLFxuICAgIFx0XHRcdGFuaW1hdGlvblN0YXJ0RXZlbnQ6IGFuaW1hdGlvblN0YXJ0RXZlbnQsXG4gICAgXHRcdFx0YW5pbWF0aW9uTmFtZTogYW5pbWF0aW9uTmFtZVxuICAgIFx0XHR9O1xuICAgIFx0fVxuXG4gICAgXHQvLyBCcm93c2VyIHNwZWNpZmljIGFuaW1hdGlvbiBwcm9wZXJ0aWVzXG4gICAgXHR2YXIga2V5ZnJhbWVQcmVmaXggPSAnJztcbiAgICBcdHZhciBicm93c2VyUHJlZml4ZXMgPSAnV2Via2l0IE1veiBPIG1zJy5zcGxpdCgnICcpO1xuICAgIFx0dmFyXHRzdGFydEV2ZW50cyA9ICd3ZWJraXRBbmltYXRpb25TdGFydCBhbmltYXRpb25zdGFydCBvQW5pbWF0aW9uU3RhcnQgTVNBbmltYXRpb25TdGFydCcuc3BsaXQoJyAnKTtcblxuICAgIFx0dmFyIGk7XG4gICAgXHR2YXIgbCA9IGJyb3dzZXJQcmVmaXhlcy5sZW5ndGg7XG5cbiAgICBcdGZvciAoaSA9IDA7IGkgPCBsIDsgaSsrKSB7XG4gICAgXHRcdGlmICgoYnJvd3NlclByZWZpeGVzW2ldICsgJ0FuaW1hdGlvbk5hbWUnKSBpbiB0ZXN0RWxlbWVudC5zdHlsZSkge1xuICAgIFx0XHRcdGtleWZyYW1lUHJlZml4ID0gJy0nICsgYnJvd3NlclByZWZpeGVzW2ldLnRvTG93ZXJDYXNlKCkgKyAnLSc7XG4gICAgXHRcdFx0YW5pbWF0aW9uU3RhcnRFdmVudCA9IHN0YXJ0RXZlbnRzW2ldO1xuICAgIFx0XHRcdGJyZWFrO1xuICAgIFx0XHR9XG4gICAgXHR9XG5cbiAgICAgICAgYW5pbWF0aW9uUHJvcGVydGllc0ZvckJyb3dzZXIgPSB7XG4gICAgXHRcdGtleWZyYW1lc1J1bGU6ICdAJyArIGtleWZyYW1lUHJlZml4ICsgJ2tleWZyYW1lcyAnICsgYW5pbWF0aW9uTmFtZSArICcge2Zyb20geyBvcGFjaXR5OiAwOyB9IHRvIHsgb3BhY2l0eTogMDsgfX0nLFxuICAgIFx0XHRzdHlsZURlY2xhcmF0aW9uOiBrZXlmcmFtZVByZWZpeCArICdhbmltYXRpb246IDFtcyAnICsgYW5pbWF0aW9uTmFtZSArICc7JyxcbiAgICBcdFx0YW5pbWF0aW9uU3RhcnRFdmVudDogYW5pbWF0aW9uU3RhcnRFdmVudCxcbiAgICBcdFx0YW5pbWF0aW9uTmFtZTogYW5pbWF0aW9uTmFtZVxuICAgIFx0fTtcblxuICAgIFx0cmV0dXJuIGFuaW1hdGlvblByb3BlcnRpZXNGb3JCcm93c2VyO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGlzQ1NTQW5pbWF0aW9uU3VwcG9ydGVkICgpIHtcbiAgICAgICAgaWYgKGlzQ3NzQW5pbWF0aW9uU3VwcG9ydGVkICE9PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm4gaXNDc3NBbmltYXRpb25TdXBwb3J0ZWQ7XG4gICAgICAgIH1cblxuICAgIFx0dmFyIHRlc3RFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgXHR2YXIgaXNBbmltYXRpb25TdXBwb3J0ZWQgPSAoJ2FuaW1hdGlvbk5hbWUnIGluIHRlc3RFbGVtZW50LnN0eWxlKTtcblxuICAgIFx0aWYgKGlzQW5pbWF0aW9uU3VwcG9ydGVkKSB7XG4gICAgICAgICAgICBpc0Nzc0FuaW1hdGlvblN1cHBvcnRlZCA9IHRydWU7XG4gICAgXHRcdHJldHVybiBpc0Nzc0FuaW1hdGlvblN1cHBvcnRlZDtcbiAgICBcdH1cblxuICAgIFx0dmFyIGJyb3dzZXJQcmVmaXhlcyA9ICdXZWJraXQgTW96IE8gbXMnLnNwbGl0KCcgJyk7XG4gICAgXHR2YXIgaSA9IDA7XG4gICAgXHR2YXIgbCA9IGJyb3dzZXJQcmVmaXhlcy5sZW5ndGg7XG5cbiAgICBcdGZvciAoOyBpIDwgbDsgaSsrKSB7XG4gICAgXHRcdGlmICgoYnJvd3NlclByZWZpeGVzW2ldICsgJ0FuaW1hdGlvbk5hbWUnKSBpbiB0ZXN0RWxlbWVudC5zdHlsZSkge1xuICAgICAgICAgICAgICAgIGlzQ3NzQW5pbWF0aW9uU3VwcG9ydGVkID0gdHJ1ZTtcbiAgICBcdFx0XHRyZXR1cm4gaXNDc3NBbmltYXRpb25TdXBwb3J0ZWQ7XG4gICAgXHRcdH1cbiAgICBcdH1cblxuICAgICAgICBpc0Nzc0FuaW1hdGlvblN1cHBvcnRlZCA9IGZhbHNlO1xuICAgIFx0cmV0dXJuIGlzQ3NzQW5pbWF0aW9uU3VwcG9ydGVkO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFkZHMgYSBzdHlsZSBibG9jayB0aGF0IGNvbnRhaW5zIENTUyBlc3NlbnRpYWwgZm9yIGRldGVjdGluZyByZXNpemUgZXZlbnRzXG4gICAgICovXG4gICAgZnVuY3Rpb24gaW5zZXJ0UmVzaXplU2Vuc29yU3R5bGVzICgpIHtcbiAgICBcdHZhciBjc3NSdWxlcyA9IFtcbiAgICBcdFx0KGdldEFuaW1hdGlvblByb3BlcnRpZXNGb3JCcm93c2VyKCkua2V5ZnJhbWVzUnVsZSkgPyBnZXRBbmltYXRpb25Qcm9wZXJ0aWVzRm9yQnJvd3NlcigpLmtleWZyYW1lc1J1bGUgOiAnJyxcbiAgICBcdFx0Jy5SZXNpemVTZW5zb3JfX3Jlc2l6ZVRyaWdnZXJzIHsgJyArICgoZ2V0QW5pbWF0aW9uUHJvcGVydGllc0ZvckJyb3dzZXIoKS5zdHlsZURlY2xhcmF0aW9uKSA/IGdldEFuaW1hdGlvblByb3BlcnRpZXNGb3JCcm93c2VyKCkuc3R5bGVEZWNsYXJhdGlvbiA6ICcnKSArICcgdmlzaWJpbGl0eTogaGlkZGVuOyBvcGFjaXR5OiAwOyB9JyxcbiAgICBcdFx0Jy5SZXNpemVTZW5zb3JfX3Jlc2l6ZVRyaWdnZXJzLCAuUmVzaXplU2Vuc29yX19yZXNpemVUcmlnZ2VycyA+IGRpdiwgLlJlc2l6ZVNlbnNvcl9fY29udHJhY3RUcmlnZ2VyOmJlZm9yZSB7IGNvbnRlbnQ6IFxcJyBcXCc7IGRpc3BsYXk6IGJsb2NrOyBwb3NpdGlvbjogYWJzb2x1dGU7IHRvcDogMDsgbGVmdDogMDsgaGVpZ2h0OiAxMDAlOyB3aWR0aDogMTAwJTsgb3ZlcmZsb3c6IGhpZGRlbjsgfSAuUmVzaXplU2Vuc29yX19yZXNpemVUcmlnZ2VycyA+IGRpdiB7IGJhY2tncm91bmQ6ICNlZWU7IG92ZXJmbG93OiBhdXRvOyB9IC5SZXNpemVTZW5zb3JfX2NvbnRyYWN0VHJpZ2dlcjpiZWZvcmUgeyB3aWR0aDogMjAwJTsgaGVpZ2h0OiAyMDAlOyB9J1xuICAgIFx0XTtcblxuICAgICAgICBjc3NSdWxlcyA9IGNzc1J1bGVzLmpvaW4oJyAnKTtcblxuICAgIFx0dmFyIGhlYWRFbGVtID0gZG9jdW1lbnQuaGVhZCB8fCBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaGVhZCcpWzBdO1xuXG4gICAgXHR2YXIgc3R5bGVFbGVtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKTtcbiAgICBcdHN0eWxlRWxlbS50eXBlID0gJ3RleHQvY3NzJztcblxuICAgIFx0aWYgKHN0eWxlRWxlbS5zdHlsZVNoZWV0KSB7XG4gICAgXHRcdHN0eWxlRWxlbS5zdHlsZVNoZWV0LmNzc1RleHQgPSBjc3NSdWxlcztcbiAgICBcdH0gZWxzZSB7XG4gICAgXHRcdHN0eWxlRWxlbS5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShjc3NSdWxlcykpO1xuICAgIFx0fVxuXG4gICAgXHRoZWFkRWxlbS5hcHBlbmRDaGlsZChzdHlsZUVsZW0pO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAgIGluc2VydFJlc2l6ZVNlbnNvclN0eWxlczogaW5zZXJ0UmVzaXplU2Vuc29yU3R5bGVzLFxuICAgICAgICBpc0FuaW1hdGlvblN1cHBvcnRlZDogaXNDU1NBbmltYXRpb25TdXBwb3J0ZWQsXG4gICAgICAgIGdldEFuaW1hdGlvblByb3BlcnRpZXNGb3JCcm93c2VyOiBnZXRBbmltYXRpb25Qcm9wZXJ0aWVzRm9yQnJvd3NlclxuICAgIH1cbn0pKCk7XG5cbm1vZHVsZS5leHBvcnRzID0gY3NzO1xuIiwidmFyIGdldFN0eWxlID0gKGZ1bmN0aW9uIChnbG9iYWwpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50XG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHByb3BlcnR5XG4gICAgICogQHJldHVybnMge251bGx8c3RyaW5nfVxuICAgICAqL1xuICAgIHJldHVybiBmdW5jdGlvbiAoZWxlbWVudCwgcHJvcGVydHkpIHtcbiAgICAgICAgdmFyIHZhbHVlID0gbnVsbDtcblxuICAgICAgICBpZiAoZWxlbWVudC5jdXJyZW50U3R5bGUpIHtcbiAgICAgICAgICAgIHZhbHVlID0gZWxlbWVudC5jdXJyZW50U3R5bGVbcHJvcGVydHldO1xuICAgICAgICB9IGVsc2UgaWYgKGdsb2JhbC5nZXRDb21wdXRlZFN0eWxlKSB7XG4gICAgICAgICAgICB2YWx1ZSA9IGdsb2JhbC5kb2N1bWVudC5kZWZhdWx0Vmlldy5nZXRDb21wdXRlZFN0eWxlKGVsZW1lbnQsIG51bGwpLmdldFByb3BlcnR5VmFsdWUocHJvcGVydHkpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH1cbn0pKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93IDogdGhpcyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZ2V0U3R5bGU7XG4iLCJ2YXIgcG9seWZpbGwgPSAoZnVuY3Rpb24gKCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIC8qKlxuICAgICAqIEBzZWUgaHR0cHM6Ly9naXN0LmdpdGh1Yi5jb20vbXJkb29iLzgzODc4NVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHBvbHlmaWxsUmVxdWVzdEFuaW1hdGlvbkZyYW1lICgpIHtcbiAgICBcdGlmICghd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSkge1xuICAgIFx0XHR3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gKGZ1bmN0aW9uICgpIHtcbiAgICBcdFx0XHRyZXR1cm4gd2luZG93LndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICAgIFx0XHRcdFx0d2luZG93Lm1velJlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICAgIFx0XHRcdFx0d2luZG93Lm9SZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHxcbiAgICBcdFx0XHRcdHdpbmRvdy5tc1JlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICAgIFx0XHRcdFx0ZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG4gICAgXHRcdFx0XHRcdHdpbmRvdy5zZXRUaW1lb3V0KGNhbGxiYWNrLCAxMDAwIC8gNjApO1xuICAgIFx0XHRcdFx0fTtcbiAgICBcdFx0fSkoKTtcbiAgICBcdH1cblxuICAgIFx0aWYgKCF3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUpIHtcbiAgICBcdFx0d2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lID0gKGZ1bmN0aW9uICgpIHtcbiAgICBcdFx0XHRyZXR1cm4gd2luZG93LndlYmtpdENhbmNlbEFuaW1hdGlvbkZyYW1lIHx8XG4gICAgXHRcdFx0XHR3aW5kb3cubW96Q2FuY2VsQW5pbWF0aW9uRnJhbWUgfHxcbiAgICBcdFx0XHRcdHdpbmRvdy5vQ2FuY2VsQW5pbWF0aW9uRnJhbWUgfHxcbiAgICBcdFx0XHRcdHdpbmRvdy5tc0NhbmNlbEFuaW1hdGlvbkZyYW1lIHx8XG4gICAgXHRcdFx0XHR3aW5kb3cuY2xlYXJUaW1lb3V0O1xuICAgIFx0XHR9KSgpO1xuICAgIFx0fVxuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZTogcG9seWZpbGxSZXF1ZXN0QW5pbWF0aW9uRnJhbWVcbiAgICB9XG59KSgpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHBvbHlmaWxsO1xuIiwidmFyIHJlc2l6ZVNlbnNvckZhY3RvcnkgPSAoZnVuY3Rpb24gKCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIC8qKiBAdmFyIHtGdW5jdGlvbn0gKi9cbiAgICB2YXIgZ2V0U3R5bGUgPSByZXF1aXJlKCcuL2dldFN0eWxlJyk7XG4gICAgLyoqIEB2YXIge09iamVjdH0gKi9cbiAgICB2YXIgY3NzID0gcmVxdWlyZSgnLi9jc3MnKTtcblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IHRhcmdldEVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFja1xuICAgICAqIEBjb25zdHJ1Y3RvclxuICAgICAqL1xuICAgIHZhciByZXNpemVTZW5zb3IgPSBmdW5jdGlvbiAodGFyZ2V0RWxlbWVudCwgY2FsbGJhY2spIHtcbiAgICAgICAgLyoqIEB2YXIge0hUTUxFbGVtZW50fSAqL1xuICAgICAgICB0aGlzLnRhcmdldEVsZW1lbnQgPSB0YXJnZXRFbGVtZW50O1xuICAgICAgICAvKiogQHZhciB7RnVuY3Rpb259ICovXG4gICAgICAgIHRoaXMuY2FsbGJhY2sgPSBjYWxsYmFjaztcbiAgICAgICAgLyoqIEB2YXIge3t3aWR0aDogaW50LCBoZWlnaHQ6IGludH19ICovXG4gICAgICAgIHRoaXMuZGltZW5zaW9ucyA9IHtcbiAgICAgICAgICAgIHdpZHRoOiAwLFxuICAgICAgICAgICAgaGVpZ2h0OiAwXG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKCdhdHRhY2hFdmVudCcgaW4gZG9jdW1lbnQpIHtcbiAgICAgICAgICAgIHRoaXMuYm91bmRPblJlc2l6ZUhhbmRsZXIgPSB0aGlzLm9uRWxlbWVudFJlc2l6ZS5iaW5kKHRoaXMpO1xuICAgICAgICAgICAgdGhpcy50YXJnZXRFbGVtZW50LmF0dGFjaEV2ZW50KCdvbnJlc2l6ZScsIHRoaXMuYm91bmRPblJlc2l6ZUhhbmRsZXIpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLyoqIEB2YXIge3tjb250YWluZXI6IEhUTUxFbGVtZW50LCBleHBhbmQ6IEhUTUxFbGVtZW50LCBleHBhbmRDaGlsZDogSFRNTEVsZW1lbnQsIGNvbnRyYWN0OiBIVE1MRWxlbWVudH19ICovXG4gICAgICAgIHRoaXMudHJpZ2dlckVsZW1lbnRzID0ge307XG4gICAgICAgIC8qKiBAdmFyIHtpbnR9ICovXG4gICAgICAgIHRoaXMucmVzaXplUkFGID0gMDtcblxuICAgICAgICB0aGlzLnNldHVwKCk7XG4gICAgfTtcblxuICAgIHJlc2l6ZVNlbnNvci5wcm90b3R5cGUuc2V0dXAgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vIE1ha2Ugc3VyZSB0aGUgdGFyZ2V0IGVsZW1lbnQgaXMgXCJwb3NpdGlvbmVkXCJcbiAgICAgICAgaWYgKGdldFN0eWxlKHRoaXMudGFyZ2V0RWxlbWVudCwgJ3Bvc2l0aW9uJykgPT09ICdzdGF0aWMnKSB7XG4gICAgICAgICAgICB0aGlzLnRhcmdldEVsZW1lbnQuc3R5bGUucG9zaXRpb24gPSAncmVsYXRpdmUnO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ3JlYXRlIGFuZCBhcHBlbmQgcmVzaXplIHRyaWdnZXIgZWxlbWVudHNcbiAgICAgICAgdGhpcy5pbnNlcnRSZXNpemVUcmlnZ2VyRWxlbWVudHMoKTtcblxuICAgICAgICAvLyBTdGFydCBsaXN0ZW5pbmcgdG8gZXZlbnRzXG4gICAgICAgIHRoaXMuYm91bmRTY3JvbGxMaXN0ZW5lciA9IHRoaXMuaGFuZGxlRWxlbWVudFNjcm9sbC5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLnRhcmdldEVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgdGhpcy5ib3VuZFNjcm9sbExpc3RlbmVyLCB0cnVlKTtcblxuICAgICAgICBpZiAoY3NzLmlzQW5pbWF0aW9uU3VwcG9ydGVkKCkpIHtcbiAgICAgICAgICAgIHRoaXMuYm91bmRBbmltYXRpb25TdGFydExpc3RlbmVyID0gdGhpcy5yZXNldFRyaWdnZXJzT25BbmltYXRpb25TdGFydC5iaW5kKHRoaXMpO1xuICAgICAgICAgICAgdGhpcy50cmlnZ2VyRWxlbWVudHMuY29udGFpbmVyLmFkZEV2ZW50TGlzdGVuZXIoXG4gICAgICAgICAgICAgICAgY3NzLmdldEFuaW1hdGlvblByb3BlcnRpZXNGb3JCcm93c2VyKCkuYW5pbWF0aW9uU3RhcnRFdmVudCxcbiAgICAgICAgICAgICAgICB0aGlzLmJvdW5kQW5pbWF0aW9uU3RhcnRMaXN0ZW5lclxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEluaXRpYWwgdmFsdWUgcmVzZXQgb2YgYWxsIHRyaWdnZXJzXG4gICAgICAgIHRoaXMucmVzZXRUcmlnZ2VycygpO1xuICAgIH07XG5cbiAgICByZXNpemVTZW5zb3IucHJvdG90eXBlLmluc2VydFJlc2l6ZVRyaWdnZXJFbGVtZW50cyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIHJlc2l6ZVRyaWdnZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgdmFyIGV4cGFuZFRyaWdnZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgdmFyIGV4cGFuZFRyaWdnZXJDaGlsZCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICB2YXIgY29udHJhY3RUcmlnZ2VyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG5cbiAgICAgICAgcmVzaXplVHJpZ2dlci5jbGFzc05hbWUgPSAnUmVzaXplU2Vuc29yIFJlc2l6ZVNlbnNvcl9fcmVzaXplVHJpZ2dlcnMnO1xuICAgICAgICBleHBhbmRUcmlnZ2VyLmNsYXNzTmFtZSA9ICdSZXNpemVTZW5zb3JfX2V4cGFuZFRyaWdnZXInO1xuICAgICAgICBjb250cmFjdFRyaWdnZXIuY2xhc3NOYW1lID0gJ1Jlc2l6ZVNlbnNvcl9fY29udHJhY3RUcmlnZ2VyJztcblxuICAgICAgICBleHBhbmRUcmlnZ2VyLmFwcGVuZENoaWxkKGV4cGFuZFRyaWdnZXJDaGlsZCk7XG4gICAgICAgIHJlc2l6ZVRyaWdnZXIuYXBwZW5kQ2hpbGQoZXhwYW5kVHJpZ2dlcik7XG4gICAgICAgIHJlc2l6ZVRyaWdnZXIuYXBwZW5kQ2hpbGQoY29udHJhY3RUcmlnZ2VyKTtcblxuICAgICAgICB0aGlzLnRyaWdnZXJFbGVtZW50cy5jb250YWluZXIgPSByZXNpemVUcmlnZ2VyO1xuICAgICAgICB0aGlzLnRyaWdnZXJFbGVtZW50cy5leHBhbmQgPSBleHBhbmRUcmlnZ2VyO1xuICAgICAgICB0aGlzLnRyaWdnZXJFbGVtZW50cy5leHBhbmRDaGlsZCA9IGV4cGFuZFRyaWdnZXJDaGlsZDtcbiAgICAgICAgdGhpcy50cmlnZ2VyRWxlbWVudHMuY29udHJhY3QgPSBjb250cmFjdFRyaWdnZXI7XG5cbiAgICAgICAgdGhpcy50YXJnZXRFbGVtZW50LmFwcGVuZENoaWxkKHJlc2l6ZVRyaWdnZXIpO1xuICAgIH07XG5cbiAgICByZXNpemVTZW5zb3IucHJvdG90eXBlLm9uRWxlbWVudFJlc2l6ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGN1cnJlbnREaW1lbnNpb25zID0gdGhpcy5nZXREaW1lbnNpb25zKCk7XG5cbiAgICAgICAgaWYgKHRoaXMuaXNSZXNpemVkKGN1cnJlbnREaW1lbnNpb25zKSkge1xuICAgICAgICAgICAgdGhpcy5kaW1lbnNpb25zLndpZHRoID0gY3VycmVudERpbWVuc2lvbnMud2lkdGg7XG4gICAgICAgICAgICB0aGlzLmRpbWVuc2lvbnMuaGVpZ2h0ID0gY3VycmVudERpbWVuc2lvbnMuaGVpZ2h0O1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50UmVzaXplZCgpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHJlc2l6ZVNlbnNvci5wcm90b3R5cGUuaGFuZGxlRWxlbWVudFNjcm9sbCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgICB0aGlzLnJlc2V0VHJpZ2dlcnMoKTtcblxuICAgICAgICBpZiAodGhpcy5yZXNpemVSQUYpIHtcbiAgICAgICAgICAgIHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZSh0aGlzLnJlc2l6ZVJBRik7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnJlc2l6ZVJBRiA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGN1cnJlbnREaW1lbnNpb25zID0gX3RoaXMuZ2V0RGltZW5zaW9ucygpO1xuICAgICAgICAgICAgaWYgKF90aGlzLmlzUmVzaXplZChjdXJyZW50RGltZW5zaW9ucykpIHtcbiAgICAgICAgICAgICAgICBfdGhpcy5kaW1lbnNpb25zLndpZHRoID0gY3VycmVudERpbWVuc2lvbnMud2lkdGg7XG4gICAgICAgICAgICAgICAgX3RoaXMuZGltZW5zaW9ucy5oZWlnaHQgPSBjdXJyZW50RGltZW5zaW9ucy5oZWlnaHQ7XG4gICAgICAgICAgICAgICAgX3RoaXMuZWxlbWVudFJlc2l6ZWQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7e3dpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfX0gY3VycmVudERpbWVuc2lvbnNcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICAgKi9cbiAgICByZXNpemVTZW5zb3IucHJvdG90eXBlLmlzUmVzaXplZCA9IGZ1bmN0aW9uIChjdXJyZW50RGltZW5zaW9ucykge1xuICAgICAgICByZXR1cm4gKGN1cnJlbnREaW1lbnNpb25zLndpZHRoICE9PSB0aGlzLmRpbWVuc2lvbnMud2lkdGggfHwgY3VycmVudERpbWVuc2lvbnMuaGVpZ2h0ICE9PSB0aGlzLmRpbWVuc2lvbnMuaGVpZ2h0KVxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBAcmV0dXJucyB7e3dpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfX1cbiAgICAgKi9cbiAgICByZXNpemVTZW5zb3IucHJvdG90eXBlLmdldERpbWVuc2lvbnMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB3aWR0aDogdGhpcy50YXJnZXRFbGVtZW50Lm9mZnNldFdpZHRoLFxuICAgICAgICAgICAgaGVpZ2h0OiB0aGlzLnRhcmdldEVsZW1lbnQub2Zmc2V0SGVpZ2h0XG4gICAgICAgIH07XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50XG4gICAgICovXG4gICAgcmVzaXplU2Vuc29yLnByb3RvdHlwZS5yZXNldFRyaWdnZXJzT25BbmltYXRpb25TdGFydCA9IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICBpZiAoZXZlbnQuYW5pbWF0aW9uTmFtZSA9PT0gY3NzLmdldEFuaW1hdGlvblByb3BlcnRpZXNGb3JCcm93c2VyKCkuYW5pbWF0aW9uTmFtZSkge1xuICAgICAgICAgICAgdGhpcy5yZXNldFRyaWdnZXJzKCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcmVzaXplU2Vuc29yLnByb3RvdHlwZS5yZXNldFRyaWdnZXJzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLnRyaWdnZXJFbGVtZW50cy5jb250cmFjdC5zY3JvbGxMZWZ0ID0gdGhpcy50cmlnZ2VyRWxlbWVudHMuY29udHJhY3Quc2Nyb2xsV2lkdGg7XG4gICAgICAgIHRoaXMudHJpZ2dlckVsZW1lbnRzLmNvbnRyYWN0LnNjcm9sbFRvcCA9IHRoaXMudHJpZ2dlckVsZW1lbnRzLmNvbnRyYWN0LnNjcm9sbEhlaWdodDtcbiAgICAgICAgdGhpcy50cmlnZ2VyRWxlbWVudHMuZXhwYW5kQ2hpbGQuc3R5bGUud2lkdGggPSB0aGlzLnRyaWdnZXJFbGVtZW50cy5leHBhbmQub2Zmc2V0V2lkdGggKyAxICsgJ3B4JztcbiAgICAgICAgdGhpcy50cmlnZ2VyRWxlbWVudHMuZXhwYW5kQ2hpbGQuc3R5bGUuaGVpZ2h0ID0gdGhpcy50cmlnZ2VyRWxlbWVudHMuZXhwYW5kLm9mZnNldEhlaWdodCArIDEgKyAncHgnO1xuICAgICAgICB0aGlzLnRyaWdnZXJFbGVtZW50cy5leHBhbmQuc2Nyb2xsTGVmdCA9IHRoaXMudHJpZ2dlckVsZW1lbnRzLmV4cGFuZC5zY3JvbGxXaWR0aDtcbiAgICAgICAgdGhpcy50cmlnZ2VyRWxlbWVudHMuZXhwYW5kLnNjcm9sbFRvcCA9IHRoaXMudHJpZ2dlckVsZW1lbnRzLmV4cGFuZC5zY3JvbGxIZWlnaHQ7XG4gICAgfTtcblxuICAgIHJlc2l6ZVNlbnNvci5wcm90b3R5cGUuZWxlbWVudFJlc2l6ZWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuY2FsbGJhY2sodGhpcy5kaW1lbnNpb25zKTtcbiAgICB9O1xuXG4gICAgcmVzaXplU2Vuc29yLnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXJzKCk7XG4gICAgICAgIHRoaXMudGFyZ2V0RWxlbWVudC5yZW1vdmVDaGlsZCh0aGlzLnRyaWdnZXJFbGVtZW50cy5jb250YWluZXIpO1xuICAgICAgICBkZWxldGUgdGhpcy5ib3VuZEFuaW1hdGlvblN0YXJ0TGlzdGVuZXI7XG4gICAgICAgIGRlbGV0ZSB0aGlzLmJvdW5kU2Nyb2xsTGlzdGVuZXI7XG4gICAgICAgIGRlbGV0ZSB0aGlzLmNhbGxiYWNrO1xuICAgICAgICBkZWxldGUgdGhpcy50YXJnZXRFbGVtZW50O1xuICAgIH07XG5cbiAgICByZXNpemVTZW5zb3IucHJvdG90eXBlLnJlbW92ZUV2ZW50TGlzdGVuZXJzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAoJ2F0dGFjaEV2ZW50JyBpbiBkb2N1bWVudCkge1xuICAgICAgICAgICAgdGhpcy50YXJnZXRFbGVtZW50LmRldGFjaEV2ZW50KCdvbnJlc2l6ZScsIHRoaXMuYm91bmRPblJlc2l6ZUhhbmRsZXIpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy50cmlnZ2VyRWxlbWVudHMuY29udGFpbmVyLnJlbW92ZUV2ZW50TGlzdGVuZXIoXG4gICAgICAgICAgICBjc3MuZ2V0QW5pbWF0aW9uUHJvcGVydGllc0ZvckJyb3dzZXIoKS5hbmltYXRpb25TdGFydEV2ZW50LFxuICAgICAgICAgICAgdGhpcy5ib3VuZEFuaW1hdGlvblN0YXJ0TGlzdGVuZXJcbiAgICAgICAgKTtcbiAgICAgICAgdGhpcy50YXJnZXRFbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIHRoaXMuYm91bmRTY3JvbGxMaXN0ZW5lciwgdHJ1ZSk7XG4gICAgfTtcblxuICAgIHJldHVybiB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcGFyYW0ge0VsZW1lbnR9IHRhcmdldEVsZW1lbnRcbiAgICAgICAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2tcbiAgICAgICAgICogQHJldHVybnMge3Jlc2l6ZVNlbnNvcn1cbiAgICAgICAgICovXG4gICAgICAgIGNyZWF0ZTogZnVuY3Rpb24gKHRhcmdldEVsZW1lbnQsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IHJlc2l6ZVNlbnNvcih0YXJnZXRFbGVtZW50LCBjYWxsYmFjayk7XG4gICAgICAgIH1cbiAgICB9XG59KSgpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHJlc2l6ZVNlbnNvckZhY3Rvcnk7XG4iLCJ2YXIgc2Vuc29ycyA9IChmdW5jdGlvbiAoKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgLyoqIEB2YXIge09iamVjdH0gKi9cbiAgICB2YXIgY3NzID0gcmVxdWlyZSgnLi9jc3MnKTtcbiAgICAvKiogQHZhciB7T2JqZWN0fSAqL1xuICAgIHZhciBwb2x5ZmlsbCA9IHJlcXVpcmUoJy4vcG9seWZpbGwnKTtcbiAgICAvKiogQHZhciB7T2JqZWN0fSAqL1xuICAgIHZhciByZXNpemVTZW5zb3JGYWN0b3J5ID0gcmVxdWlyZSgnLi9yZXNpemVTZW5zb3InKTtcblxuICAgIC8qKiB7YXJyYXl9ICovXG4gICAgdmFyIHVuc3VpdGFibGVFbGVtZW50cyA9IFsnSU1HJywgJ0NPTCcsICdUUicsICdUSEVBRCcsICdURk9PVCddO1xuICAgIC8qKiB7Ym9vbGVhbn0gKi9cbiAgICB2YXIgc3VwcG9ydHNBdHRhY2hFdmVudCA9ICgnYXR0YWNoRXZlbnQnIGluIGRvY3VtZW50KTtcblxuICAgIC8qKiB7e319IE1hcCBvZiBhbGwgcmVzaXplIHNlbnNvcnMgKGlkID0+IFJlc2l6ZVNlbnNvcikgKi9cbiAgICB2YXIgYWxsUmVzaXplU2Vuc29ycyA9IHt9O1xuXG4gICAgaWYgKCFzdXBwb3J0c0F0dGFjaEV2ZW50KSB7XG4gICAgICAgIGNzcy5pbnNlcnRSZXNpemVTZW5zb3JTdHlsZXMoKTtcblxuICAgICAgICBpZiAoISgncmVxdWVzdEFuaW1hdGlvbkZyYW1lJyBpbiB3aW5kb3cpIHx8ICEoJ2NhbmNlbEFuaW1hdGlvbkZyYW1lJyBpbiB3aW5kb3cpKSB7XG4gICAgICAgICAgICBwb2x5ZmlsbC5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7RWxlbWVudH0gdGFyZ2V0RWxlbWVudFxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrXG4gICAgICogQHJldHVybnMge3Jlc2l6ZVNlbnNvcn1cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBjcmVhdGUgKHRhcmdldEVsZW1lbnQsIGNhbGxiYWNrKSB7XG4gICAgICAgIGlmIChpc1Vuc3VpdGFibGVFbGVtZW50KHRhcmdldEVsZW1lbnQpKSB7XG4gICAgICAgICAgICBjb25zb2xlICYmIGNvbnNvbGUuZXJyb3IoXCJHaXZlbiBlbGVtZW50IGlzbid0IHN1aXRhYmxlIHRvIGFjdCBhcyBhIHJlc2l6ZSBzZW5zb3IuIFRyeSB3cmFwcGluZyBpdCB3aXRoIG9uZSB0aGF0IGlzLiBVbnN1aXRhYmxlIGVsZW1lbnRzIGFyZTpcIiwgdW5zdWl0YWJsZUVsZW1lbnRzKTtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHNlbnNvcklkID0gZ2V0U2Vuc29ySWQodGFyZ2V0RWxlbWVudCk7XG5cbiAgICAgICAgaWYgKGFsbFJlc2l6ZVNlbnNvcnNbc2Vuc29ySWRdKSB7XG4gICAgICAgICAgICByZXR1cm4gYWxsUmVzaXplU2Vuc29yc1tzZW5zb3JJZF07XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgc2Vuc29yID0gcmVzaXplU2Vuc29yRmFjdG9yeS5jcmVhdGUodGFyZ2V0RWxlbWVudCwgY2FsbGJhY2spO1xuICAgICAgICBhbGxSZXNpemVTZW5zb3JzW3NlbnNvcklkXSA9IHNlbnNvcjtcbiAgICAgICAgcmV0dXJuIHNlbnNvcjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge0VsZW1lbnR9IHRhcmdldEVsZW1lbnRcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBkZXN0cm95ICh0YXJnZXRFbGVtZW50KSB7XG4gICAgICAgIHZhciBzZW5zb3JJZCA9IGdldFNlbnNvcklkKHRhcmdldEVsZW1lbnQpO1xuICAgICAgICB2YXIgc2Vuc29yID0gYWxsUmVzaXplU2Vuc29yc1tzZW5zb3JJZF07XG5cbiAgICAgICAgaWYgKCFzZW5zb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUgJiYgY29uc29sZS5lcnJvcihcIkNhbid0IGRlc3Ryb3kgUmVzaXplU2Vuc29yICg0MDQgbm90IGZvdW5kKS5cIiwgdGFyZ2V0RWxlbWVudCk7XG4gICAgICAgIH1cblxuICAgICAgICBzZW5zb3IuZGVzdHJveSgpO1xuICAgICAgICBkZWxldGUgYWxsUmVzaXplU2Vuc29yc1tzZW5zb3JJZF07XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtFbGVtZW50fSB0YXJnZXRFbGVtZW50XG4gICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBnZXRTZW5zb3JJZCAodGFyZ2V0RWxlbWVudCkge1xuICAgICAgICByZXR1cm4gdGFyZ2V0RWxlbWVudC5pZDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSB0YXJnZXRFbGVtZW50XG4gICAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAgICovXG4gICAgZnVuY3Rpb24gaXNVbnN1aXRhYmxlRWxlbWVudCAodGFyZ2V0RWxlbWVudCkge1xuICAgICAgICB2YXIgdGFnTmFtZSA9IHRhcmdldEVsZW1lbnQudGFnTmFtZS50b1VwcGVyQ2FzZSgpO1xuICAgICAgICByZXR1cm4gKHVuc3VpdGFibGVFbGVtZW50cy5pbmRleE9mKHRhZ05hbWUpID4gLTEpO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAgIGNyZWF0ZTogY3JlYXRlLFxuICAgICAgICBkZXN0cm95OiBkZXN0cm95XG4gICAgfVxufSkoKTtcblxubW9kdWxlLmV4cG9ydHMgPSBzZW5zb3JzOyJdfQ==
