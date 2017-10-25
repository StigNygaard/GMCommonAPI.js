# GM Common Library - GMCommonAPI.js

GM Common Library (GMC) is an API designed for easily adding Greasemonkey 4 compatibility to existing userscripts.

GMC provides a common subset of the functionality offered by the new "asynchronous API" in Greasemonkey 4 (GM.\*) and the classic "synchronous API" from other userscript managers (GM_\*), offered in a single "classic" _synchronous API_ (GMC.\*).

With the [introduction of the Greasemonkey 4 WebExtension](http://www.greasespot.net/2017/09/greasemonkey-4-announcement.html) ([currently in beta](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/versions/beta)), the classic GM_\* "synchronous" API is replaced with a new GM.\* "asynchronous API". The _features_ of the new API in Greasemonkey 4 (GM4) are very similar to the classic API, but the functions are asynchronous. This means you might need to (learn asynchronous programming and) do some refactoring of your existing userscripts to make use of the new API in GM4.

As an alternative to refactoring your code, GMC offers a "synchronous subset" of the GM APIs, which works with scripts running in both the new GM4, in the older versions of Greasemonkey, and in other userscript managers like Tampermonkey and Violentmonkey. Where APIs are supported in GMC, no refactoring of your script is needed; Simply add GMC @require/@grants in your userscript and replace the use of GM_\* methods with equivalent GMC.\* methods.

**todo**: How to add GMC script and grants

**todo**: Table: GMC method, Required Grants, GM_\*, GM.\*, description/comment

- GMC.info
- GMC.registerMenuCommand(caption, commandFunc, accessKey)
- GMC.getResourceURL(resourceName)
- GMC.setValue(name, value)
- GMC.getValue(name, defvalue)
- GMC.deleteValue(name)
- GMC.setLocalStorageValue(name, value)
- GMC.getLocalStorageValue(name, defvalue)
- GMC.deleteLocalStorageValue(name)
- GMC.setSessionStorageValue(name, value)
- GMC.getSessionStorageValue(name, defvalue)
- GMC.deleteSessionStorageValue(name)
- GMC.log(message)
- GMC.setClipboard(text)
- GMC.addStyle(style)
- GMC.openInTab(url)

Notice, if you are ready to use an asynchronous API in your scripts, using a library wrapping the classic API into a new asynchronous API, can give you a larger cross-compatible API than using GMC. Adapting your userscripts to use an asynchronous cross-compatible API like [greasemonkey4-polyfill.js](https://arantius.com/misc/greasemonkey/imports/greasemonkey4-polyfill.js) is the recommended way to go forward for optimal performance and "API completeness".
