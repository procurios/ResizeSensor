ResizeSensor.js
===================

Performance friendly element resize detection.

This library is heavily based on:

- [This article](http://www.backalleycoder.com/2013/03/18/cross-browser-event-based-element-resize-detection/) on backalleycoder.com
- [@sdecima's work in `javascript-detect-element-size`'](https://github.com/sdecima/javascript-detect-element-resize)
- [@marcj's EQ library](https://github.com/marcj/css-element-queries/)

## Why?

I [quote]((http://www.backalleycoder.com/2013/03/18/cross-browser-event-based-element-resize-detection/)):

> During your coding adventures, you may have run into occasions where you wanted to know when an element in your document changed dimensions – basically the window resize event, but on regular elements. Element size changes can occur for many reasons: modifications to CSS width, height, padding, as a response to changes to a parent element’s size, and many more.

There's no native resize event on elements in most browsers (except for IE which provides `onresize` to DOM nodes). ResizeSensor.js allows you to simply attach resize listeners to elements. This enables you to:

- Create resize-proof web components.
- Implement per-element responsive design.
- Implement size-based loading of content.
- ... And anything else you can imagine.

Check out [ElementQueries.js](https://github.com/procurios/ElementQueries) if you're looking for cross-browser element queries.

## Browser support

ResizeSensors are used in production (and maintained) by [Procurios](https://procurios.com). It's tested on Chrome, Safari, Opera, Firefox and IE7+. Internet Explorer uses the native available `onresize` event on elements.

## Usage

`requirejs` is used for module definitions / loading:

```js
require(['droplet/ResizeSensor/ResizeSensorApi'],
	/**
	 * @param ResizeSensorApi
	 */
	function (ResizeSensorApi) {
		ResizeSensorApi.create(element, callback);
	}
);
```

The `ResizeSensorApi` contains the following public methods:

```js
/**
 * @param {HTMLElement} targetElement
 * @param {Function} callback
 * @returns {ResizeSensor}
 */
ResizeSensorApi.create(targetElement, callback);

/**
 * @param {HTMLElement} targetElement
 */
ResizeSensorApi.destroy(targetElement);
```

## License

[MPL version 2.0](https://www.mozilla.org/en-US/MPL/2.0/)