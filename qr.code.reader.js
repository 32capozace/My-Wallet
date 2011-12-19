var gCtx = null;
var gCanvas = null;
var imageData = null;
var c=0;
var stype=0;

function makeFlash(path)	{
	return $('<embed style="z-index:10;" allowScriptAccess="always" id="embedflash" src="'+path+'camcanvas.swf" quality="high" width="1" height="1" type="application/x-shockwave-flash" pluginspage="http://www.macromedia.com/go/getflashplayer" mayscript="true"  />');
}


function makeCanvas() {
	return $('<canvas style="z-index:-1;width: 800px; height: 600px; display:none;" id="qr-canvas" width="800" height="600"></canvas>');
}

function initCanvas(ww,hh)
{
    gCanvas = document.getElementById("qr-canvas");
    var w = ww;
    var h = hh;
    gCanvas.style.width = w + "px";
    gCanvas.style.height = h + "px";
    gCanvas.width = w;
    gCanvas.height = h;
    gCtx = gCanvas.getContext("2d");
    gCtx.clearRect(0, 0, w, h);
    imageData = gCtx.getImageData( 0,0,320,240);
}

function passLine(stringPixels) { 

    var coll = stringPixels.split("-");

    for(var i=0;i<320;i++) { 
        var intVal = parseInt(coll[i]);
        r = (intVal >> 16) & 0xff;
        g = (intVal >> 8) & 0xff;
        b = (intVal ) & 0xff;
        imageData.data[c+0]=r;
        imageData.data[c+1]=g;
        imageData.data[c+2]=b;
        imageData.data[c+3]=255;
        c+=4;
    } 

    if(c>=320*240*4) { 
        c=0;
        gCtx.putImageData(imageData, 0,0);
        
        try{
            qrcode.decode();
        } catch(e){ };
        
        setTimeout(captureToCanvas, 1000);
    } 
} 

function captureToCanvas() {
    flash = document.getElementById("embedflash");
   
    if(!flash)
        return;
        
    flash.ccCapture();
}


function isCanvasSupported(){
  var elem = document.createElement('canvas');
  return !!(elem.getContext && elem.getContext('2d'));
}

function initQRFlash(el, path) {    
    $('body').append(makeFlash(path));
}

function initQRCodeReader(el, callback, path)
{
	if(isCanvasSupported()) {
       if ($("#embedflash").length == 0) {
    	   initQRFlash(el, path);
        }
       
       $("#embedflash").width(320).height(240).appendTo($('#'+el));

       if ($("#qr-canvas").length == 0) {
    	   $('body').append(makeCanvas());
    	   initCanvas(800,600);
       }

        
		qrcode.callback = callback;
        
       return setTimeout(captureToCanvas, 1000);
	} else
	{
		documentel.innerHTML='<p id="mp1">QR code scanner for HTML5 capable browsers</p><br>'+
        '<br><p id="mp2">sorry your browser is not supported</p><br><br>'+
        '<p id="mp1">try <a href="http://www.mozilla.com/firefox"><img src="${resource}promo/firefox.png"/></a> or <a href="http://chrome.google.com"><img src="${resource}promo/chrome.png"/></a></p>';
	}
}
