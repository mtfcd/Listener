chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        console.log(request.command);
        if (request.command == "cookies"){
            console.log(sender.tab.title);
            let url = sender.tab.title.split(' - ')[1];
            chrome.cookies.getAll({url:url}, function (cookieStores){
                sendResponse({cookies: cookieStores});
            });
            return true;
        }
    }
);