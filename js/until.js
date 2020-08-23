
if(getLocalItem('lastUpdate') != '2020年8月24日00点08分'){
    localStorage.clear();
    setLocalItem('lastUpdate', '2020年8月24日00点08分');
}

var g_localKey = 'anki'; // 本地储存前缀
var g_favorites = local_readJson('favorites', []); //加星的单词
var g_re = local_readJson('re', {}); //重来的单词
var g_last = local_readJson('last', {}); //上次打开的时间
$('#re_cnt span').html(Object.keys(g_re).length);

function initLast(){
    var dom = [];
    for(var d in g_last){
        switch(d){
            case 'favorites':
                dom = $('#favorites_cnt');
                break;

            case 're':
                 dom = $('#re_cnt');
                break;

            default:
                dom = $('.dango_list .collection-item[key="'+d+'"]');
                break;
        }
        if(dom.length > 0){
            var t = parseInt(new Date().getTime() / 1000 - g_last[d]);
            var span = dom.find('span');
            if(span.length < 2){
                $('<span class="new badge" data-badge-caption="前">'+toTime(t)+'</span>').insertAfter(span);
            }else{
                span[1].innerText = toTime(t);
            }
        }
    }
}

function _s(s){
    return s<10 ?'0' + s : s;
}

function getTime(s){
    s = Number(s);
    var h = 0, m = 0;
    if(s >= 3600){
        h = parseInt(s / 3600);
        s %= 3600;
    }
    if(s >= 60){
        m = parseInt(s / 60);
        s %= 60;
    }
    return [h, m, parseInt(s)];
}

function toTime(s){
    var a= getTime(s);
    var h = a[0];
    var m = a[1];
    if(h > 0){
        h = h+'時';
    }else{
        h = '';
    }

    if(m > 0){
        m = m+'分';
    }else
    if(h <= 0){
        m = '1分'; // 最少一分钟
    }else{
        m = '';
    }
    return h+m;
}

$('#favorites_cnt span').html(g_favorites.length);
var g_config = local_readJson('config', {
    'last': '', // 打开的名字
    'lastDeck': '',
    'lastTable': ''
});

function local_saveJson(key, data) {
    if (window.localStorage) {
        key = g_localKey + key;
        data = JSON.stringify(data);
        if(data == undefined) data = '[]';
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
var g_css;

function insertStyle(cssText) {
    if(g_css != undefined){
        g_css.remove();
    }
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
    g_css = style;
    return style;
}


