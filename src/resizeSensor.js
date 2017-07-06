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
