
function addClassForRequest(methods) {
    let color = '';
    switch (methods) {
        case "GET":
            color = " label-success";
            break;
        case "POST":
            color = " label-warning";
            break;
        case "PUT":
            color = " label-primary";
            break;
        case "DELETE":
            color = " label-danger";
            break;
        default:
            color = " label-default";
            break;
    }
    return 'label' + color;
}


let reqCache = {};

let count = 0;


function createButtonA(tabPanelId) {
    const a = document.createElement('a');
    a.className = "collapsed";
    a.setAttribute('role', 'button');
    a.setAttribute('data-toggle', 'collapse');
    a.setAttribute('href', "#" + tabPanelId);
    a.setAttribute('aria-expanded', 'true');
    return a;
}

function createMethodSpanFromDevtoolsMsg(msg) {
    const methodSpan = document.createElement('span');
    methodSpan.className = addClassForRequest(msg.request.method);
    methodSpan.textContent = msg.request.method;

    return methodSpan;
}

function createUrlSpanFromdevtoolsMsg(msg) {
    const urlSpan = document.createElement('span');
    urlSpan.setAttribute('style',"word-break:break-all");
    urlSpan.textContent = msg.request.url.substring(0, 80);

    return urlSpan;
}

function createcheckBoxSpan(id) {

    let checkBox = createCheckBox();
    checkBox.id = "check" + id;
    const checkBoxSpan = document.createElement('span');
    checkBoxSpan.appendChild(checkBox);
    return checkBoxSpan;

}

function createHeadingDiv() {
    const div = document.createElement('div');
    div.setAttribute('role', 'tab');
    div.setAttribute('class', 'panel-heading');
    return div;
}

function createPanelDiv(tabPanelId) {
    let div = document.createElement('div');
    div.id = tabPanelId;
    div.className = "panel-collapse collapse";
    div.setAttribute('role', 'tabpanel');
    div.setAttribute('style', "word-break:break-all");
    return div;
}

function createDragableTabDiv(reqId) {
    let gragableDiv = document.createElement('div');
    gragableDiv.className = "list-group-item panel panel-default cancel-padding";
    gragableDiv.id = reqId;
    gragableDiv.style = "margin-bottom: 5px;";
    return gragableDiv;
}

function createDragableHeadingDiv() {
    let div = document.createElement('div');
    div.className = "panel-heading glyphicon-move";
    div.setAttribute('role', 'tab');
    div.setAttribute('aria-hidden', 'false');
    return div;
}

function createCodeViewPre(codeStr) {
    return new JSONFormat(codeStr,4).toString();
}

function createCheckBox() {
    let boxinput = document.createElement('input');
    boxinput.setAttribute('type', 'checkbox');
    boxinput.addEventListener("click", clickCheckBox);
    return boxinput;
}

function createTabDiv(count) {
    let tabDiv = document.createElement('div');
    tabDiv.id = count;
    tabDiv.className = "panel panel-default";
    tabDiv.style = "margin-bottom: 5px;";
    return tabDiv;
}

function deleteMidDiv() {
    let divNode = this.parentNode.parentNode.parentNode;
    let divNodeId = divNode.getAttribute('id');
    let originalDivCheckBox =document.getElementById(divNodeId.replace('d','')).getElementsByTagName('input')[0];
    originalDivCheckBox.checked=false;
    divNode.parentNode.removeChild(divNode);
}

function deselectButton() {
    let innerImg = document.createElement('img');
    innerImg.width = "18";
    innerImg.height = "18";
    innerImg.src = "icon/delete_button.png";
    innerImg.style = "margin: -10px -2px -2px -8px ";
    let deleteButton = document.createElement('button');
    deleteButton.style="height:16px;width:18px";
    deleteButton.appendChild(innerImg);
    deleteButton.addEventListener("click", deleteMidDiv);
    let checkBoxSpan = document.createElement('span');
    checkBoxSpan.appendChild(deleteButton);
    return checkBoxSpan;
}

function putInMidArea(reqId) {
    const msg =
        reqCache[reqId];
    if(document.getElementById('d' + reqId)){
        return;
    }
    let gragableTabDiv = createDragableTabDiv('d' + reqId);

    let dragableTabHeadingDiv = createDragableHeadingDiv();

    let dragablePanelId = 'drag' + reqId;
    let dragableButtonA = createButtonA(dragablePanelId);

    // dragableButtonA.appendChild(deselectButton());
    dragableButtonA.appendChild(createMethodSpanFromDevtoolsMsg(msg));
    dragableButtonA.appendChild(createUrlSpanFromdevtoolsMsg(msg));

    dragableTabHeadingDiv.appendChild(deselectButton());
    dragableTabHeadingDiv.appendChild(dragableButtonA);

    let dragableTabPanelDiv = createPanelDiv(dragablePanelId);

    dragableTabPanelDiv.innerHTML = createCodeViewPre(JSON.stringify(msg));
    for (let i of dragableTabPanelDiv.getElementsByTagName('i')){
        i.addEventListener("click", hide)
    }

    gragableTabDiv.appendChild(dragableTabHeadingDiv);
    gragableTabDiv.appendChild(dragableTabPanelDiv);

    let dragList = document.getElementById('listWithHandle');
    dragList.appendChild(gragableTabDiv);
}

function getRefererUrl(headers) {
    for(let item of headers){
        if(item.name == "Referer"){
            console.log(item.value);
            return item.value;
        }
    }
}

function chainUpReferer(reqId){
    let reqIds = [];
    let msg = reqCache[reqId];
    reqIds.unshift(reqId);
    let headers = msg.request.headers;

    let refererUrl = getRefererUrl(headers);

    for (let id=reqId; refererUrl && id>=0; id--){
        msg = reqCache[id];
        if (msg.request.url == refererUrl){

            reqIds.unshift(id);
            document.getElementById("check"+id).checked=true;
            refererUrl = getRefererUrl(headers);
        }
    }
    reqIds.forEach(id => {
        putInMidArea(id);
    })
}

function chainUpRedirect(reqId){
    let reqIds = [];
    let msg = reqCache[reqId];
    let redirectURL = msg.response.redirectURL;

    for (let id=parseInt(reqId)+1; redirectURL; id++){
        msg = reqCache[id];
        if (msg.request.url == redirectURL){
            reqIds.push(id);
            document.getElementById("check"+id).checked=true;
            redirectURL = msg.response.redirectURL;
        }
    }
    reqIds.forEach(id => {
        putInMidArea(id);
    })
}

function chainUpCookie(reqId) {
    let reqIds = [];
    let msg = reqCache[reqId];
    reqIds.unshift(reqId);

    let tempCookies = [];
    msg.request.cookies.forEach(item=>{
        tempCookies.push(item);
    });
    let oldCookies = msg.request.cookies;

    for (let id=reqId-1; oldCookies && id>=0; id--){
        msg = reqCache[id];
        let setCookies = msg.response.cookies;
        let sameCookie = tempCookies.find(cookie => {
            return setCookies.find(setCookie => {
                return cookie.name == setCookie.name && cookie.value == setCookie.value;
            })
        });

        if (sameCookie){
            reqIds.unshift(id);
            document.getElementById("check"+id).checked=true;
            msg.request.cookies.forEach(newCookie => {
                let lenOftemp = tempCookies.length;
                let existSameCookie = false;
                for(let i=0; i<lenOftemp; i++){
                    if(tempCookies[i].name == newCookie.name){
                        existSameCookie = true;
                        tempCookies[i] = newCookie;
                    }
                }

                if(!existSameCookie){
                    tempCookies.push(newCookie);
                }
            })
        }
    }
    reqIds.forEach(id => {
        putInMidArea(id);
    })
}

function clickCheckBox() {
    const reqId = this.parentNode.parentNode.parentNode.id;

    if (this.checked){
        if(document.getElementById("cookie-chain").checked && document.getElementById("referer-chain").checked){
            //TODO    chainUpCookieAndReferer(reqId);
        }else if(document.getElementById("cookie-chain").checked){
            chainUpCookie(reqId);
        }else if(document.getElementById("referer-chain").checked){
            chainUpReferer(reqId);
        }else{
            putInMidArea(reqId);
        }
        if(document.getElementById("redirect-chain").checked){
            chainUpRedirect(reqId);
        }

    }else{
        document.getElementById("d" + reqId).remove();
    }

}

function showHeardReqs(msg) {
    msg.count = count;

    reqCache[count] = msg;
    let tabPanelId = 'collapse' + count;
    let buttonA = createButtonA(tabPanelId);

    buttonA.appendChild(createMethodSpanFromDevtoolsMsg(msg));
    buttonA.appendChild(createUrlSpanFromdevtoolsMsg(msg));

    let panelHeadingDiv = createHeadingDiv();
    panelHeadingDiv.appendChild(createcheckBoxSpan(count));
    panelHeadingDiv.appendChild(buttonA);

    let panelDiv = createPanelDiv(tabPanelId);
    panelDiv.innerHTML = createCodeViewPre(JSON.stringify(msg));
    for (let i of panelDiv.getElementsByTagName('i')){
        i.addEventListener("click", hide)
    }
    let tabDiv = createTabDiv(count);

    tabDiv.appendChild(panelHeadingDiv);
    tabDiv.appendChild(panelDiv);

    let loggerList = document.getElementById('logger');
    loggerList.appendChild(tabDiv);
    count++;
}

function listenNetwork(request) {
    request.getContent(function(content, encoding){
        request.response.body = {};
        request.response.body.content = content;
        request.response.body.encoding = encoding;
        showHeardReqs(request);
    });
}

function start() {
    console.log("start");
    chrome.devtools.network.onRequestFinished.addListener(listenNetwork);

}

function stop() {
    console.log("stop");
    chrome.devtools.network.onRequestFinished.removeListener(listenNetwork);

}

function clean() {
    let loggerList = document.getElementById('logger');
    loggerList.innerHTML = '';
    reqCache = {};
    count = 0;
}

let filter = {
    url:'',
    response:'',
    request:'',
    header:'',
    cookie:'',
    setcookie:'',
    jcp:''
};


function is_jcp(req) {
    let yes_not = false;
    req.response.headers.forEach(hd => {
        if (hd.name =='Content-Type'){
            if (hd.value.includes('image') || hd.value.includes('css') || hd.value.includes('javascript')){
                yes_not = true;
            }
        }
    });
    if(req.response.content.mimeType.includes('image')){
        yes_not = true;
    }

    return yes_not
}

function filt() {
    for(let i in reqCache){
        if( (filter.url=='' || reqCache[i].request.url.includes(filter.url)) &&
            (filter.response=='' || reqCache[i].response.body && JSON.stringify(reqCache[i].response.body).includes(filter.response)) &&
            (filter.request=='' || reqCache[i].request.postData && reqCache[i].request.postData.text && reqCache[i].request.postData.text.includes(filter.request)) &&
            (filter.header=='' || JSON.stringify(reqCache[i].request.headers).includes(filter.header) || JSON.stringify(reqCache[i].response.headers).includes(filter.header)) &&
            (filter.cookie=='' || JSON.stringify(reqCache[i].request.cookies).includes(filter.cookie) || JSON.stringify(reqCache[i].response.cookies).includes(filter.cookie)) &&
            (!filter.setcookie || reqCache[i].response.cookies.length > 0) &&
            (!filter.jcp || !is_jcp(reqCache[i]))
        ){
            document.getElementById(i).style.display = "";

            const markNode = $('#'+'collapse'+i);
            markNode.removeHighlight();

            for (let key in filter){
                if(key == 'jcp' || key == 'setcookie') {continue}
                let filterStr = filter[key];
                if(filterStr){
                    markNode.highlight(filterStr);
                }
            }
        }else{
            console.log('filt out');
            console.log(! filter.jcp || !is_jcp(reqCache[i]));
            document.getElementById(i).style.display = "none";
        }
    }
}

function filtUrl() {
    filter.url = this.value.trim();
    filt();
}

function filtResponse() {
    filter.response = this.value.trim();
    filt();
}

function filtRequest() {
    filter.request = this.value.trim();
    filt();
}

function filtHeader() {
    filter.header = this.value.trim();
    filt();
}

function filtCookie() {
    filter.cookie = this.value.trim();
    filt();
}

function filtSetCookie() {
    filter.setcookie = this.checked;
    filt();
}

function filtJcp() {
    filter.jcp = this.checked;
    filt();
}

function generateOneReq(pre, i) {
    const reqJson = pre;
    let options = {};
    let har = reqJson.request;
    
    delete har.headersSize;
    delete har.bodySize;

    options.method = har.method;
    options.url = har.url.split('?')[0];
    let headers = {};
    har.headers.forEach(item =>{
        if(!(item.name === "Content-Length") && !item.name.startsWith(':'))
            headers[item.name] = item.value;
    });
    options.headers = headers;

    if(har.queryString){
        let qs = {};
        har.queryString.forEach(item =>{
            qs[item.name] = item.value;
        });
        options.qs = qs;

    }

    if(har.postData){
        options.body = har.postData.text;
        let form = {};
        if(har.postData.params){
            har.postData.params.forEach(item => {
                form[item.name] = item.value;
            });
            options.form = form;
        }
    }

    options.gzip = true;

    let optionStr = "let options" + i + " = " + JSON.stringify(options,'', 4);


    let funcDef = "function doRequest" + i +"(){ \n";
    let funcClose = "}\n";
    let promiseDef =    "return new Promise(function(resolve, reject) {                         \n"+
                        "options" + i + ".jar = jar;                                            \n"+
                        "    request(options" + i + ", function (error, response, body) {       \n"+
                        "        if (error) {                                                   \n"+
                        "            reject(error);                                             \n"+
                        "        }                                                              \n"+
                        "        else {                                                         \n"+
                        "            resolve(body);                                             \n"+
                        "        }                                                              \n"+
                        "   })                                                                  \n"+
                        "});                                                                    \n";

    return funcDef + "\n" + optionStr + "\n" + promiseDef + "\n" + funcClose;
}

function generateOneAccReq(req,i) {

    const reqJson = req;
    let options = {};
    let request = reqJson.request;

    delete request.headersSize;
    delete request.bodySize;

    options.method = request.method;
    options.url = request.url.split('?')[0];
    let headers = {};
    request.headers.forEach(item =>{
        if(!(item.name==="Content-Length")){
            headers[item.name] = item.value;
        }
    });
    options.headers = headers;

    if(request.queryString){
        let qs = {};
        request.queryString.forEach(item =>{
            qs[item.name] = item.value;
        });
        options.qs = qs;
    }

    if(request.postData){
        options.body = request.postData.text;
        let form = {};
        if(request.postData.params){
            request.postData.params.forEach(item => {
                form[item.name] = item.value;
            });
            options.form = form;
        }
    }

    options.gzip = true;
    console.log('new Fucntion');
    // let prepare = new Function('inpu','task','return '+JSON.stringify(options,'', 4));
    let prepare = 'function(inpu,task){\n' +
                  '    return '+JSON.stringify(options, ' ', 4)+'\n'+
                  '}';

    return  'http_'+i + ': {\n'+
            '   preProcess:function (input, task) {\n\n'+
            '       return input;\n'+
            '   },\n'+
            '   prepare:'+prepare +',\n' +
            '   parse:function (res, options) {\n\n'+
            '       return {\n'+
            '           data:{},\n'+
            '           task:{},\n'+
            '       }\n'+
            '   },\n'+
            '   postProcess:function (input, data, task, mongoData) {\n\n'+
            '       return {\n'+
            '           next:[{}]\n'+
            '       }\n'+
            '   }\n'+
            '}'

}

function generateCode() {
    console.log('generate');
    let listToBeGeneratedDiv = document.getElementById('listWithHandle');

    let pres = listToBeGeneratedDiv.children;
    let hars = [];
    for (let ele of pres){
        let divId = ele.getAttribute('id');
        hars.push(reqCache[divId.replace('d','')]);
    }

    let defStr = "let request = require('request');     \n"+
                 "let jar = request.jar();  \n";

    let coDefStr =   "co(function *(){      \n";
    let coCloseStr = "});                   \n";

    let i = 0;
    for (let pre of hars){
        defStr += generateOneReq(pre, i) + '\n';
        coDefStr += "let result" + i + " = yield doRequest" + i + "(); \n";
        i++;
    }

    copyToClipboard(defStr + coDefStr + coCloseStr);
}

function generateES6Code() {
    console.log('generate es6');
    let listToBeGeneratedDiv = document.getElementById('listWithHandle');

    let pres = listToBeGeneratedDiv.children;
    let hars = [];
    for (let ele of pres){
        let divId = ele.getAttribute('id');
        hars.push(reqCache[divId.replace('d','')]);
    }

    let defStr = "const request = require('request');     \n"+
                 "const jar = request.jar();  \n";

    let coDefStr =   "async function run(){      \n";
    let coCloseStr = "};                   \n";

    let i = 0;
    for (let pre of hars){
        defStr += generateOneReq(pre, i) + '\n';
        coDefStr += "let result" + i + " = await doRequest" + i + "(); \n";
        i++;
    }

    copyToClipboard(defStr + coDefStr + coCloseStr);
}

function generateJson() {
    console.log('generate Json');
    let listToBeGeneratedDiv = document.getElementById('listWithHandle');

    let pres = listToBeGeneratedDiv.children;
    let hars = [];
    for (let ele of pres){
        let divId = ele.getAttribute('id');
        hars.push(reqCache[divId.replace('d','')]);
    }

    copyToClipboard(JSON.stringify(hars, ' ', 4));
}

function copyToClipboard(txt) {
    const $temp = $("<textarea>");
    $("body").append($temp);
    $temp.text(txt).select();
    document.execCommand("copy");
    $temp.remove();
}

function generateCookies() {
    chrome.runtime.sendMessage({command: "cookies"}, function(response) {
        console.log('response');
        let jar = response.cookies.map(cookie=>{
            return {
                "key": cookie.name,
                "value": cookie.value,
                "domain": cookie.domain.replace(/^\./, ''),
                "path": cookie.path,
                "httpOnly": cookie.httpOnly,
                "hostOnly": cookie.hostOnly,
                // "creation": cookie.name,
                // "lastAccessed": cookie.name
            }
        });
        copyToClipboard(JSON.stringify(jar, ' ', 4));
    });
}

window.onload = async function () {

    document.getElementById("start-btn").addEventListener("click", start);
    document.getElementById("stop-btn").addEventListener("click", stop);
    document.getElementById("clean-btn").addEventListener("click", clean);

    document.getElementById("search-url").addEventListener("keyup", filtUrl);
    document.getElementById("search-response").addEventListener("keyup", filtResponse);
    document.getElementById("search-request").addEventListener("keyup", filtRequest);
    document.getElementById("search-header").addEventListener("keyup", filtHeader);
    document.getElementById("search-cookie").addEventListener("keyup", filtCookie);
    document.getElementById("set-cookie").addEventListener("click", filtSetCookie);
    document.getElementById("filt_jcp").addEventListener("click", filtJcp);

    document.getElementById("generateCookies").addEventListener("click", generateCookies);
    document.getElementById("generateJson").addEventListener("click", generateJson);
    document.getElementById("generate").addEventListener("click", generateCode);
    document.getElementById("generateES6").addEventListener("click", generateES6Code);
};
