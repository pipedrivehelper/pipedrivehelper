/*(function() {
  // receives message from popup script
  chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) {
    if (request.opened == true) {
      // sends response back to popup script
      sendResponse({example: "goodbye"});

      // sends response to content script
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { logUrl: true } );
      });
    }
  });
})();*/


// TODO:
//    Cleanup code and refactor
//    Add Alt+H combo with help dialog
//    Add custom urls (Alt+1, Alt+2, etc.)
//    Add settings page to manage features
//    Add option to choose badget text (new mail, activites, etc.)

chrome.commands.getAll(function(commands) {
  console.debug(commands);
});

(function(w) {
  // Idea based loosely on Lee Turner's GreaseMonkey script for Firefox
  // http://blog.pipedrive.com/2015/01/pipedrive-users-tricks-and-hacks/
  
  var PipedriveHelper = function PipedriveHelper() {
    
    var self = this;
    tabs = [];
    
    var urlRegex = /https:\/\/app.pipedrive.com/;
    var startPage = 'https://app.pipedrive.com';
    var baseUrl = 'https://app.pipedrive.com/';
    
    // set a couple of listeners to keep track of open Pipedrive tabs
    
    // watch for open tabs that navigate to Pipedrive
    chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
      isPipedriveTab(tab);
    });
    
    // watch for new Pipedrive tabs
    chrome.tabs.onCreated.addListener(function(tab) {
      isPipedriveTab(tab);
    });
    
    // monitor closed tabs and so we can stop watching them
    chrome.tabs.onRemoved.addListener(function(tabId, info) {
      ignoreTab(tabId);
    });
    
    var isPipedriveTab = function isPipedriveTab(tab) {
      if (tab.status !== "complete")
        return;
      if (urlRegex.test(tab.url)) {
        // tab has a Pipedrive address
        watchTab(tab);
        return;
      }
      ignoreTab(tab.id);
    };
    
    var watchTab = function watchTab(tab) {
      tabs[tab.id] = tab.url;
    };
    
    var ignoreTab = function ignoreTab(tabId) {
      tabs.splice(tabId, 1);
      // was that the last Pipedrive tab?
      if (Object.keys(tabs).length < 1) {
        // hide the badge
        chrome.browserAction.setBadgeText({text:''});
      }
    };
    
    chrome.browserAction.onClicked.addListener(function (tab) {
      //TODO: check for and activate any open tab first
      chrome.tabs.create({
        url: startPage
      });
    });
    
    // receives message from content script
    chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) {
      if (request.action !== undefined) {
        // sends response to popup script
        //sendResponse({text: request.message+" OK"});

        // sends response to content script
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
          chrome.tabs.sendMessage(tabs[0].id, {message: request.message+" OK"});
        });
        
        // navigate to the desired location
        console.log(baseUrl);
        var url = baseUrl + request.action;
        self.navigateTo(url);
      }
      
      if (request.activities !== undefined) {
        // sends response to content script
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
          chrome.tabs.sendMessage(tabs[0].id, {
            message: "Activities ("+request.activities+") OK"
          });
        });
        
        chrome.browserAction.setBadgeText({
          text: request.activities
        });
        
        var color = (request.activities == "0") ? [0, 255, 0, 128] : [255, 0, 0, 128];
        chrome.browserAction.setBadgeBackgroundColor({
          color: color
        });
      }
    });
    
    chrome.commands.onCommand.addListener(function(command) {
      console.log('Command:', command);
      
      switch(command) {
        
        case "launch-in-current-tab":
          console.log('Do launch-in-current-tab');
          self.navigateTo(startPage);
          break;
          
        default:
          // do nothing;
          
      }
    
    });
    
    self.navigateTo = function navigateTo(url, tab) {
      console.log('Navigate to:', url);
      var whichTab = (tab !== undefined) ? tab.id : null;
      // null represents the active tab
      chrome.tabs.update(whichTab, {
        url: url
      })
    };
    
  }
  
  var ph = new PipedriveHelper();
  
})(window);
