$(function(w, d){
  
  // receives message from background script
  chrome.extension.onMessage.addListener(function(message, sender) {
    if (message) {
      console.log('message', message);
    }
  });
  
  if (w == top) {
    w.addEventListener('keydown', function(e) {
      var page;
      console.log(e.keyCode);
      if (e.keyCode == 68 && !e.shiftKey && !e.ctrlKey && e.altKey && !e.metaKey) {
        // alt-d: goto deals pipeline view
        page = "pipeline";
      }
      if (e.keyCode == 76 && !e.shiftKey && !e.ctrlKey && e.altKey && !e.metaKey) {
        // alt-l: goto deals list view
        page = "deal";
      }
      if (e.keyCode == 84 && !e.shiftKey && !e.ctrlKey && e.altKey && !e.metaKey) {
        // alt-t: goto deals timeline view
        page = "timeline";
      }
      if (e.keyCode == 77 && !e.shiftKey && !e.ctrlKey && e.altKey && !e.metaKey) {
        // alt-m: goto mail
        page = "mailbox";
      }
      if (e.keyCode == 65 && !e.shiftKey && !e.ctrlKey && e.altKey && !e.metaKey) {
        // alt-a: goto activities
        page = "activities";
      }
      if (e.keyCode == 80 && !e.shiftKey && !e.ctrlKey && e.altKey && !e.metaKey) {
        // alt-p: goto people
        page = "people";
      }
      if (e.keyCode == 79 && !e.shiftKey && !e.ctrlKey && e.altKey && !e.metaKey) {
        // alt-o: goto organizations
        page = "org"
      }
      if (e.keyCode == 83 && !e.shiftKey && !e.ctrlKey && e.altKey && !e.metaKey) {
        // alt-s: goto statistics
        page = "company/details"
      }
      if (e.keyCode == 88 && !e.shiftKey && !e.ctrlKey && e.altKey && !e.metaKey) {
        // alt-x: goto settings
        page = "settings"
      }
      if (e.keyCode == 191 && !e.shiftKey && !e.ctrlKey && !e.altKey && !e.metaKey) {
        // pressed forward slash for search – /
        e.preventDefault();
        d.getElementsByName("needle")[0].focus();
        return;
      }
    
      // sends message to background script
      chrome.runtime.sendMessage({action: page}, function(response) {
        console.log(response.message);
      });
      return;
    }, false);
  };
  
  
  // Pipedrive uses a lot of dynamically loaded elements.  We'll need to get tricky
  // to grab DOM elements when they are actually available.
  var loaded = false;
  $(d).bind("DOMSubtreeModified", function() {
    // is the menu loaded yet?
    var active = $("li.key-activities a span.count").text();
    
    var count = (active.length > 0) ? active : "0";
    // sends message to background script
    chrome.runtime.sendMessage({activities: count}, function(response) {
      console.log("response.message", response.message);
    });
  });

}(window, document));