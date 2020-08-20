
var g_localKey = 'anki'; // 本地储存前缀
var g_favorites = local_readJson('favorites', []); //加星的单词
$('#favorites_cnt span').html(g_favorites.length);
var g_config = local_readJson('config', {
    'last': '', // 打开的名字
});

function local_saveJson(key, data) {
    if (window.localStorage) {
        key = g_localKey + key;
        data = JSON.stringify(data);
        return localStorage.setItem(key, data);
    }
    return false;
}

function local_readJson(key, defaul = '') {
    if(!window.localStorage) return defaul;
    key = g_localKey + key;
    var r = JSON.parse(localStorage.getItem(key));
    return r === null ? defaul : r;
}

function getLocalItem(key, defaul = '') {
    var r = null;
    if(window.localStorage){
        r = localStorage.getItem(g_localKey + key);
    }
    return r === null ? defaul : r;
}

function setLocalItem(key, value) {
    if(window.localStorage){
       return localStorage.setItem(g_localKey + key, value);
    }
    return false;
}

function getStringToArray(str, s, e){
    var i_start, i_end;
    var a_res = [];
    while(typeof(str) == 'string'){
        i_start = str.indexOf(s, i_end);
        if(i_start == -1) break;

        i_start += s.length;
        i_end = str.indexOf(e, i_start);
        if(i_end != -1){
            a_res.push(str.substr(i_start, i_end - i_start));
            i_end += e.length;
        }else{
            i_end = i_start;
        }
    }
    return a_res;
}


function insertStyle(cssText) {
    var head = document.getElementsByTagName("head")[0];
    var style = document.createElement("style");
    var rules = document.createTextNode(cssText);
    style.type = "text/css";
    if (style.styleSheet) {
        style.styleSheet.cssText = rules.nodeValue;
    } else {
        style.appendChild(rules);
    }
    head.appendChild(style);
}

