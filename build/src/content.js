$(function(w, d){
    
    // Inspiration from Lee Turner's GreaseMonkey script for Firefox
    // http://blog.pipedrive.com/2015/01/pipedrive-users-tricks-and-hacks/
    
    "use strict";
    
    // listen for messages from background script
    chrome.extension.onMessage.addListener(function(message, sender) {
        if (message) {
            // In production, do nothing.
            //console.log('message', message);
        }
    });
    
    // listen for keyboard shortcuts and dispatch notifications to the background script
    if (w == top) {
        w.addEventListener('keydown', function(e) {
            var page = null;
            
            // alt-d: goto deals pipeline view
            if (e.keyCode == 68 && !e.shiftKey && !e.ctrlKey && e.altKey && !e.metaKey) {
                page = "pipeline";
                return;
            }
            
            // alt-l: goto deals list view
            if (e.keyCode == 76 && !e.shiftKey && !e.ctrlKey && e.altKey && !e.metaKey) {
                page = "deal";
            }
            
            // alt-t: goto deals timeline view
            if (e.keyCode == 84 && !e.shiftKey && !e.ctrlKey && e.altKey && !e.metaKey) {
                page = "timeline";
            }
            
            // alt-m: goto mail
            if (e.keyCode == 77 && !e.shiftKey && !e.ctrlKey && e.altKey && !e.metaKey) {
                page = "mailbox";
            }
            
            // alt-a: goto activities
            if (e.keyCode == 65 && !e.shiftKey && !e.ctrlKey && e.altKey && !e.metaKey) {
                page = "activities";
            }
            
            // alt-c: goto contacts (people)
            if (e.keyCode == 67 && !e.shiftKey && !e.ctrlKey && e.altKey && !e.metaKey) {
                page = "people";
            }
            
            // alt-o: goto organizations
            if (e.keyCode == 79 && !e.shiftKey && !e.ctrlKey && e.altKey && !e.metaKey) {
                page = "org";
            }
            
            // alt-s: goto statistics
            if (e.keyCode == 83 && !e.shiftKey && !e.ctrlKey && e.altKey && !e.metaKey) {
                page = "company/details";
            }
            
            // alt-x: goto settings
            if (e.keyCode == 88 && !e.shiftKey && !e.ctrlKey && e.altKey && !e.metaKey) {
                page = "settings";
            }
            
            // alt-+: add a new deal
            /*if (e.keyCode == 107 && !e.shiftKey && !e.ctrlKey && e.altKey && !e.metaKey ||
                e.keyCode == 187 && e.shiftKey && !e.ctrlKey && e.altKey && !e.metaKey) {
                page = "deal/add";
                //TODO: needs to load page in "#dialog" target
            }*/
            
            // alt-h: show modal help dialog
            if (e.keyCode == 72 && !e.shiftKey && !e.ctrlKey && e.altKey && !e.metaKey) {
                //TODO: implement a modal help dialog with shorcuts
                d.dispatchEvent(new Event("ph-modal"));
            }
            
            // pressed forward slash for search – /
            //if (e.keyCode == 191 && !e.shiftKey && !e.ctrlKey && !e.altKey && !e.metaKey) {
            // pressed ` for search
            if (e.keyCode == 192 && !e.shiftKey && !e.ctrlKey && !e.altKey && !e.metaKey) {
                e.preventDefault();
                d.getElementsByName("needle")[0].focus();
                return;
            }
            
            // TODO: detect and prevent successive alt presses and unlisted combinations
            if (page === null) {
                return;
            }
            
            // TODO: move outside function if implemented.
            // sends message to background script with action
            chrome.runtime.sendMessage({action: page}, function(response) {
                // In production, do nothing
                //console.log(response.message);
            });
            return;
            
        }, false);
    };
    
    // Get the current activity count.
    // Pipedrive uses a lot of dynamically loaded elements.    We'll need to get tricky
    // to grab DOM elements when they are actually available.
    // 
    // Listen for changes to the DOM tree
    $(d).bind("DOMSubtreeModified", function() {
        //TODO: Implement native JS element selector and remove jQuery dependency
        // is the menu loaded yet?
        var active = $("li.key-activities a span.count").text();
        var flag = $("div#global-notifications.online span.count").text();
        
        var count = (active.length > 0) ? active : "0";
        var opts = {activities: count};
        
        // always show flags instead if they exist
        if (flag.length > 0) {
            opts = {flags: flag};
        }
        
        // notify the background script
        chrome.runtime.sendMessage(opts, function(response) {
            console.log("response.message", response.message);
        });
    });
    
    // Inject the dialog into the page
    $.get(chrome.extension.getURL('/src/dialog.html'), function(data) {
        var html = parseOSKeys(data);
        $(html).appendTo('body');
        // Or if you are using jQuery 1.8+:
        //$($.parseHTML(data)).appendTo('body');
    });
    
    // Parse OS keys
    function parseOSKeys(data) {
        if (w.navigator.platform === "MacIntel") {
            // Mac keys
            data = data.replace(/Alt([\s\+])/g, "⌥$1");          // Alt key (Option)
            data = data.replace(/Ctrl([\s\+])/g, "⌘$1");         // Ctrl key (Command)
        }
        data = data.replace(/Shift([\s\+])/g, "⇧$1");            // Shift key (pretty character)
        data = data.replace(/Tab([\s\+])/g, "⇥$1");              // Tab key (pretty character)
        data = data.replace(/Esc([\s\+:])/g, "␛$1");             // Esc key (pretty character)
        data = data.replace(/Caps([\s\+])/g, "⇪$1");             // Caps lock key (pretty character)
        data = data.replace(/(Back)|(Delete)([\s\+])/g, "⌫$3");  // Backspace/Delete key (pretty character)
        data = data.replace(/(Enter)|(Return)([\s\+])/g, "⏎$3"); // Enter/Return key (pretty character)
        
        return data;
    }
    
    // Set up a handler to listen for modal dialog requests.
    d.addEventListener('ph-modal', function(e) {
        var dialog = d.querySelector("#ph-modal");
        dialog.showModal();
        dialog.addEventListener('close', function(e) {
            console.log('dialog closed by', this.returnValue);
            // create dialog clone without event handlers
            var clone = this.cloneNode(true);
            this.parentNode.replaceChild(clone, this);
        }, false);
        dialog.addEventListener('cancel', function(e) {
            // this will bubble to the close event
            e.stopPropagation();
            this.close("pressing ESC");
        }, false);
        dialog.addEventListener('click', function(e) {
            if (e.toElement === this) {  // click outside of dialog
                e.preventDefault();
                e.stopPropagation();
                //var closer = document.querySelector('#ph-close');
                //closer.dispatchEvent(new Event('click'));
                //closer.click();  // convenience method
                this.close('clicking outside');
            }
        }, false);
        // allow this to run only once
        //this.removeEventListener(e.type, arguments.callee, false);
    }, false);

}(window, document));
