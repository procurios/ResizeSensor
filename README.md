resizeSensor.js
===================

Performance friendly element resize detection.

This library is heavily based on:

- [This article](http://www.backalleycoder.com/2013/03/18/cross-browser-event-based-element-resize-detection/) on backalleycoder.com
- [@sdecima's work in `javascript-detect-element-size`'](https://github.com/sdecima/javascript-detect-element-resize)
- [@marcj's EQ library](https://github.com/marcj/css-element-queries/)

## Why?

I [quote]((http://www.backalleycoder.com/2013/03/18/cross-browser-event-based-element-resize-detection/)):

> During your coding adventures, you may have run into occasions where you wanted to know when an element in your document 
> changed dimensions – basically the window resize event, but on regular elements. Element size changes can occur for many
> reasons: modifications to CSS width, height, padding, as a response to changes to a parent element’s size, and many more.

There's no native resize event on elements in most browsers (except for IE which provides `onresize` to DOM nodes).
`resizeSensor.js` allows you to simply attach resize listeners to elements. This enables you to:

- Create resize-proof web components.
- Implement per-element responsive design.
- Implement size-based loading of content.
- ... And anything else you can imagine.

Check out [elementQueries.js](https://github.com/procurios/ElementQueries) if you're looking for cross-browser element queries.

## Browser support

ResizeSensors are used in production (and maintained) by [Procurios](https://procurios.com). It's tested on Chrome, 
Safari, Opera, Firefox and IE7+. Internet Explorer uses the native available `onresize` event on elements.

## Usage

```html
<!-- Synchronous -->
<script src='dist/resizeSensor.min.js'></script>

<!-- Asynchronous -->
<script>
    window.require(['resizeSensor'],
        function (resizeSensor) {
            resizeSensor.create(element, callback);
        }
    );
</script>
```

Please note that `resizeSensor.js` hooks into the AMD loading process if its available. It will register as a named 
module, so make sure your loader supports resolving and loading named modules. You might have to configure your loader.

## License

MIT (see LICENSE).