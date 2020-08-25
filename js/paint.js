var myCanvas = document.getElementById('xxx');
var context = myCanvas.getContext('2d');
var lineWidth = g_config.paintSize;
listenToUser(myCanvas)

var eraserEnabled = false
var canvasHistory = [];
var paint_step = -1;
context.fillStyle = g_config.paintColor;
context.strokeStyle = g_config.paintColor;

// 撤销方法
function canvasUndo() {
  if (paint_step >= 0) {
    paint_step--;
    context.clearRect(0, 0, myCanvas.width, myCanvas.height);
    let canvasPic = new Image();
    canvasPic.src = canvasHistory[paint_step];
    canvasPic.addEventListener('load', () => {
      context.drawImage(canvasPic, 0, 0);
    });
    $('#paint_undo').css('color', '');
  } else {
    $('#paint_undo').css('color', 'grey');
    // console.log('不能再继续撤销了');
  }
}
// 反撤销方法
function canvasRedo() {
  
  if (paint_step < canvasHistory.length - 1) {
    paint_step++;
    let canvasPic = new Image();
    canvasPic.src = canvasHistory[paint_step];
    canvasPic.addEventListener('load', () => {
      context.clearRect(0, 0, myCanvas.width, myCanvas.height);
      context.drawImage(canvasPic, 0, 0);
    });
  } else {
    //console.log('已经是最新的记录了');
  }
}

/*pen.onclick = function(){
  eraserEnabled = false
  pen.classList.add('active')
  eraser.classList.remove('active')
}
eraser.onclick = function(){
  eraserEnabled = true
  eraser.classList.add('active')
  pen.classList.remove('active')
}
clear.onclick = function(){
}
download.onclick = function(){
  var url = myCanvas.toDataURL("image/png")
  var a = document.createElement('a')
  document.body.appendChild(a)
  a.href = url
  a.download = '我的画儿'
  a.target = '_blank'
  a.click()
}
*/

red.onclick = function(){
  paint_setColor('red', red);
}
green.onclick = function(){
  paint_setColor('green', green);
}
black.onclick = function(){
  paint_setColor('black', black);
}
function paint_resetCanvas(){
  context.clearRect(0, 0, myCanvas.width, myCanvas.height);
}

function paint_setColor(color, dom){
  g_config.paintColor = color;
  local_saveJson('config', g_config);

  context.fillStyle = color;
  context.strokeStyle = color;
  $('.active').removeClass('active');
  if(dom !== null) dom.classList.add('active')
  // todo
}

/******/
var g_i_drawing_top = 0; // 画板距离顶边的距离,用于修复手指位置
var g_b_drawing = false; // 画板模式
function switchCanvas(enable = null){
  if(enable == null) enable = !g_b_drawing;
  if(enable){
    $('#paint').show();
    setCanvasSize();

    $('#paint_switch').css('color', '#03a9f4');
  }else{
    $('#paint_switch').css('color', '');
    $('#paint').hide();
    canvasHistory = [];
    paint_step = -1;
  }
  g_b_drawing = enable;
}

$('#color_picker').change(function(event) {
  $('.colors li:eq(0)').css('cssText', 'background:'+$(this).val()+'!important');
  paint_setColor($(this).val(), this);
});

function paint_sizeSelecter(){
  //$('#modal3').modal('close');
  $('#modal3').css('cssText', '').html(`<form action="#">
    <div class="modal-content" style='padding: 10px'>
      <p class="range-field">
          <input type="range" id="paint_size" value='`+lineWidth+`' min="2" max="20" />
        </p>
      </div>
      <div class="modal-footer">
        <a href="javascript: lineWidth = 5;" class="modal-close waves-effect waves-green btn-flat">Default</a>
        <a href="javascript: paint_setSize()" class="modal-close waves-effect waves-green btn-flat">OK</a>
      </div>
    </form>`).modal('open');
}

function paint_setSize(){
  lineWidth = $('#paint_size').val();
  g_config.paintSize = lineWidth;
  local_saveJson('config', g_config);
}

setCanvasSize()
window.onresize = function() {
  setCanvasSize()
}

function paint_checkColor(){
  if(g_config.nightMode){
    if(context.fillStyle == '#000000'){
      context.fillStyle = '#ffffff';
      context.strokeStyle = '#ffffff';
    }
  }else{
    if(context.fillStyle == '#ffffff'){
      context.fillStyle = '#000000';
      context.strokeStyle = '#000000';
    }
  }
}

function setCanvasSize() {
  // BUG: 更改大小内容也会重置
  if(canvasHistory.length > 0){
   context.drawImage(canvasHistory[canvasHistory.length - 1], 0, 0); // 勉强能保持画板内容,但是因为大小改变内容没有跟着改着
  }
  paint_checkColor();

   g_i_drawing_top = $('._card')[0].offsetTop;
   $('canvas').attr({
      width: $(window).width(),
      height: $(window).height() - $('#bar').height(),
    }).css('top', g_i_drawing_top);
}

function drawCircle(x, y, radius) {
  context.beginPath()
  context.arc(x, y, radius, 0, Math.PI * 2);
  context.fill()
}

function drawLine(x1, y1, x2, y2) {
    
    context.beginPath();
    context.moveTo(x1, y1) // 起点
    context.lineWidth = lineWidth
    context.lineTo(x2, y2) // 终点
    context.stroke()
    context.closePath()

}

function ondrawOver(){
   paint_step++;
    if (paint_step < canvasHistory.length) {
      canvasHistory.length = paint_step; // 截断数组
    }
    canvasHistory.push(myCanvas.toDataURL()); // 添加新的绘制到历史记录
}

function listenToUser(canvas) {
  var using = false
  var lastPoint = {
    x: undefined,
    y: undefined
  }
  if(document.body.ontouchstart !== undefined){
    canvas.ontouchstart = function(aaa){
      var x = aaa.touches[0].clientX
      var y = aaa.touches[0].clientY - g_i_drawing_top
      using = true
      if (eraserEnabled) {
        context.clearRect(x - 5, y - 5, 10, 10)
      } else {
        lastPoint = {
          "x": x,
          "y": y
        }
      }
    }
    canvas.ontouchmove = function(aaa){
      var x = aaa.touches[0].clientX
      var y = aaa.touches[0].clientY - g_i_drawing_top

      if (!using) {return}

      if (eraserEnabled) {
        context.clearRect(x - 5, y - 5, 10, 10)
      } else {
        var newPoint = {
          "x": x,
          "y": y
        }
        drawLine(lastPoint.x, lastPoint.y, newPoint.x, newPoint.y)
        lastPoint = newPoint
      }
    }
    canvas.ontouchend = function(){
      using = false;
      ondrawOver();
    }
  }else{
    // 非触屏设备
    canvas.onmousedown = function(aaa) {
      var x = aaa.clientX
      var y = aaa.clientY - g_i_drawing_top
      using = true
      if (eraserEnabled) {
        context.clearRect(x - 5, y - 5, 10, 10)
      } else {
        lastPoint = {
          "x": x,
          "y": y
        }
      }
    }
    canvas.onmousemove = function(aaa) {
      var x = aaa.clientX
      var y = aaa.clientY - g_i_drawing_top

      if (!using) {return}

      if (eraserEnabled) {
        context.clearRect(x - 5, y - 5, 10, 10)
      } else {
        var newPoint = {
          "x": x,
          "y": y
        }
        drawLine(lastPoint.x, lastPoint.y, newPoint.x, newPoint.y)
        lastPoint = newPoint
      }

    }
    canvas.onmouseup = function(aaa) {
      using = false;
      ondrawOver();
    }
  }

}
