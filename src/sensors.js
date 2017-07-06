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