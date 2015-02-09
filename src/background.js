// TODO:
//    Add Alt+H combo with help dialog
//    Add custom urls (Alt+1, Alt+2, etc.)
//    Add settings page to manage features
//    Add option to choose badget text (new mail, activites, etc.)

(function() {
    
    "use strict";
    
    var PipedriveHelper = {
        
        init: function() {
            
            this._tabs = [];
            this._urlRegex  = /https:\/\/app.pipedrive.com/;
            this._startPage = 'https://app.pipedrive.com';
            this._baseUrl   = 'https://app.pipedrive.com/';
            
            this._addListeners();
            
            return this;
            
        },
        
        // set a couple of listeners to keep track of open Pipedrive tabs
        _addListeners: function() {
            
            var self = this;
            
            // watch for open tabs that navigate to Pipedrive
            chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
                self._isPipedriveTab(tab);
            });
            
            // watch for new Pipedrive tabs
            chrome.tabs.onCreated.addListener(function(tab) {
                self._isPipedriveTab(tab);
            });
            
            // monitor closed tabs and so we can stop watching them
            chrome.tabs.onRemoved.addListener(function(tabId, info) {
                self._ignoreTab(tabId);
            });
            
            // listen for clicks to the toolbar icon
            chrome.browserAction.onClicked.addListener(function (tab) {
                //TODO: check for and activate any open tab first
                chrome.tabs.create({
                    url: self._startPage
                });
            });
            
            // listen for messages from content script
            chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) {
                // handle registered keyboard shorcuts (defined in content script)
                if (request.action !== undefined) {
                    self._performAction(request);
                }
                
                // handle updates to activities count
                if (request.activities !== undefined) {
                    self._updateActivityCount(request);
                }
            });
            
            // listen for command shortcuts (defined in manifest.json)
            chrome.commands.onCommand.addListener(function(command) {
                self._executeCommand(command);
            });
            
        },
        
        _isPipedriveTab: function(tab) {
            
            if (tab.status !== "complete")
                return;
            
            if (this._urlRegex.test(tab.url)) {
                // tab has a Pipedrive address
                this._watchTab(tab);
                return;
            }
            this._ignoreTab(tab.id);
            
        },
        
        _watchTab: function(tab) {
            
            this._tabs[tab.id] = tab.url;
            
        },
        
        _ignoreTab: function(tabId) {
            
            this._tabs.splice(tabId, 1);
            // was that the last Pipedrive tab?
            if (Object.keys(this._tabs).length < 1) {
                // hide the badge
                chrome.browserAction.setBadgeText({text:''});
            }
            
        },
        
        _performAction: function(request) {
            
            // send response to content script
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                chrome.tabs.sendMessage(tabs[0].id, {message: request.message+" OK"});
            });
            
            // navigate to the desired location
            this._navigate(this._baseUrl + request.action);
            
        },
            
        _updateActivityCount: function(request) {
            
            // send response to content script
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    message: "Activities ("+request.activities+") OK"
                });
            });
            
            var color = (request.activities == "0") ? [0, 255, 0, 128] : [255, 0, 0, 128];
            chrome.browserAction.setBadgeBackgroundColor({color: color});
            chrome.browserAction.setBadgeText({text: request.activities});
            
        },
        
        _executeCommand: function(command) {
            
            switch(command) {
                
                case "launch-in-current-tab":
                    console.log('Do launch-in-current-tab');
                    self.navigateTo(startPage);
                    break;
                    
                default:
                    // do nothing;
                    
            }
        
        },
        
        _navigateTo: function(url, tab) {
            
            var whichTab = (tab !== undefined) ? tab.id : null;
            // null represents the active tab
            chrome.tabs.update(whichTab, {url: url})
            
        }
        
    };
    
    var ph = PipedriveHelper.init();
    
})();
