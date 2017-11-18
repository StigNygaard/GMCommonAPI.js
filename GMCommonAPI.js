/*
 *      GM Common API is a library for userscripts. A "Synchronious API" compatible
 *      with both Greasemonkey 4 WebExtension and all the other commonly used
 *      userscript managers. Using GM Common API can be a fast and easy way to add
 *      Greasemonkey 4 WebExtension compatibility to (some) existing userscripts.
 *
 *      https://greasyfork.org/scripts/34527-gmcommonapi-js
 *      https://github.com/StigNygaard/GMCommonAPI.js
 */


var GMC = GMC || {

    // CHANGELOG - The most important updates/versions:
    changelog : [
        {version: '2017.11.11', description: 'Advanced options for menus (Via GMC.registerMenuCommand() using new options parameter).'},
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
     *  GMC.registerMenuCommand(caption, commandFunc, options)
     *
     *  Currently the GM4 API is missing GM.registerMenuCommand, but luckily Firefox supports HTML5
     *  context menus, which are created by this method when supported (Currently only supported by
     *  the Firefox family). AccessKey is currently ignored for context menus.
     *  Instead of the accessKey string parameter, there's an option to pass an options object
     *  adding multiple configuration options for fine-tuning menus. Example:
     *    GMC.registerMenuCommand( 'Hide the top', toggleTop , {accessKey: 'T', type: 'checkbox', checked: isHiddenTop()} );
     *  Currently supported properties in the options object are:
     *    accessKey, topLevel, id, name, type, checked, disabled & icon.
     *  Todo: Document the properties in the options object.
     *
     *  Grants:
     *  GM_registerMenuCommand
     *  GM.registerMenuCommand (Optional for possible future support. Currently not available with any userscript manager)
     */
    registerMenuCommand: function(caption, commandFunc, options) {
        if (typeof options === 'string') {
            options = {'accessKey': options};
        } else if (typeof options === 'undefined') {
            options = {};
        }
        // "Legacy" menu:
        if (!options['disabled']) {
            let prefix = '';
            if (options['type'] === 'radio') {
                prefix = options['checked'] ? '\u26AB ' : '\u26AA '; // ⚫/⚪
            } else if (options['type'] === 'checkbox') {
                prefix = options['checked'] ? '\u2B1B ' : '\u2B1C '; // ⬛/⬜
            }
            if (typeof GM_registerMenuCommand === 'function') {
                // Supported by most userscript managers, but NOT with Greasemonkey 4 WebExtension
                GM_registerMenuCommand(prefix + caption, commandFunc, options['accessKey']);
            } else if (GM && typeof GM.registerMenuCommand === 'function') {
                // NOT implemented in Greasemonkey 4.0 WebExtension, but if later?...
                GM.registerMenuCommand(prefix + caption, commandFunc, options['accessKey']);
            }
        }
        // HTML5 context menu (currently only supported by the Firefox family):
        if (GMC.contextMenuSupported()) {
            if (!document.body) {
                alert('GMC Error: Body element for context menu not found. If running userscript at "document-start" you might need to delay initialization of menus.');
                return;
            }
            let topMenu = null;
            if (document.body.getAttribute('contextmenu')) {
                // If existing context menu on body, don't replace but use/extend it...
                topMenu = document.querySelector('menu#' + document.body.getAttribute('contextmenu'));
            }
            if (!topMenu) {
                // if not already defined, create the "top menu container"
                topMenu = document.createElement('menu');
                topMenu.setAttribute('type', 'context');
                topMenu.setAttribute('id', 'gm-registered-menu');
                document.body.appendChild(topMenu);
                document.body.setAttribute('contextmenu', topMenu.getAttribute('id'));
            }
            // Create menu item
            let menuItem = document.createElement('menuitem');
            menuItem.setAttribute('type', options['type'] ? options['type'] : 'command'); // command, checkbox or radio
            menuItem.setAttribute('label', caption);
            if (options['id']) menuItem.setAttribute('id', options['id']);
            if (options['name']) menuItem.setAttribute('name', options['name']);
            if (options['checked']) menuItem.setAttribute('checked', 'checked');
            if (options['disabled']) menuItem.setAttribute('disabled', 'disabled');
            if (options['icon']) menuItem.setAttribute('icon', options['icon']); // does icon work on radio/checkbox or only command?
            // Append menuitem
            if (options['topLevel']) {
                topMenu.appendChild(menuItem)
            } else { // script menu
                let scriptMenu = topMenu.querySelector('menu[label="' + GMC.getScriptName() + '"]');
                if (!scriptMenu) {
                    // if not already defined, create a "sub-menu" for current userscript
                    scriptMenu = document.createElement('menu');
                    scriptMenu.setAttribute('label', GMC.getScriptName());
                    // icon = @icon from metadata??? NO, icon not working for menu elements :-(
                    topMenu.appendChild(scriptMenu);
                }
                scriptMenu.appendChild(menuItem);
            }
            menuItem.addEventListener('click', commandFunc, false);
        }
    },


    /*
     *  GMC.getResourceURL(resourceName)
     *  GMC.getResourceUrl(resourceName)
     *
     *  This will use GM_getResourceURL if available, and otherwise try to find an url directly via
     *  the GMC.info object properties.
     *  Grants:
     *  GM_getResourceURL
     */
    getResourceUrl: function(resourceName) {
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
            alert('GMC Error: Cannot find url of resource=' + resourceName + ' in GMC.info object');
        } else {
            alert('GMC Error: Cannot lookup resourceURL (Missing @grant for GM_getResourceURL?)');
        }
    },
    getResourceURL: function(resourceName) {
        return GMC.getResourceUrl(resourceName);
    },


    /*
     *  GMC.setValue(name, value)
     *
     *  When supported, this points to GM_setValue which stores values in a userscript specific
     *  database. Otherwise the HTML5 Web Storage is used, which is a domain(+protocol) specific
     *  database in the browser.
     *  IMPORTANT: If your userscript is a "single-domain type", the difference in storage type is
     *  probably not a problem, but for "multiple-domain userscripts" GMC.setValue() might not be a
     *  satisfying solution.
     *  To prevent mistakenly overwriting or reading other clientscript's values when using Web
     *  Storage, a prefix based on userscript namespace and scriptname is added to name used in Web
     *  Storage.
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
     *  Deletes a value stored using GMC.setValue(). When supported via GM_deleteValue and otherwise
     *  from HTML5 Web Storage.
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
     *  Returns the values (key-names) stored using GMC.setValue(). When supported via GM_listValues
     *  and otherwise from HTML5 Web Storage.
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
     *  database in the browser. To prevent mistakenly overwriting or reading other clientscript's
     *  values when using Web Storage, a prefix based on userscript namespace and scriptname is added
     *  to the name used in Web Storage.
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
     *  Similar to setLocalStorageValue(), but setSessionStorageValue() only stores for the current
     *  session.
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
     *  Writes a log-line to the console. It will use GM_log if supported/granted, otherwise
     *  it will do it using window.console.log().
     *  Grants:
     *  GM_log
     */
    log: function(message) {
        if(typeof GM_log === 'function') {
            GM_log(message);
        } else if (window.console) {
            if (GMC.info) {
                window.console.log(GMC.getScriptNamespace() + GMC.getScriptName() + ' : ' + message);
            } else {
                window.console.log('GMC logline : ' + message);
            }
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
     *  GM_addStyle (Optional. Will be used when available, but this method should normally work fine without)
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
        alert('GMC Error: Unable to add style element to head element. If running userscript at "document-start" you might need to delay initialization of styles.');
    },


    /*
     *  GMC.openInTab(url)
     *
     *  Opens url in a new tab (or window). If GM_openInTab ain't supported window.open is used
     *  instead. In most browsers/configurations this will open as a tab anyway (but no guarantee).
     *  Grants:
     *  GM_openInTab
     */
    openInTab: function(url) {
        if (typeof GM_openInTab === 'function') {
            return GM_openInTab(url);
        }
        return window.open(url);
    },


    /*
     *  GMC.xmlHttpRequest(details)
     *  GMC.xmlhttpRequest(details)
     *
     *  Forwards to either GM_xmlhttpRequest or GM.xmlHttpRequest.
     *  Notice that (currently?) GM.xmlHttpRequest() in Greasemonkey 4 does not return a function
     *  to use for abortion. In this case GMC.xmlHttpRequest will return a function which just
     *  writes a line to the console log.
     *  When adding @grant declarations, make sure to take notice of the case differences between
     *  the APIs. GMC supports both case-variants (GMC.xmlHttpRequest and GMC.xmlhttpRequest).
     *  Also remember to add needed @connect declarations for Tampermonkey:
     *  https://tampermonkey.net/documentation.php#_connect
     *
     *  Grants:
     *  GM.xmlHttpRequest
     *  GM_xmlhttpRequest
     */
    xmlHttpRequest: function(details) {
        if (typeof GM_xmlhttpRequest === 'function') {
            return GM_xmlhttpRequest(details);
        } else if (typeof GM.xmlHttpRequest === 'function') {
            let abort = GM.xmlHttpRequest(details);
            if (typeof abort !== 'function') abort = function() {GMC.log('Sorry, xmlHttpRequest abort function does not work in current setup!');};
            return abort;
        }
        alert('GMC Error: xmlHttpRequest not found! Missing or misspelled @grant declaration? (Be aware of case differences in the APIs!)');
    },
    xmlhttpRequest: function(details) {
        return GMC.xmlHttpRequest(details);
    },


    /*
     *  GMC.getScriptName()
     *
     *  Simply returns script name as defined in meta data. If no name was defined, returns "Userscript".
     *  Grants: none needed.
     */
    getScriptName: function() {
        if (typeof GMC.info.script.name === 'string' && GMC.info.script.name.trim().length > 0) {
            return GMC.info.script.name.trim();
        } else {
            return 'Userscript';
        }
    },


    /*
     *  GMC.getScriptNamespace()
     *
     *  Simply returns the script's namespace as defined in meta data.
     *  Grants: none needed.
     */
    getScriptNamespace: function() {
        if (typeof GMC.info.script.namespace === 'string') {
            return GMC.info.script.namespace.trim();
        } else {
            return '';
        }
    },


    // Internal, temporary and experimental stuff:
    isGreasemonkey4up: function() {
        if (typeof GMC.info.scriptHandler === 'string' && typeof GMC.info.version === 'string') {
            return GMC.info.scriptHandler === 'Greasemonkey' && parseInt(GMC.info.version,10)>=4;
        }
        return false;
    },
    contextMenuSupported: function() { // Argh, it's a bit ugly, not 100% accurate (and probably not really necessary)
        let oMenu = document.createElement('menu');
        return (oMenu.type !== 'undefined'); // type="list|context|toolbar" if supported ?
    },
    getScriptIdentifier: function() { // A "safe" identifier without any special characters (but doesn't work well for non-latin :-/ )
        if (GMC.info && typeof GMC.info.script === 'object') {
            return 'gmc' + GMC.getScriptNamespace().replace(/[^\w]+/g,'x') + GMC.getScriptName().replace(/[^\w]+/g,'x');
        } else {
            alert('GMC Error: Script Namespace or Name not found.');
        }
    },
    inspect: function(obj) { // for some debugging
        let output='';
        Object.keys(obj).forEach(function(key, idx) {
            output+=key+': ' + typeof obj[key] + ((typeof obj[key] === 'string' || typeof obj[key] === 'boolean' || typeof obj[key] === 'number') ? ' = ' + obj[key] : '') + '\n';
        });
        alert(output);
    }
};
