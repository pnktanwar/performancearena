console.log('<----- Content script started running ----->');

function injectScript(file_path, tag) {
    var node = document.getElementsByTagName(tag)[0];
    var script = document.createElement('script');
    script.setAttribute('type', 'text/javascript');
    script.setAttribute('src', file_path);
    node.appendChild(script);
}

injectScript(chrome.extension.getURL('inject-script.js'), 'body');

window.addEventListener("message", function (event) {
    // only accept messages from the current tab
    if (event.source != window)
        return;

    if (event.data.type == "FROM_PAGE") {
        if (event.data.type && typeof chrome.app.isInstalled !== 'undefined') {
            if (event.data.essential) {
                chrome.runtime.sendMessage({ essential: event.data.essential });
            } else if (event.data.pageLoaded) {
                chrome.runtime.sendMessage({ pageLoaded: true });
            }
        }
    }
}, false);

// chrome.runtime.onMessage.addListener(
//     (request, sender, sendResponse) => {
//         console.log('PANKAJ: ', request, sender);
//     }
// );
