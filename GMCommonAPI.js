/*
 *      GM Common API is a library for userscripts. A "Synchronious API" compatible with
 *      both the new/upcoming Greasemonkey 4 WebExtension and all the other commonly used
 *      userscript managers. Using GM Common API can be a fast and easy way to add
 *      Greasemonkey 4 WebExtension compatibility to (some) existing userscripts.
 *
 *      https://greasyfork.org/scripts/34527-gmcommonapi-js
 *      https://github.com/StigNygaard/GMCommonAPI.js
 */


var GMC = GMC || {

    // CHANGELOG - The most important updates/versions:
    changelog : [
        {version: '2017.11.01', description: 'Minor optimizations.'},
        {version: '2017.10.29', description: 'Adding GMC.listValues(), GMC.listLocalStorageValues() and GMC.listSessionStorageValues().'},
        {version: '2017.10.28', description: '@grant not needed for use of GM.info/GM_info.'},
        {version: '2017.10.25', description: 'Initial release.'}
    ],


    /*
     *  GMC.info
     *
     *  Maps to GM_info or GM.info object.
     *  Grants: none needed.
     */
    info: (GM_info ? GM_info : (GM && typeof GM.info === 'object' ? GM.info : null) ),


    /*
     *  GMC.registerMenuCommand(caption, commandFunc, accessKey)
     *
     *  Currently the GM4 API is missing GM.registerMenuCommand, but luckily Firefox supports HTML5 context
     *  menus, which are created by this method when supported (Currently only supported in Firefox).
     *  AccessKey is currently ignored in context menus.
     *  Grants:
     *  GM_registerMenuCommand
     *  GM.registerMenuCommand (Optional for possible future support. Currently not available in any userscript manager)
     */
    registerMenuCommand: function(caption, commandFunc, accessKey) {
        if (typeof GM_registerMenuCommand === 'function') {
            // Supported by most userscript extensions, but currently NOT in the upcoming Greasemonkey 4 WebExtension and it's new asynchronous API!
            GM_registerMenuCommand(caption, commandFunc, accessKey);
        } else if (GM && typeof GM.registerMenuCommand === 'function') {
            // Will probably NOT be implemented in the upcoming Greasemonkey 4 WebExtension, but if?...
            GM.registerMenuCommand(caption, commandFunc, accessKey);
        }
        if (GMC.contextMenuSupported() && document.body) {
            // if (!document.body) {
            //     alert('Error: body for context menu not found.');
            //     return;
            //      If too early, maybe set it up on pageload event???
            // }
            // Setup HTML5 contextmenu on page - Currently only supported in Firefox...
            let menuContainer = null;
            if (document.body.getAttribute('contextmenu')) {
                // If existing context menu on body, don't replace but use it...
                menuContainer = document.querySelector('menu#'+document.body.getAttribute('contextmenu'));
            }
            if (!menuContainer) {
                // if not already exist, create the "top menu container"
                menuContainer = document.createElement("menu");
                menuContainer.setAttribute('type', 'context');
                menuContainer.id = 'gm-registered-menu'; // or gmcmenu
                document.body.appendChild(menuContainer);
            }
            document.body.setAttribute('contextmenu', menuContainer.id);
            let scriptMenu = document.querySelector('menu#menu'+GMC.getScriptIdentifier());
            if (!scriptMenu) {
                // if not already exist, create "sub-menu" for current userscript
                scriptMenu = document.createElement("menu");
                scriptMenu.setAttribute('label', GMC.getScriptName());
                scriptMenu.id = 'menu'+GMC.getScriptIdentifier();
                menuContainer.appendChild(scriptMenu);
            }
            // create menu item
            let menuItem = document.createElement("menuitem");
            menuItem.setAttribute('label', caption);
            scriptMenu.appendChild(menuItem);
            menuItem.addEventListener('click',commandFunc, false);
        }
    },


    /*
     *  GMC.getResourceURL(resourceName)
     *  GMC.getResourceUrl(resourceName)
     *
     *  This will use GM_getResourceURL if available, and otherwise try to find an url
     *  directly via GM.info object properties.
     *  Grants:
     *  GM_getResourceURL
     */
    getResourceURL: function(resourceName) {
        if (typeof GM_getResourceURL === 'function') {
            return GM_getResourceURL(resourceName);
        } else if (GMC.info) {
            if (typeof GMC.info.script === 'object' && typeof GMC.info.script.resources === 'object' && typeof GMC.info.script.resources[resourceName] === 'object' && GMC.info.script.resources[resourceName].url) {
                return GMC.info.script.resources[resourceName].url;
            } else if (GMC.info.scriptMetaStr) {
                // Parse metadata block to find the original "remote url" instead:
                let ptrn = new RegExp('^\\s*\\/\\/\\s*@resource\\s+([^\\s]+)\\s+([^\\s]+)\\s*$','im');
                let a = GMC.info.scriptMetaStr.match(ptrn);
                if (a) {
                    return a[2];
                }
            }
            alert('Error: Cannot find url of resource=' + resourceName + ' in GMC.info object');
        } else {
            alert('Error: Cannot lookup resourceURL (Missing @grant for GM_getResourceURL?)');
        }
    },
    getResourceUrl: function(resourceName) {
        return GMC.getResourceURL(resourceName);
    },


    /*
     *  GMC.setValue(name, value)
     *
     *  When supported, this points to GM_setValue which stores values in a userscript specific database.
     *  Otherwise the HTML5 Web Storage is used, which is a domain(+protocol) specific database in the
     *  browser.
     *  IMPORTANT: If your userscript is a "single-domain type", the difference in storage type is probably
     *  not a problem, but for "multiple-domain userscripts" GMC.setValue() might not be a satisfying
     *  solution.
     *  To prevent mistakenly overwriting or reading other clientscript's values when using Web Storage, a
     *  prefix based on userscript namespace and scriptname is added to name used in Web Storage.
     *  Grants:
     *  GM_setValue
     */
    setValue: function(name, value) {
        if (typeof GM_setValue === 'function') {
            GM_setValue(name, value);
        } else {
            GMC.setLocalStorageValue(name, value);
        }
    },


    /*
     *  GMC.getValue(name, defvalue)
     *
     *  Get the values stored using GMC.setValue(). When supported via GM_getValue and otherwise from
     *  HTML5 Web Storage.
     *  Grants:
     *  GM_getValue
     */
    getValue: function(name, defvalue) { // getLocalStorageValue: function(name, defvalue) {
        if (typeof GM_getValue === 'function') {
            return GM_getValue(name, defvalue);
        } else {
            return GMC.getLocalStorageValue(name, defvalue);
        }
    },


    /*
     *  GMC.deleteValue(name)
     *
     *  Deletes a value stored using GMC.setValue(). When supported via GM_deleteValue and otherwise from
     *  HTML5 Web Storage.
     *  Grants:
     *  GM_deleteValue
     */
    deleteValue: function(name) {
        if (typeof GM_deleteValue === 'function') {
            GM_deleteValue(name);
        } else {
            GMC.deleteLocalStorageValue(name);
        }
    },


    /*
     *  GMC.listValues()
     *
     *  Returns the values (key-names) stored using GMC.setValue(). When supported via GM_listValues and
     *  otherwise from HTML5 Web Storage.
     *  Grants:
     *  GM_listValues
     */
    listValues: function() {
        if (typeof GM_listValues === 'function') {
            return GM_listValues();
        } else {
            return GMC.listLocalStorageValues();
        }
    },


    /*
     *  GMC.setLocalStorageValue(name, value)
     *
     *  Save value in HTML5 Web Storage (window.localStorage), which is a domain(+protocol) specific
     *  database in the browser. To prevent mistakenly overwriting or reading other clientscript's values
     *  when using Web Storage, a prefix based on userscript namespace and scriptname is added to the name
     *  used in Web Storage.
     *  Grants: none needed.
     */
    setLocalStorageValue: function(name, value) {
        localStorage.setItem(GMC.getScriptIdentifier() + '_' + name, value);
    },


    /*
     *  GMC.getLocalStorageValue(name, defvalue)
     *
     *  Get a value that was stored using GMC.setLocalStorageValue().
     *  Grants: none needed.
     */
    getLocalStorageValue: function(name, defvalue) {
        if ((GMC.getScriptIdentifier()+'_'+name) in localStorage) {
            return localStorage.getItem(GMC.getScriptIdentifier()+'_'+name);
        } else {
            return defvalue;
        }
    },


    /*
     *  GMC.deleteLocalStorageValue(name)
     *
     *  Deletes a value that was stored using GMC.setLocalStorageValue().
     *  Grants: none needed.
     */
    deleteLocalStorageValue: function(name) {
        localStorage.removeItem(GMC.getScriptIdentifier() + '_' + name);
    },


    /*
     *  GMC.listLocalStorageValues()
     *
     *  Returns the values (key-names) stored using GMC.setLocalStorageValue().
     *  Grants: none needed.
     */
    listLocalStorageValues: function() {
        let values = [];
        let prefix = GMC.getScriptIdentifier();
        let prelen = GMC.getScriptIdentifier().length;
        for (let i = 0; i < localStorage.length; i++) {
            if (localStorage.key(i).substr(0, prelen) === prefix) {
                values.push(localStorage.key(i).substr(prelen+1));
            }
        }
        return values;
    },


    /*
     *  GMC.setSessionStorageValue(name, value)
     *
     *  Similar to setLocalStorageValue(), but setSessionStorageValue() only stores for the current session.
     *  Grants: none needed.
     */
    setSessionStorageValue: function(name, value) {
        sessionStorage.setItem(GMC.getScriptIdentifier() + '_' + name, value);
    },


    /*
     *  GMC.getSessionStorageValue(name, defvalue)
     *
     *  Get a value that was stored using GMC.setSessionStorageValue().
     *  Grants: none needed.
     */
    getSessionStorageValue: function(name, defvalue) {
        if ((GMC.getScriptIdentifier()+'_'+name) in localStorage) {
            return sessionStorage.getItem(GMC.getScriptIdentifier()+'_'+name);
        } else {
            return defvalue;
        }
    },


    /*
     *  GMC.deleteSessionStorageValue(name)
     *
     *  Deletes a value that was stored using GMC.setSessionStorageValue().
     *  Grants: none needed.
     */
    deleteSessionStorageValue: function(name) {
        sessionStorage.removeItem(GMC.getScriptIdentifier() + '_' + name);
    },


    /*
     *  GMC.listSessionStorageValues()
     *
     *  Returns the values (key-names) stored using GMC.setSessionStorageValue().
     *  Grants: none needed.
     */
    listSessionStorageValues: function() {
        let values = [];
        let prefix = GMC.getScriptIdentifier();
        let prelen = GMC.getScriptIdentifier().length;
        for (let i = 0; i < sessionStorage.length; i++) {
            if (sessionStorage.key(i).substr(0, prelen) === prefix) {
                values.push(sessionStorage.key(i).substr(prelen+1));
            }
        }
        return values;
    },


    /*
     *  GMC.log(message)
     *
     *  Write a log-line to console. Uses GM_log if supported, otherwise directly via window.console.log().
     *  Grants:
     *  GM_log
     */
    log: function(message) {
        if(typeof GM_log === 'function') {
            GM_log(message);
        } else if (window.console) {
            window.console.log(GMC.getScriptNamespace() + GMC.getScriptName() + ' : ' + message);
        }
    },


    /*
     *  GMC.setClipboard(text)
     *
     *  Sets content of the clipboard by using either GM.setClipboard or GM_setClipboard.
     *  Grants:
     *  GM.setClipboard
     *  GM_setClipboard
     */
    setClipboard: (typeof GM_setClipboard === 'function' ? GM_setClipboard : (typeof GM === 'object' && GM !== null && typeof GM.setClipboard === 'function' ? GM.setClipboard : null) ),


    /*
     *  GMC.addStyle(style)
     *
     *  Adds style in a an element in html header.
     *  Grants:
     *  GM_addStyle (Optional. Will be used when available, but this method should normally also work without)
     */
    addStyle: function(style) {
        if (typeof GM_addStyle === 'function') {
            return GM_addStyle(style);
        }
        let head = document.getElementsByTagName('head')[0];
        if (head) {
            let styleElem = document.createElement('style');
            styleElem.setAttribute('type', 'text/css');
            styleElem.textContent = style;
            head.appendChild(styleElem);
            return styleElem;
        }
        alert('Error: Unable to add style element in head.');
    },


    /*
     *  GMC.openInTab(url)
     *
     *  Opens url in a new tab (or window). If GM_openInTab ain't supported window.open is used instead.
     *  In most browsers/configurations this will open as a tab anyway (but no guarantee).
     *  Grants:
     *  GM_openInTab
     */
    openInTab: function(url) {
        if (typeof GM_openInTab === 'function') {
            return GM_openInTab(url);
        }
        return window.open(url);
    },



    getScriptName: function() {
        if (typeof GMC.info.script.name === 'string' && GMC.info.script.name.trim().length > 0) {
            return GMC.info.script.name.trim();
        } else {
            return 'Userscript';
        }
    },
    getScriptNamespace: function() {
        if (typeof GMC.info.script.namespace === 'string') {
            return GMC.info.script.namespace.trim();
        } else {
            return '';
        }
    },
    getScriptIdentifier: function() { // A "safe" identifier without any special characters
        if (GMC.info && typeof GMC.info.script === 'object') {
            return 'gmc' + GMC.getScriptNamespace().replace(/[^\w]+/g,'x') + GMC.getScriptName().replace(/[^\w]+/g,'x');
        } else {
            alert('Error: Script Namespace or Name not found.');
        }
    },
    contextMenuSupported: function() { // Argh, it's a bit ugly, not 100% accurate (and maybe unnecessary), but...
        let oMenu = document.createElement("menu");
        return (oMenu.type !== "undefined"); // type="list|context|toolbar" if supported ?
    },

};
