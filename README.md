# GM Common API - GMCommonAPI.js

GM Common API (GMC) is a library designed for _easily adding **Greasemonkey 4** compatibility_ to existing userscripts.

With the [introduction of the Greasemonkey 4 WebExtension](http://www.greasespot.net/2017/09/greasemonkey-4-announcement.html), the classic GM_\* "synchronous" API is replaced with a new GM.\* "asynchronous API". The _features_ of the new API in Greasemonkey 4 (GM4) are very similar to the classic API, but all the functions are _asynchronous_. This means you might need to (learn asynchronous programming and) do some refactoring of your existing userscripts to make use of the new API in GM4.

**As an _alternative_ to refactoring your code, GMC offers a "synchronous subset" of the GM APIs** which works with scripts running in both the new GM4, the older versions of Greasemonkey, and in other userscript managers like Tampermonkey and Violentmonkey. Where APIs are supported in GMC, no refactoring of your script is needed; Simply add the needed \@require declaration (and eventually some \@grant declarations) to your userscript, and replace the use of GM_\* methods with equivalent GMC.\* methods.

You can add GMC to your userscript by adding (some of the) following declarations to the Meta data block:

    // @grant   GM_registerMenuCommand
    // @grant   GM_getResourceURL
    // @grant   GM_setValue
    // @grant   GM_getValue
    // @grant   GM_deleteValue
    // @grant   GM_listValues
    // @grant   GM_log
    // @grant   GM.setClipboard
    // @grant   GM_setClipboard
    // @grant   GM_addStyle
    // @grant   GM_openInTab
    // @require https://github.com/StigNygaard/GMCommonAPI.js/raw/master/GMCommonAPI.js

Depending on which features you need to use, not all grants are required. Currently you need to check [comments in the sourcecode](https://raw.githubusercontent.com/StigNygaard/GMCommonAPI.js/master/GMCommonAPI.js) to find the needed \@grant declarations for each method (**todo:** Document it in this README).

Currently implemented methods and properties in GMCommonAPI.js are:

- GMC.info
- GMC.registerMenuCommand(caption, commandFunc, accessKey)  **- This creates a page _context menu_ in GM4/Firefox**
- GMC.registerMenuCommand(caption, commandFunc, options)  **- This creates a page _context menu_ in GM4/Firefox**
- GMC.getResourceURL(resourceName)
- GMC.getResourceUrl(resourceName)
- GMC.setValue(name, value)  **- See compatibility comment in source code!**
- GMC.getValue(name, defvalue)
- GMC.deleteValue(name)
- GMC.listValues()
- GMC.setLocalStorageValue(name, value)
- GMC.getLocalStorageValue(name, defvalue)
- GMC.deleteLocalStorageValue(name)
- GMC.listLocalStorageValues()
- GMC.setSessionStorageValue(name, value)
- GMC.getSessionStorageValue(name, defvalue)
- GMC.deleteSessionStorageValue(name)
- GMC.listSessionStorageValues()
- GMC.log(message)
- GMC.setClipboard(text)
- GMC.addStyle(style)
- GMC.openInTab(url)

You can include GMCommonAPI.js here from GitHub, but you can also [find GM Common API on Greasy Fork](https://greasyfork.org/scripts/34527). To include latest version from Greasy Fork, use:
 
    // @require https://greasyfork.org/scripts/34527/code/GMCommonAPI.js

To freeze the version included from Greasy Fork, use the _version_ parameter [as shown on Greasy Fork](https://greasyfork.org/scripts/34527). For example:

    // @require https://greasyfork.org/scripts/34527/code/GMCommonAPI.js?version=229082

You can also just copy the complete (or the needed parts of the) javascript code into your userscript if you prefer to do it so. I consider the code Public Domain. 

Notice, if you are ready to use an asynchronous API in your userscript (including the refactoring probably needed), you can use a library wrapping the classic API into the new asynchronous API. This will give you a larger cross-compatible API than using GMC. Adapting your userscripts to use an asynchronous cross-compatible API like [gm4-polyfill.js](https://github.com/greasemonkey/gm4-polyfill) is the recommended way to go forward for _optimal_ performance and "API completeness". GMC might just be a bit easier and faster to use for some of us.
