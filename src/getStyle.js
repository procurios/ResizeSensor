var getStyle = (function () {
    'use strict';

    /**
     * @param {HTMLElement} element
     * @param {string} property
     * @returns {null|string}
     */
    return function getStyle (element, property) {
        var value = null;

        if (element.currentStyle) {
            value = element.currentStyle[property];
        } else if (window.getComputedStyle) {
            value = document.defaultView.getComputedStyle(element, null).getPropertyValue(property);
        }

        return value;
    }
})();

module.exports = getStyle;
