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
