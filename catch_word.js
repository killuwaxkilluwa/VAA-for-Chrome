var myport;
var myport1;
var mp3url;
var cc = "#08acdf", ct = "#FFFFFF";
var sk = false, ck = true, ak = false;
var mousePos;
var PADDING_LEFT = 10;
var PADDING_RIGHT = 0;
var PADDING_TOP = 15;
var PADDING_BOTTOM = 15;
var BUBBLE_WIDTH = 384;
var BUBBLE_HEIGHT = 200;
var BASE_Z_INDEX = 65000;
var LOADER_ICON_URL = chrome.extension.getURL('img/loader.gif');
var SPEAKER_ICON_URL = chrome.extension.getURL('img/speaker.png');
var SPEAKER_CONTROL_ICON_URL = chrome.extension.getURL('img/speaker_volume_control.png');
var button;

initialize();

// Main initialization function. Loads options and sets listeners.
function initialize() {
	// Manually inject the stylesheet into non-HTML pages that have no <head>.
	if (!document.head && document.body) {
		link = document.createElement('link');
		link.rel = 'stylesheet';
		link.type = 'text/css';
		link.href = chrome.extension.getURL('css/style.css');
		document.body.appendChild(link);
	}

	//checkState();
	beginEventListener();
	myport = chrome.extension.connect({
			name : "wordterminate"
		});
	myport.onMessage.addListener(onMessageRecieved);
	myport.postMessage({
		message : "currentsc"
	}); // sc stands for shortcut

}

function checkState() // if the worksheet is not set,do not begin catch word;
{
	chrome.extension.sendMessage({
		type : 'currentstate'
	}, function (response) {
		if (!response.result){
			hide("bubble");
			alert("请点击vaa图标，初始化生词本，接着刷新当前页面即可进行查词操作。");
		}
	});

}
function onMessageRecieved(a) {
	if (a.message == "translate") {
		mp3url_en = a.mp3url_en;
		mp3url_us = a.mp3url_us;
		var temptxt = a.txt;
		//console.log("mp3url_us:" + mp3url_us);
		var m = document.getElementById("bubble");
		m.innerHTML = temptxt;
		
		if (mp3url_en) {
			var speaker_en = document.getElementById("speaker0");
			speaker_en.src = SPEAKER_ICON_URL;
			speaker_en.onmouseover = function () {
				speaker_en.src = SPEAKER_CONTROL_ICON_URL;
			}
			speaker_en.onmouseout = function () {
				speaker_en.src = SPEAKER_ICON_URL;
			}

		}
		if(mp3url_us){
			var speaker_us = document.getElementById("speaker1");
			speaker_us.src = SPEAKER_ICON_URL;
			speaker_us.onmouseover = function () {
				speaker_us.src = SPEAKER_CONTROL_ICON_URL;
			}
			speaker_us.onmouseout = function () {
				speaker_us.src = SPEAKER_ICON_URL;
			}
		
		}

	} else if (a.message == "currentsc") {
		sk = (a.sk == true) ? true : false;
		ck = (a.ck == true) ? true : false;
		ak = (a.ak == true) ? true : false;

		qck = (a.qck == true) ? true : false;
		qak = (a.qak == true) ? true : false;
	}
}

var styleInsert = document.createElement("style"), styleContent = document
	.createTextNode("#bubble{position:absolute; display:block; z-index: 9998; font-family: Lucida grande, arial, sans-serif; font-size: 13px; font-style: normal; font-variant: normal; font-weight: normal;border-radius:10px;width:384px;box-shadow: 10px 10px 5px #888888;height: 214px;}.vaa_word{font-family:georgia, serif;border-radius:10px;width:386px;box-shadow: 10px 10px 5px #888888;}.vaa_head{width:322px; height:25px; font-family:georgia, serif;border:2px solid #a1a1a1;border-bottom:none;padding:10px 30px; color:white;background:#7BBC48;border-top-left-radius:10px;border-top-right-radius:10px;-moz-border-radius:10px;}.vaa_content{width:322px;font-family:georgia, serif;border:2px solid #a1a1a1;padding:10px 30px; color:#595959;border-bottom-right-radius:10px;border-bottom-left-radius:10px;height:170px;background:white;}.vaa_innercontent{font-family:georgia,serif;height:165px;overflow:auto;width:352px;}.vaa_meaning{padding-right:15px;}.vaa_example{padding-right:15px;}#vaa_lookup{border-radius:13px;width:384px;box-shadow: 10px 10px 5px #888888;border:2px solid #a1a1a1;padding-bottom:10px;background:#7BBC48;}#vaa_inputfield{text-align:center;background:#7BBC48;border-top-left-radius:10px;border-top-right-radius:10px;}.pron{font-size:12px;}.wordname{font-size:30px;line-height:25px;}.pronce{color:royalblue;}.pronimg{vertical-align: middle;margin-top: -3px;margin-right: 5px;}");
styleInsert.type = "text/css";
if (styleInsert.styleSheet)
	styleInsert.styleSheet.cssText = styleContent.nodeValue;
else {
	styleInsert.appendChild(styleContent);
	document.getElementsByTagName("head")[0].appendChild(styleInsert)
}

function getAncestorNode (element) {
	var t = element.parentNode;
	while (!t.id && t != document.body)
		t = t.parentNode;
	return t.id;
}

function beginEventListener() {
	document.addEventListener("mouseup", function (a) {
		//console.log(getAncestorNode(a.target));
		mousePos = mouseCoords(a);
		if (a.target.id == "speaker0") {
			(new Audio(mp3url_en)).play();
		}else if(a.target.id == "speaker1"){
			(new Audio(mp3url_us)).play();
		
		} else if (getAncestorNode(a.target) != "bubble") {
			hide("bubble");
			if (window.getSelection().type == "Range" && a.shiftKey == sk
				 && a.ctrlKey == ck && a.altKey == ak) {
				var t = "" + window.getSelection();
				//alert(t);
				show(t, mousePos.x, mousePos.y);
			}
		}
	}, false);
	document.addEventListener("keydown", function (a) {
		if (a.keyCode == 81 && a.ctrlKey == qck && a.altKey == qak) {
			showSearchInput();
		} else if (a.keyCode == 27) {
			hide("vaa_lookup");
			hide("bubble");
		}
	}, false);
}

function showSearchInput() {
	// Calculate the coordinates of the middle of the window.
	var full_bubble_width = PADDING_LEFT + BUBBLE_WIDTH + PADDING_RIGHT;
	var full_bubble_height = PADDING_TOP + BUBBLE_HEIGHT + PADDING_BOTTOM;

	var windowX = (window.innerWidth - full_bubble_width) / 2;
	var windowY = (window.innerHeight - full_bubble_height) / 2;
	var x = document.body.scrollLeft + windowX;
	var y = document.body.scrollTop + windowY;

	// Create the form, set its id and insert it.
	var searchform = document.createElement('div');
	searchform.setAttribute("id", "vaa_lookup");
	document.body.appendChild(searchform);

	// Set form style.
	searchform.style.position = 'absolute';
	searchform.style.left = x + 'px';
	searchform.style.top = y + 'px';
	searchform.style.zIndex = BASE_Z_INDEX;
	searchform.style.height = '50px';

	var vaaInputField = document.createElement('div');
	vaaInputField.setAttribute("id", "vaa_inputfield");
	vaaInputField.style.height = '24px';
	vaaInputField.style.marginTop = '19px';
	vaaInputField.style.border = 'none';
	searchform.appendChild(vaaInputField);

	// Add textbox.
	var textbox = document.createElement('input');
	textbox.setAttribute("id", "vaa_qkinput");
	textbox.type = 'text';
	textbox.style.border = 'none';
	textbox.style.borderRadius = '3px';
	textbox.style.height = '24px';
	textbox.style.width = '200px';
	textbox.style.display = 'inline';
	vaaInputField.appendChild(textbox);
	textbox.focus();

	// Add button.
	button = document.createElement('input');
	button.type = 'submit';
	button.style.cursor = 'pointer';
	button.style.background = '-webkit-linear-gradient(top, #24a828 0%, #1b7e1e 100%)';
	button.style.color = 'white';
	button.style.borderRadius = '3px';
	button.style.width = '90px';
	button.style.height = '27px';
	button.style.top = '50%';
	button.style.border = 'none';
	button.style.margin = '0px';
	button.style.marginLeft = '3px';
	button.style.marginTop = '-12'
		button.style.padding = '0px';
	button.style.font = '"Helvetica Neue",Arial,Helvetica,sans-serif';

	button.value = chrome.i18n.getMessage("lookUpButtonValue");
	button.setAttribute("id", "vaaSearchButton");
	vaaInputField.appendChild(button);

	// Set lookup event handlers.
	button.addEventListener('click', function (e) {
		textboxWord = textbox.value.replace(/(^\s+)|(\s+$)/g, "");
		if (textboxWord != '') {
			hide("vaa_lookup");
			show(textboxWord, x, y);
		}
	}, false);
	textbox.addEventListener('keypress', function (e) {
		if (e.keyCode == 13) { // Pressed Enter.
			button.click();
		}
	}, false);
}

function show(queryWord, x, y) {
	bubble = document.createElement("div");
	bubble.setAttribute("id", "bubble");
	//bubble.innerHTML = a;
	document.body.appendChild(bubble);
	// Calculate bubble position
	var window_width = window.innerWidth;
	var window_height = window.innerHeight;
	var full_bubble_width = PADDING_LEFT + BUBBLE_WIDTH + PADDING_RIGHT;
	var full_bubble_height = PADDING_TOP + BUBBLE_HEIGHT + PADDING_BOTTOM;
	var left = 0;
	var top = 0;
	if (x + full_bubble_width >= window_width) {
		left = x - full_bubble_width;
		if (left < 0)
			left = 5;
	} else {
		left = x;
	}

	if (y + full_bubble_height >= window_height) {
		top = y - full_bubble_height;
		if (top < 0)
			top = 5;
	} else {
		top = y;
	}
	bubble.style.top = top + "px";
	bubble.style.left = left + "px";
	mousePos = null;
	bubble.style.background = 'white url("' + LOADER_ICON_URL + '") center no-repeat';

	setTimeout(function () {
		bubble.style.opacity = 1;
	}, 100);

    checkState();
	myport1 = chrome.extension.connect({
			name : "wordterminate"
		});
	myport1.onMessage.addListener(onMessageRecieved);
	/* myport.postMessage({
	message : "select",
	txt : queryWord
	});*/
	myport1.postMessage({
		message : "translate",
		txt : queryWord
	});
}

//get the mouse position
function mouseCoords(e) {
	if (e.pageX || e.pageY) {
		return {
			x : e.pageX,
			y : e.pageY
		};
	}
}

function hide(id) {
	var a = document.getElementById(id);
	a && a.parentNode.removeChild(a);
}