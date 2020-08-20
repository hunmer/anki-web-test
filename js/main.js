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
var g_name; // 打开的名字


$(function() {
	M.AutoInit();
	//$('#dropdown1').css('marginTop', '64px');
	$('._card').height($(this).height() - 50);

	var json = local_readJson('test', null);
	if(json === null){
		$.getJSON('./res/deck.json', function(json, textStatus) {
			local_saveJson('test', json);
			initData(json);
		});
	}else{
		initData(json);
	}

	$(document).on('click', '.collapsible li', function(event) {
		var d = $(this).find('div.collapsible-body');
		if(d.html() == ''){
			var html = getHtml(g_json.notes[$(this).attr('key')], 1);
			d.html(html);
			setTimeout(function(){
				//$('.collapsible').collapsible('open', $(this).attr('index'));
			}, 500);
		}
		
		//event.preventDefault();
	});
});

/*
var levles = [];
for(var d of g_json.notes){
	var key = 'lv.'+d.fields[8];
	if(levles[key] == undefined){
		//levles[key] = [];
		levles[key] = 0;
	}
	//levles[key].push(d);
	levles[key]++;
}

console.log(levles);
var h = '';
var keys = Object.keys(levles);
for(var i=0;i<keys.length;i++){
	 h = h + `<a href="javascript: setLevel(`+keys[i].replace('lv.', '')+`)" class="collection-item"><span class="badge">`+levles[keys[i]]+`</span>`+keys[i]+`</a>\r\n`;
}
console.log(h);
*/

function setLevel(key, level){
	g_dangos = [];
	g_red = [];
	g_blue = [];
	g_orderIndex = 0;
	$('.sidenav').sidenav('close');

	if(key == 'favorites'){
		g_name = key;
		g_dangos = g_favorites.slice();
		loadIndex(0);
		return;
	}
	g_name = key+'_'+level;
	g_config.last = g_name;
	
	if(!loadName(g_name)){
		// 没有加载记录
		
		for(var d of g_json.notes){
			var k = d.fields[8];
			if(k == level){
				g_dangos.push(d);
			}
		}
		//console.log(g_dangos.length);
		loadIndex(0);
	}
}

function initData(json){
	document.title = json.name;
	g_json = json;
	g_flds = [];
	g_order = [];
	g_uuid = json.note_models[0].crowdanki_uuid;
	for(var d of json.note_models[0].flds){
		g_flds.push(d.name);
	}
	//console.log('g_flds', g_flds);

	g_order.push(json.note_models[0].tmpls[0].qfmt);
	g_order.push(json.note_models[0].tmpls[0].afmt);
	//console.log('g_order', g_order);

	insertStyle(json.note_models[0].css);

	g_name = g_config.last;
	if(g_name != ''){
		loadName(g_name);
	}else{
		$('._card').html("<img src='./imgs/flight.png'>");
	}

	//setLevel(10);
	// for(var i=0;i<g_count;i++){
	// 	g_dangos.push(g_json.notes[i]);
	// }
	// loadIndex(0);
}

// 根据名字加载
function loadName(name){
	g_dangos = local_readJson(name+'_dango', []);
	if(g_dangos.length > 0){
		g_blue = local_readJson(name+'_blue', []);
		g_red = local_readJson(name+'_red', []);
		loadIndex(0);
		return true;
	}
	return false;
}

function loadIndex(index = null){
	if(index === null){
		index = g_index;
	}else{
		g_index = index;
	}
	g_showing = g_dangos[index];
	if(g_showing != undefined){
		g_orderIndex = 0;
		$('#favorite i').html(isFavorite() == -1 ? 'star_border' : 'star');
		orderIndex(0);
	}
}

function getHtml(data, index){
	var html = g_order[index];
	for(var k of getStringToArray(html, '{{', '}}')){
		//console.log(k);
		switch(k){
			case 'FrontSide':
				html = html.replace('{{'+k+'}}', getHtml(data, 0));
				break;

			default:
				var i = g_flds.indexOf(k);
				if(i != -1){
					var v = data.fields[i];
					if(i == 7){
						v = v.replace('|', "</br>");
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

	if(index >= g_order.length){
		return nextIndex();
	}
	var html = getHtml(g_showing, index);
	//console.log(html);
	$('._card').html(html);

	if(index == 0){
		$('#bar').html(`
			<div class='getAnswer' onclick="nextOrder();">
				正解は？
			</div>
		`);
	}else
	if(index == 1){
		$('#bar').html(`
			<div class='sourceBar'>
				<div class='_btn' onclick='chooseScore(0)'>困難</div>
				<div class='_btn' onclick='chooseScore(1)'>一般</div>
				<div class='_btn' onclick='chooseScore(2)'>简单</div>
			</div>
		`);
	}
}

function nextOrder(){
	if(g_orderIndex >= g_order.length){
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
	$('#bar').html('');
	$('._card').html('<img src="imgs/good.png"/>');
	if(g_dangos.length == 0){
		g_showing = undefined;
		g_index = 0;
		g_orderIndex = 0;

		x0p({
		    title: 'クリア！',
		    text: '任務完了〜',
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
		return;
	}
	loadIndex();
}

function prevIndex(){
	if(g_index >= 0){
		g_index = g_dangos.length - 1;
	}
	loadIndex();
}

function chooseScore(i){
	var d = g_dangos.splice(g_index, 1)[0];
	//console.log(d);
	if(i == 0){ // 重来
		// 插入到列表的一半位置
		g_dangos.splice(g_dangos.length / 2, 0, d);
		if(g_red.indexOf(d.fields[0]) == -1){
			g_red.push(d.fields[0]);
		}
		var i = g_blue.indexOf(d.fields[0]);
		if(i != -1){
			g_blue.splice(i, 1);
		}
	}else
	if(i == 1){ // 一般
		// 插入到列表的最后
		g_dangos.push(d);
		if(g_blue.indexOf(d.fields[0]) == -1){
			g_blue.push(d.fields[0]);
		}
		var i = g_red.indexOf(d.fields[0]);
		if(i != -1){
			g_red.splice(i, 1);
		}
	}else{
		// 简单
		var i = g_red.indexOf(d.fields[0]);
		if(i != -1){
			g_red.splice(i, 1);
		}
		i = g_blue.indexOf(d.fields[0]);
		if(i != -1){
			g_blue.splice(i, 1);
		}
	}
	//console.log(g_dangos);
	nextOrder();
	if(g_name != 'favorites'){
		local_saveJson(g_name+'_dango', g_dangos);
		local_saveJson(g_name+'_blue', g_blue);
		local_saveJson(g_name+'_red', g_red);
	}

}

function initTitle(){
	$('.brand-logo').html(`
		<span style='color: red' onclick='openList(g_red)'>`+g_red.length+`</span>&nbsp;
    		<span style='color: blue' onclick='openList(g_blue)'>`+g_blue.length+`</span>&nbsp;
    		<span style='color: white' onclick='openList()'>`+(g_dangos.length - g_red.length - g_blue.length)+`</span>&nbsp;`);
}

function searchWord(){
	if(g_showing != undefined){
		window.open('https://dictionary.goo.ne.jp/word/kanji/'+g_showing.fields[1]+'/');	
	}
}

function openList(list = null){
	if(list == null){
		list = [];
		for(var d of g_dangos){
			var key = d.fields[0];
			if(g_blue.indexOf(key) == -1 && g_red.indexOf(key) == -1){
				list.push(key);
			}
		}
	}
	var h = '<ul class="collapsible popout">';
	var i = 0;
	for(var k of list){
		var d = g_json.notes[k-1];
		h = h + `<li index=`+i+` key=`+(k-1)+`>
      <div class="collapsible-header">`+(i+1)+'. '+d.fields[1]+` : `+d.fields[3]+' || '+d.fields[4]+`</div>
      <div class="collapsible-body"></div>
    </li>`;
    i++;
	}
	$('#modal3').html(`<div class='modal-content'>`+h+`</div>`).modal('open');
	$('.collapsible').collapsible();
}

function favorite(remove = true){
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

function isFavorite(){
	if(g_showing != undefined){
		var key = g_showing.fields[1];
		for(var i=0; i<g_favorites.length;i++){
			if(g_favorites[i].fields[1] == key){
				return i;
			}
		}
	}
	return -1;
}

