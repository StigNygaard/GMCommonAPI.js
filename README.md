# GMCommonAPI.js

GMC is an API designed for easily adding Greasemonkey 4 compatibilty to existing userscripts.

GMC provides a common subset of the functionality offered by the new "asynchronized API" in Greasemonkey 4 (GM.\*) and the classic "synchronized API" from other userscript managers (GM_\*), offered in a single "classic" _synchronized API_ (GMC.\*).

With the introduction of the Greasemonkey 4 WebExtension (currently in beta [todo: link]), the classic GM_\* "synchronious" API is replaced with a new GM.\* "asynchronious API". The features of the new API in Greasemonkey 4 (GM4) are very similar to the classic API, but the functions are asynchronious. This means you might need to (learn asynchronious programming and) do some refactoring of your existing userscripts to make use of the new GM4 API.

As an alernative to refactoring your code, GMC offers a "synchronious subset" of the GM APIs, which works with both scripts running in the new GM4, in the older versions of Greasemonkey, and in other userscript managers (Tampermonkey, Violentmonkey etc). Where APIs are supported in GMC, no refactoring of your script is needed; Simply [todo: add GMC script/grants and] replace the use of GM_\* methods in your script with equialent GMC.\* methods.

[todo: How to add GMC script and grants]

[todo: Table: GMC method, Required Grants, GM_\*, GM.\*, description/comment]

Notice, if you are ready to use an asynchronious API in your scripts, using a library wrapping the classic API into a new asynchronious API, can give you a larger cross-compatible API than using GMC. Adapting your userscripts to use an asynchroniuos cross-compatible API like polyfill.js [todo: link] is the recommended way to go forward for optimal performance and "API completeness".

[todo: spellcheck]
