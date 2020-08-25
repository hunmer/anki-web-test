var g_flds = []; // 牌组的所有列
var g_order = []; // 一张牌的所有面
var g_index; // 正在展示的牌的索引
var g_showing; // 正在展示的牌的数据
var g_orderIndex; // 正在展示的牌面顺序
var g_dangos = []; // 抽查的词组列表;
var g_count = 30; // 一次抽查的数量
var g_uuid = '';// 牌组id
var g_red = []; 
var g_blue = [];
var g_green = [];
var g_name; // 打开的名字
var g_json; // JSON数据

var g_decks = []; // 加载的数据
var g_deck; // 文件名字
var g_dangoKeys = [];// 单词主键


function loadDeck(deck, autoload = false){
	$('#progress_data').show();
	console.log('加载'+deck);

	if(g_decks[deck] != undefined){ // 已经加载
		if(deck != g_deck){
			g_sort[deck] = initSort(g_decks[deck]);
		}
		return initData(deck, g_decks[deck], autoload);
	}
	var json = local_readJson('_deck_'+deck, null);
	if(json === null){
		$.getJSON('./res/'+deck+'.json', function(json, textStatus) {
			if(textStatus == 'success'){
				g_decks[deck] = json;
				local_saveJson('_deck_'+deck, json);
				first_load_data(deck, json);
				if(autoload){
					initData(deck, json, autoload);
				}
			}
		});
	}else{
		g_decks[deck] = json;
		first_load_data(deck, json);
		if(autoload){
			initData(deck, json, autoload);
		}
	}
}

// 数据预载完毕
function first_load_data(deck, json){
	initLevel(deck, json, json.sort[0].name, json.sort[0].index, json.sort[0].prefix);
	var d;
	if(g_required[deck] !== undefined){

		// TODO 不同的库可能引用的主键也不一样
		// 之后再 g_dangoKeys 里再加一层主键缩影
		if(initDangoKeys(deck, g_required[deck])){
			console.log('成功加载支持库:'+deck);
		}
		delete g_required[deck];
	}
	$('#progress_data').hide();
}

var g_sort = []; // 排序

function initSort(json, index = 0){
	var prefix = json.sort[index].prefix;
	var sortI = json.sort[index].index;
	var m = json.note_models.length;
	var levles = [];
	for(var d of json.notes){
		var key = prefix.replace(/{i}/g, d[sortI]);
		if(key == '') key = 'unknow';
		if(levles[key] == undefined){
			levles[key] = [];
		}
		
		levles[key].push(d);
	}
	return levles;
}

function initLevel(deck, data, title, sortI, prefix = 'lv.{i}'){
	var levles = initSort(data);
	//console.log(levles);
	var keys = Object.keys(levles);
	if(keys.length > 0){
		g_sort[deck] = levles;
		var h = `<li><div class="collapsible-header">
		      <i class="material-icons">filter_drama</i>
		      `+data.name+'_'+title+`
		      <span class="badge new">`+keys.length+`</span></div>
		    <div class="collapsible-body">
		    	<div class="collection dango_list">`;
		for(var i=0;i<keys.length;i++){
			 h = h + `<a `+(g_config.nightMode ? 'style="background-color: black" ' : '')+`href="javascript: setLevel('`+deck+`', '`+keys[i]+`')" class="collection-item" key="`+deck+`_`+keys[i]+`"><span class="badge">`+levles[keys[i]].length+`</span>`+keys[i]+`</a>\r\n`;
		}
		h = h + ' </div></div></li>';
	  	$('#mobile-demo .collapsible').append(h);
	  	$('.collapsible').collapsible();
	}
}

$(function() {

	M.AutoInit();
	initLast();
	$('.sidenav').sidenav({
		draggable: true
	});
	//$('._card').height($(this).height() - 50);
	// $(window).resize(function(event) {
	// });
    window.history.pushState(null, null, "#");
    window.addEventListener("popstate", function(event) {
        event.preventDefault(true);
    	x0p({
		    title: '終わるの？',
		    text: '今日の目標は達成しましたか？',
		    animationType: 'pop',
		    icon: 'custom',
		    iconURL: 'imgs/gimon.png',
		    showButtonOutline: true,
		    buttons: [
		        {
		            type: 'error',
		            key: 49,
		            text: 'いいえ',
		        },
		        {
		            type: 'ok',
		            key: 50,
		            text: 'はい'
		        }
		    ]
		}).then(function(data) {
			if( data.button != 'error'){
				x0p({
				    title: 'お疲れ様〜',
				    text: '明日も頑張るぞ〜',
				    animationType: 'pop',
				    icon: 'custom',
				    iconURL: 'imgs/i_know.png',
				    buttons: [],
				    autoClose: 3000,
				});
				setTimeout(function(){
						window.location.href="about:blank";
 				 		window.close();
 				 	}, 3000);
			}
		});
    });

	$(document).on('click', '.collapsible li', function(event) {
		var d = $(this).find('div.collapsible-body');
		if(d.html() == ''){
			var html = getHtml(g_json.notes[$(this).attr('key')], g_json.note_models[g_json.card_html[0]].html[g_json.card_html[1]]);
			d.html(html);
		}
		
		//event.preventDefault();
	}).
	on('click', '._more', function(event) {
		//console.log(g_menu);
		//g_select_dom = $(this).next();

		/*switch($(this).parent().find('b').html()){
			case 'お気入り':
			case 'よく覚えない':
				break;
		}*/
	});

	if(new Date().getHours() <= 6){
	   g_config.nightMode = true; 
	}
	nightMode(g_config.nightMode);

	first_join();
});

function first_join(){
	var name = g_config.last;
	if(name != '' && g_config.lastDeck != '' && g_config.lastTable != ''){
		x0p({
		    title: '記録復元',
		    text: '前回の記録を復元するですか？',
		    icon: 'info',
		    animationType: 'fadeIn',
		    buttons: [
		        {
		            type: 'cancel',
		            text: 'いいえ'
		        },
		        {
		            type: 'info',
		            text: 'はい'
		        }
		    ]
		}).then(function(data) {
		    if(data.button == 'info') {
		    	loadName(g_config.lastDeck, g_config.lastTable);
			}else{
				defaultLoad();
			}
		});
	}else{
		defaultLoad();
	}
}

/*var a =[];
for(var d of ["頼", "痛", "喚", "鼻", "漢", "悪", "羅", "悪", "悼", "哀", "刹", "叫", "惜", "鬼", "無", "阿"]){
var r = get_Deck_Dango_byValue(d, 'kanken');
if(r != undefined){
	a.push(r);
}
}
console.log(a);
window.copy(a);
*/
function get_Deck_Dango_byValue(v, deck = ''){
	if(deck == '') deck = g_deck;
	var k = getkeyByValue(v, deck);
	if(k != -1){
		return get_Deck_Dango_byKey(k, deck);
	}
}

function get_Deck_Dango_byKey(k, deck = ''){
	if(deck == '') deck = g_deck;
	return g_decks[deck].notes[k];
}

// 根据单词的主键内容值返回主键
function getkeyByValue(v, deck = ''){
	if(deck == '') deck = g_deck;
	return g_dangoKeys[deck].indexOf(v);
}

// 获取随机卡片
function getRecentCards(d, c = 3){
	var a = [];
	var mk = d[g_json.index];
	for(var i = 0;i<g_red.length;i++) if(g_red[i] != mk) a.push(g_red[i]);
	for(var i = 0;i<g_blue.length;i++) if(g_blue[i] != mk) a.push(g_blue[i]);
	a.sort(function() {
	    return (0.5-Math.random());
	});
	var r = [d];
	var m = c;
	var re;
	if(m > a.length) m = a.length - 1;
	if(m > 0){
		for(var d of a.splice(0, m)){
			// !TEST
			re = g_dangos[getkeyByValue(d)];
			if(re != undefined){
				r.push(re);
			}
		}
	}

	// 实在没有从所有词库取
	for(var i=r.length;i<c + 1;i++){
		// TODO 不重复
		// !TEST
		re = g_json.notes[getRandomNum(0, g_json.notes.length - 1)];
		if(re != undefined){
			r.push(re);
		}
	}
	return r;
}

function getRandomNum(min, max){
	return Math.floor(Math.random()*(max-min+1)+min);
}

function defaultLoad(){
	// 默认加载操作
	$('._card').html("<img id='img_tip' src='./imgs/flight.png'>");
	loadDeck('yoji');
	loadDeck('kanken');
}

/*

*/

var g_time_start;

function setLevel(key, level){
	g_dangos = [];
	g_red = [];
	g_blue = [];
	g_green = [];
	g_orderIndex = 0;
	b = false;
	hideContent();
	$('.sidenav').sidenav('close');

	switch(key){
		case 'favorites':
			g_dangos = Object.create(g_favorites)
			break;

		case 're':
			g_dangos = Object.values(g_re);
			break;

		default:
			b = true;
			loadName(key, level);
			break;
	}
	if(!b){
		g_name = key;
		test_start();
	}
	g_last[g_name] = new Date().getTime() / 1000;
	local_saveJson('last', g_last);
	initLast();
}

var g_modelIndex;

function loadModel(index = 0){
	g_modelIndex = index;
	console.log('loadModel', g_json.note_models[index].name);
	g_orderIndex = 0;
	g_order = g_json.note_models[index].html;
	insertStyle(g_json.note_models[index].css);
}

function initDangoKeys(deck, index){
	console.log('initDangoKeys', deck);
	if(g_decks[deck] == undefined && g_required[deck] == undefined){
		g_required[deck] = index; // 加入列表
		loadDeck(deck);
		return false;
	}
	if(g_dangoKeys[deck] == undefined &&  g_decks[deck] !== undefined){
		g_dangoKeys[deck] = [];
		for(var k of g_decks[deck].notes) g_dangoKeys[deck].push(k[index]);
	}
	return true;
}
var g_script;
var g_required = {};
function initData(deck, json, autoLoad = false){
	if(typeof(json.required) == 'object'){
		for(var d of json.required){ // 加载支持库
			if(initDangoKeys(d.deck, d.index)){
				console.log('成功加载支持库:'+d.deck);
			}
		}
	}
	document.title = json.name;
	g_deck = deck;
	g_json = json;
	initDangoKeys(deck, g_json.index);
	g_flds = json.flds;
	loadModel(0);
	g_uuid = json.uuid;
	if(autoLoad){
		loadName(g_config.lastDeck, g_config.lastTable);
	}

}
// 根据名字加载
function loadName(deck, table){
	console.log('loadName', deck, table);

	g_name = deck+'_'+table;
	g_config.lastDeck = deck;
	g_config.lastTable = table;
	g_config.last = g_name;
	local_saveJson('config', g_config);

	if(deck != g_deck){ // deck未加载
		return loadDeck(deck, true);
	}

	g_time_start = new Date().getTime() / 1000;
	g_name = deck+'_'+table;
	g_dangos = local_readJson(g_name+'_dango', []);
	if(g_dangos != undefined && g_dangos.length > 0){
		g_blue = local_readJson(g_name+'_blue', []);
		g_red = local_readJson(g_name+'_red', []);
	}else{
		// 没有加载记录
		g_dangos = g_sort[deck][table];
		local_saveJson(g_name+'_dango', g_dangos);
		//console.log(g_dangos.length);
	}
	initCardType();
	test_start();
}

function getDangoStr(d){
	var a = [];
   for(var dango of d){
   		for(var i=0;i<dango[0].length;i++){
   			 var r = get_Deck_Dango_byValue(dango[0][i], 'kanken');
	        if(r != undefined){
	            a.push(r);
	        }
   		}
    }
    return a;
}

var g_dangoTypes = [];

// 初始化所有单词的卡牌格式
function initCardType(){
	// Q: 储存起来会比较好?
	var c = 0;
	var a = [];
	var max = g_json.note_models.length;
	if(max > 1){
		for(var d of g_dangos){
			//if(d.type == undefined){
				//d.type = getRandomNum(0, max);
				d.type = c % max;
				//d.type = 5;
				if(a[d.type] == undefined) a[d.type] = 0;
				a[d.type]++;
				c++;
			//}
		}
	}else{
		// 只有一种样式
		loadModel(0);
	}
	if(c > 0){
		console.log('initCardType', c);
		console.log(a);
		//local_saveJson(g_name+'_dango', g_dangos);
	}
}

function loadIndex(){
	if(g_dangos == undefined || g_dangos.length == 0){
		$('._card').html('<img id="img_tip" src="imgs/cry.png"></br><h4 style="display: block; margin: 0px auto;text-align: center;">何もありません</h4>');
		return;
	}
	//g_showing = g_dangos[index];
	g_showing = g_dangos.splice(0, 1)[0];
	g_orderIndex = 0;
	if(g_showing != undefined){
		var type = getDangoType(g_showing);
		if(g_json.note_models.length > 1 && type != g_modelIndex){ // 切换新的卡片
			loadModel(type);
		}
		$('#favorite i').html(isFavorite() == -1 ? 'star_border' : 'star');
		orderIndex(0);
	}else{
		console.log('空单词');
	}
}

function getDangoType(d, def = 0){
	if(d != undefined && d.type != undefined){
		return d.type;
	}
	return def;
}


function getHtml(data, index){
	var html;
	if(typeof(index) == 'number'){
		html = g_order[index];
	}else{
		html = index;
	}
	for(var k of getStringToArray(html, '{{', '}}')){
		//console.log(k);
		switch(k){
			case 'FrontSide':
				html = html.replace('{{'+k+'}}', getHtml(data, 0));
				break;
			default:
				var i = g_flds.indexOf(k);
				if(i != -1){
					var v = data[i];
					if(i == 7){
						v = v.replace(/\|/g, "</br>");
					}
					if(v.indexOf('src') != -1){
						v = v.replace('src="', 'src="./res/'+g_uuid+'/');
					}
					html = html.replace('{{'+k+'}}', v);
				}
				break;
		}
	}
	return html;
}

function orderIndex(index){
	$(window).scrollTop(0);
	initTitle();

	if(index >= g_order.length){ // 全部浏览完了
		return nextIndex();
	}
	var html = getHtml(g_showing, parseInt(index));
	//console.log(html);
	if(g_config.nightMode){
		$('._card').css("cssText", 'background-color:black!important; color:white!important;');
	}
	$('._card').html(html);
	showCotent();

	if($('._card').height() > $(this).height()){
		$('._card').css('marginBottom', 100);
	}

	if(index == 0){
		$('.fixed-action-btn').show();
		$('#bar').html(`
			<div class='getAnswer' onclick="nextOrder();">
				正解は？
			</div>
		`);
	}else
	if(index == 1){
		$('.fixed-action-btn').hide();
		$('#bar').html(`
			<div class='sourceBar'>
				<div class='_btn' onclick='chooseScore(0)'>困難</div>
				<div class='_btn' onclick='chooseScore(1)'>一般</div>
				<div class='_btn' onclick='chooseScore(2)'>简单</div>
			</div>
		`);
	}
}

function tip(){
	if(g_script !== undefined && typeof(eval(g_script.f_tip)) == "function"){
		return eval('g_script.f_tip()');
	}
}

function nextOrder(){
	if($('#paint').css('display') == 'block'){
		paint_resetCanvas();
	}

	M.Toast.dismissAll();
	//if(g_script.loaded !== undefined){ // 先在这边确认首次加载
		if(typeof(g_script) != 'undefined' && g_script.close != undefined){
			var a = "_v_beforeClose";
			if(typeof(eval(a)) == "function"){
				return eval(a+'()');
			}
			return;
		}
	//}
	if(g_orderIndex >= g_order.length - 1){
		return nextIndex();
	}
	g_orderIndex++;
	orderIndex(g_orderIndex);
}

/*function prevIndex(){
	if(g_orderIndex <= 0){
		return nextIndex();
	}
	g_orderIndex--;
	orderIndex();
}
*/

function nextIndex(){
	console.log('nextIndex');
	$('#bar').html('');
	if(g_dangos.length == 0){
		return test_end();
	}
	loadIndex();
}

function prevIndex(){
	if(g_index >= 0){
		g_index = g_dangos.length - 1;
	}
	loadIndex();
}

function hideContent(){
	$('#bar').hide();
	$('#ft_tip').hide();
}

function showCotent(){
	$('#bar').show();
	$('#ft_tip').show();
}
function chooseScore(i){
	var d = g_showing;
	// var d = g_dangos.splice(g_index, 1)[0];
	var k = d[g_json.index];
	//console.log(d);
	if(i == 0){ // 重来
		// 插入到列表的一半位置
		g_dangos.splice(g_dangos.length / 2, 0, d);
		if(g_red.indexOf(k) == -1){
			g_red.push(k);
		}
		var i = g_blue.indexOf(k);
		if(i != -1){
			g_blue.splice(i, 1);
		}
	}else
	if(i == 1){ // 一般
		// 插入到列表的最后
		g_dangos.push(d);
		if(g_blue.indexOf(k) == -1){
			g_blue.push(k);
		}
		var i = g_red.indexOf(k);
		if(i != -1){
			g_red.splice(i, 1);
		}
	}else{
		// 简单
		var i = g_red.indexOf(k);
		if(i != -1){
			g_red.splice(i, 1);
		}
		i = g_blue.indexOf(k);
		if(i != -1){
			g_blue.splice(i, 1);
		}
		if(g_green.indexOf(k) == -1){
			g_green.push(k);
		}
	}
	//console.log(g_dangos);
	
	if(g_name != 'favorites'){
		local_saveJson(g_name+'_dango', g_dangos);
		local_saveJson(g_name+'_blue', g_blue);
		local_saveJson(g_name+'_red', g_red);
	}
	if(i != 2){
		if(g_re[k] == undefined){
			d = Object.values(d);
			d.re = 0;
			g_re[k] = d;
			$('#re_cnt span').html(Object.keys(g_re).length);
		}
		g_re[k].re++;
		local_saveJson('re', g_re);
	}
	showCotent();
	nextOrder();
}


function initTitle(){
	if(g_max_count > 0 && g_green.length >= g_max_count){
		return test_end();
	}
	$($('li.tab')[0]).html(`
		<span style='color: red' onclick='openList(g_red)'>`+g_red.length+`</span>&nbsp;
    		<span style='color: blue' onclick='openList(g_blue)'>`+g_blue.length+`</span>&nbsp;
    		<span style='color: green' onclick='openList(g_green)'>`+(g_max_count-g_green.length)+`</span>&nbsp;
    		<span style='color: white' onclick='openList()'>`+(g_dangos.length - g_red.length - g_blue.length)+`</span>&nbsp;`);
}

function searchWord(){
	if(g_showing != undefined){
		window.open('https://dictionary.goo.ne.jp/word/kanji/'+g_showing[1]+'/');	
	}
}

function openList(list = null){
	if(!$('#test1').hasClass('active')) return;
	var _i = g_json.index;
	if(list == null){
		list = [];
		for(var d of g_dangos){
			var key = d[_i];
			if(g_blue.indexOf(key) == -1 && g_red.indexOf(key) == -1){
				list.push(key);
			}
		}
	}else{
		// for(var d in list) list[d] = list[d].replace('_', ''); // 数字索引
	}
	if(list.length === 0) return;

	var h = '<ul class="collapsible popout">';
	var i = 0;

	for(var k of list){
		var index = g_dangoKeys[g_deck].indexOf(k);
		if(index != -1){
			var d = g_json.notes[index];
			var s = g_json.list_format;
			for(var k of getStringToArray(s, '{', '}')){
				if(d[k] != undefined){
					s = s.replace('{'+k+'}', d[k]);
				}
			}
			h = h + `<li key=`+index+`>
		      <div `+(g_config.nightMode ? 'style="background-color: black" ' : '')+`class="collapsible-header">`+(index+1)+'. '+s+`</div>
		      <div class="collapsible-body"></div>
		    </li>`;
		    i++;
		}
	}
	$('#modal3').css('width', '100%').html(`<div class='modal-content' id='dango_list'>`+h+`</div>`).modal('open');
	$('.collapsible').collapsible();
}

var g_timer = 0;
function test_start(){
	$('#progress_data').hide();
	$('#favorite').show();
	$('#ft_menu').hide();
	$('.nav-extended').show();
	$('.nav-content').hide();

	if(g_timer > 0){
		clearInterval(g_timer);
		g_timer = 0;
	}
	g_timer = setInterval(function(){
		var a = getTime(new Date().getTime() / 1000 - g_time_start);
		if(a[0] > 0){
			a[1] += a[0] * 60;
		}
		$('#floating_time').html(_s(a[1])+':'+_s(a[2]));
	}, 1000);
	loadIndex(0);
}

function test_end(){
	if(g_timer > 0){
		clearInterval(g_timer);
		g_timer = 0;
	}
	$('#favorite').hide();
	$('#ft_menu').show();
	$('.nav-extended').hide();
	$('.nav-content').show();
	$('._card').html('<img id="img_tip" src="imgs/good.png"/>');
	g_showing = undefined;
	g_index = 0;
	g_orderIndex = 0;
	g_dangos = [];

	g_config.last = '';
	local_saveJson('config', g_config);
	x0p({
	    title: 'クリア！',
	    text: "任務完了〜\r\n時間 : "+toTime(new Date().getTime() / 1000 - g_time_start),
	    animationType: 'slideUp',
	    icon: 'custom',
	    iconURL: 'imgs/hava_a_rest.png',
	    showButtonOutline: true,
	    buttons: [
	        {
	            type: 'info',
	            key: 49,
	            text: 'ちょっと休む',
	            default: true
	        },
	        {
	            type: 'ok',
	            key: 50,
	            text: 'もちょっと'
	        }
	    ]
	}).then(function(data) {
		if(data.button == 'info'){
			window.close();
		}else{
			
		}
	});
}

function favorite(remove = true){
	if(g_showing != undefined){
		var i = isFavorite();
		if(i != -1){
			g_favorites.splice(i, 1);
			local_saveJson('favorites', g_favorites);
			$('#favorite').find('i').html('star_border');
		}else{
			g_favorites.push(g_showing);
			local_saveJson('favorites', g_favorites);
			$('#favorite').find('i').html('star');
		}
		$('#favorites_cnt span').html(g_favorites.length);
	}
}

function isFavorite(){
	if(g_showing != undefined){
		var key = g_showing[1];
		for(var i=0; i<g_favorites.length;i++){
			if(g_favorites[i][1] == key){
				return i;
			}
		}
	}
	return -1;
}

var g_menu = ''; // 打开菜单的名称
var g_max_count = 30; //最多复习的数量
var g_select_dom; // 打开菜单的a元素
function removeList(){
	switch(g_menu){
		case 'favorites':
			confirm('クリア', 'この操作は復元できません！', function(){
				g_favorites = [];
				local_saveJson('favorites', g_favorites);
				$('#favorites_cnt span').html(0);
			});
			break;

		case 're':
			confirm('クリア', 'この操作は復元できません！', function(){
				g_re = [];
				local_saveJson('re', g_re);
				$('#re_cnt span').html(0);
			});
			break;
	}
}

function getCardByCount(){
	if(g_menu != ''){
		x0p({
		    title: 'レビュー数を入力してください',
		    type: 'info',
		    inputType: 'text',
		    inputPlaceholder: '30',
		    inputColor: '#F29F3F',
		    buttons: [
		        {
		            type: 'cancel',
		            key: 49,
		            text: 'キャンセル',
		        },
		        {
		            type: 'ok',
		            key: 50,
		            text: 'スタート'
		        }
	    	],
		    inputPromise: function(button, value) {
		        var p = new Promise(function(resolve, reject) {
		            if(value == '' || isNaN(value))
		                resolve('数字を入力するだけです!');
		            	resolve(null);
		        });
		        return p;
	    	}
		}, function(button, text) {
			    if(button == 'ok') {
			    	g_max_count = parseInt(text);
			    	start();
			    }
		});
	}
}

function start(){
	var name = g_menu;
	switch(g_menu){
		case 'favorites':
			break;

		case 're':
			break;

		default:
			break;

	}
	setLevel(name);
}

function confirm(title, text, callback){
	x0p({
	    title: title,
	    text: text,
	    icon: 'info',
	    animationType: 'fadeIn',
	    buttons: [
	        {
	            type: 'cancel',
	            text: 'キャンセル',
	        },
	        {
	            type: 'info',
	            text: title,
	            showLoading: true
	        }
	    ]
	}).then(function(data) {
	    if(data.button == 'info') {
	        setTimeout(function() {
	        	if(typeof callback === "function"){
			        callback();
			    }
	            x0p('クリア完了！', null, 'ok', false);
	        }, 1000);
	    }
	});

}

function nightMode(night = null){
	if(night == null) night = !g_config.nightMode;
	$('._card,nav,body,.sidenav,.collection-item,#modal3,.collapsible-header').css('backgroundColor', night ? '#000000' : '');
	$('.sidenav,.sidenav li > a,._card,#modal3,.colors').css('color',  night ? 'white' : '');
	$('.sidenav-overlay,.dropdown-content').css('backgroundColor', 'rgb(179 179 179 / 50%)');
	g_config.nightMode = night;
	if(night){
		$('#nightMode input').attr('checked','checked');
	}
	$('.colors li').css('border', (night ? '1' : '0')+'px solid white');
	paint_checkColor();
	local_saveJson('config', g_config);
}

