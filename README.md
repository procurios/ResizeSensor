ResizeSensor.js
===================

Performance friendly element resize detection.

This library is heavily based on:

- [This article](http://www.backalleycoder.com/2013/03/18/cross-browser-event-based-element-resize-detection/) on backalleycoder.com
- [@sdecima's work in `javascript-detect-element-size`'](https://github.com/sdecima/javascript-detect-element-resize).
- [@marcj's EQ library](https://github.com/marcj/css-element-queries/).


Why?
---

I [quote]((http://www.backalleycoder.com/2013/03/18/cross-browser-event-based-element-resize-detection/)):

> During your coding adventures, you may have run into occasions where you wanted to know when an element in your document changed dimensions – basically the window resize event, but on regular elements. Element size changes can occur for many reasons: modifications to CSS width, height, padding, as a response to changes to a parent element’s size, and many more.

There's no native resize event on elements in most browsers (except for IE which provides `onresize` to DOM nodes). ResizeSensor.js allows you to simply attach resize listeners to elements. This enables you to:

- Create resize-proof web components.
- Implement per-element responsive design.
- Implement size-based loading of content.
- ... And anything else you can imagine.

Check out [ElementQueries.js](https://github.com/pesla/ElementQueries) if you're looking for cross-browser element queries.

Browser support
---------------

@todo

Example
-------

@todo

Installation
------

@todo

License
-------

MIT license.