let eventManager = {}

eventManager.dispatchAccountChange = function (data){
    chrome.runtime.sendMessage({
        channel: 'sato_extension_background_event_channel_disk',
        eventName:"account_change",
        data,
    });
}

eventManager.dispatchDisconnect = function (data){
    chrome.runtime.sendMessage({
        channel: 'sato_extension_background_event_channel_disk',
        eventName:"disconnect",
        data,
    });
}

module.exports = eventManager;
