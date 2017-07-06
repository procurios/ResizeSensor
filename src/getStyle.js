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
