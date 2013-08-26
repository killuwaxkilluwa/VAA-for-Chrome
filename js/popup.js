jQuery(function ($) {
	date1 = new Date();

	$container = $('#container');
	$container.isotope({
		itemSelector : '.element',
		masonry : {
			columnWidth : 110
		}
	});
	if (localStorage["trello_token"]) {
		Trello.authorize({
			interactive : false,
			success : trelloAuthorizeSuccess
		});
		titleSelect("trello");
	}

	//去掉图片模式
	/*var $listModel = $("<span>")
	.addClass("listmodel")
	.text(list_mode)
	.appendTo("#modelchoice")
	.click(function(){
	util.loadingDataPic();
	$(".listmodel").css("background-color" ,"#99CCFF");
	$(".picmodel").css("background-color" ,"white");
	constructListModelContent();
	modelchoice = "listmodel";
	});
	var $piclistModel = $("<span>")
	.addClass("picmodel")
	.text(pic_mode)
	.appendTo("#modelchoice")
	.click(function(){
	util.loadingDataPic();
	$(".picmodel").css("background-color", "#99CCFF");
	$(".listmodel").css("background-color", "white");
	modelchoice = "picmodel";
	constructPicModelContent();
	});*/
	if (!localStorage["trello_token"]) {
		check("Trello");
		connectStorageService();
	}

	var Init_Title = chrome.i18n.getMessage("init_title");
	$("#init_title").html(Init_Title);

	document.addEventListener("mouseup", function (a) {
		if (a.target.id == "speaker") {
			(new Audio($(a.target).attr('class'))).play();
		}
	});
});
var list_mode = chrome.i18n.getMessage("list_mode");
var pic_mode = chrome.i18n.getMessage("pic_mode");
var remember = chrome.i18n.getMessage("remembered");
var showmeaning = chrome.i18n.getMessage("showmeaning");
var refresh = chrome.i18n.getMessage("refresh");
var rss = chrome.i18n.getMessage("RSS");
var option = chrome.i18n.getMessage("option");
var nowordremember = chrome.i18n.getMessage("nowordremember");
var greatjob = chrome.i18n.getMessage("greatjob");

var bgPage = chrome.extension.getBackgroundPage();
var cards_num = 0;
var BOARD_NAME = bgPage.wordListName;
var modelchoice = "listmodel";
var gwords = {};
var gdocs = {};
var listsName = ["new", "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"];
var listsLevel = {
	"new" : 0,
	"1st" : 1,
	"2nd" : 2,
	"3rd" : 3,
	"4th" : 4,
	"5th" : 5,
	"6th" : 6,
	"7th" : 7,
	"8th" : 8
}

function titleSelect(choice) {
	if (choice == "trello") {
		$("#1").attr("title", refresh);
		//$("#2").attr("title", rss);
		$("#3").attr("title", option);
		$("#1").click(function () {
			util.loadingDataPic();
			isBoardExit();
		});
		//trello无rss
		$("#2").css("display", "none");
		$("#3").click(gdocs.openOption);
	}
}

function trelloAuthorize() {
	var trellourl = chrome.extension.getURL('connect.html');
	chrome.tabs.create({
		'url' : trellourl
	});
	Trello.authorize({
		interactive : false,
		success : trelloAuthorizeSuccess
	});
}
function connectStorageService() {
	if (localStorage["service"] == "Trello" || typeof localStorage["service"] == "undefined") {
		trelloAuthorize();
	}
}

function check(service) {
	localStorage["service"] = service;
}

//function clearTempWordList() {
	//localStorage['temp_wordlist'] = "";
//}

function trelloAuthorizeSuccess() {
	//clearTempWordList();
	//$("#select_service").addClass("authorized");
	util.loadingDataPic(); //util.displayMsg(wait_moment);
	Trello.members.get("me", function (member) {
		if (localStorage["board_id"] && localStorage["1st"] && localStorage["2nd"] && localStorage["3rd"] && localStorage["4th"] && localStorage["5th"] && localStorage["6th"] && localStorage["7th"] && localStorage["8th"] && localStorage["new"]) {
			console.log("have");
			$cardlist = $("<div>")
				.addClass("container")
				.appendTo("#output");
			if (modelchoice == 'listmodel') {
				constructListModelContent();
			} else {
				constructPicModelContent();
			}

		} else {

			isBoardExit();

		}
	});
}

//trello operation
function isBoardExit() {
	$("#output").html("");
	Trello.get("members/me/boards", function (boards) {
		for (var i = 0; i < boards.length; i++) {
			if (boards[i].name == BOARD_NAME && boards[i].desc == "TrelloDB") {
				console.log("have board");
				localStorage["board_id"] = boards[i].id;
				console.log("boardclosed :" + boards[i].closed);
				//getListCard(boards[i].id);
				boards[i].closed ? getListCard(boards[i].id) : changeBoardClosedStatus(boards[i].id, true, "changeStatus");

				return;
			}

		}
		console.log("add board")
		addBoard();
	});

}

function changeBoardClosedStatus(board_id, status, type) {
	Trello.put("boards/" + board_id + "/closed", {
		value : status
	}, function (board) {
		console.log("changeboardclosed: " + board);
		console.log(type + "change board status")
		if (type == "addBoard") {
			for (var i = 0; i < listsName.length; i++) {
				addList(board.id, listsName[i], listsLevel[listsName[i]]);
			}
			$('#butter1').fadeOut(0);
			util.displayMsg(no_newwords);
		} else if (type == "changeStatus") {
			getListCard(board.id);
		}
	},function(error){
		console.log("error:" + error);
		if(type == "changeStatus"){
			getListCard(board_id);
		}
		
	});
}

function changeListClosedStatus(list_id, status) {
	Trello.put("lists/" + list_id + "/closed", {
		value : status
	}, function (list) {
		//console.log("change list status")

	});
}

function addBoard() {
	Trello.post("boards", {
		name : BOARD_NAME,
		desc : "TrelloDB"
	}, function (boards) {
		//console.log(BOARD_NAME + "board add");
		localStorage["board_id"] = boards.id;
		changeBoardClosedStatus(boards.id, true, "addBoard");
	});
}
function addList(idBoard, name, levelnum) {
	Trello.post("lists", {
		name : name,
		idBoard : idBoard
	}, function (list) {
		//console.log(name + "added");
		localStorage[name] = list.id;
		localStorage[list.id] = levelnum;
		//changeListClosedStatus(list.id, true);
	});
}

function getListCard(board_id) {
	Trello.get("boards/" + board_id + "/lists", {
		filter : "all"
	}, function (lists) {
		var listName = [];
		var listsNameString = listsName.toString();
		var needChangeStatuesList = [];
		for (var i = 0; i < lists.length; i++) {
			listName.push(lists[i].name);
			if (listsNameString.indexOf(lists[i].name) !== -1) {
				if (lists[i].closed) {
					needChangeStatuesList.push(lists[i].id);
				}
				localStorage[lists[i].name] = lists[i].id;
				localStorage[lists[i].id] = listsLevel[lists[i].name];
			}
		}

		//for ( var key in level ){
		//console.log("key:" + key + "value:" + level[key]);
		//}
		var needCreateListName = array_diff(listsName, listName);
		if (needChangeStatuesList.length > 0) {
			for (var i = 0; i < needChangeStatuesList.length; i++) {
				changeListClosedStatus(needChangeStatuesList[i], false);
			}
		}
		if (needCreateListName.length <= listsName.length) {
			for (var i = 0; i < needCreateListName.length; i++) {
				addList(board_id, needCreateListName[i]);

			}
		}

		console.log("continue");
		$cardlist = $("<div>")
			.addClass("container")
			.appendTo("#output");
		if (modelchoice == 'listmodel') {
			constructListModelContent();
		} else {
			constructPicModelContent();
		}
	});
}

function closedCard(card_id, status) {
	Trello.put("cards/" + card_id + "/closed", {
		value : status
	}, function (data) {});
}

function changeCardList(card_id, list_id, time) {
	console.log("card_id" + card_id);
	console.log("list_id" + list_id);
	console.log("time" + time);
	Trello.put("cards/" + card_id, {
		idList : list_id,
		pos : "top",
		due : time
	}, function (data) {
		console.log("finishe");
	});
}

function array_diff(array1, array2) {
	var o = {}; //转成hash可以减少运算量，数据量越大，优势越明显。
	for (var i = 0, len = array2.length; i < len; i++) {
		o[array2[i]] = true;
	}

	var result = [];
	for (i = 0, len = array1.length; i < len; i++) {
		var v = array1[i];
		if (o[v])
			continue;
		result.push(v);
	}
	return result;
}

function constructPicModelContent() {
	$cardlist.html(" ");
	util.loadingDataPic();
	Trello.get("boards/" + localStorage["board_id"] + "/cards", {
		attachments : true
	}, function (cards) {
		if (cards.length == 0) {
			util.displayMsg(no_newwords);
			//util.hideMsg();
		} else {
			$.each(cards, function (ix, card) {
				util.loadingDataPic();
				var d = card.desc.split("#");
				var time_id = d[d.length - 1].split("@");
				var degree = time_id[1];
				var duedate = new Date(Date.parse(time_id[0]));
				var now = new Date();
				if (degree == 0 || (duedate < now && degree < 8)) {
					var $element = $("<div>")
						.addClass("element")
						.appendTo($cardlist)
						.click(function () {
							$(this).toggleClass('large');
							$container.isotope('reLayout');
							$(this).children('.name').toggleClass('namelarge');
							$(this).children('.name').children('.content').toggleClass('showcontent');
							$(this).children('.number').toggleClass('numberlarge');
						});
					var $remember = $("<p>")
						.addClass("number")
						.appendTo($element);
					var $remember_pic = $("<img>")
						.attr({
							src : "img/icons/default/16/remember.png",
							title : remember,
							alt : remember,
							width : "20px",
							height : "20px"
						})
						.css({
							"cursor" : "pointer"
						})
						.appendTo($remember)
						.click(function (event) {
							event.stopPropagation();
							$element.css("display", "none");
							remembereWord(degree, card);
						});

					var $name = $("<div>")
						.addClass("name")
						.html("<MARQUEE direction=left behavior=alternate scrollamount=1 scrolldelay=100>" + card.name + "</MARQUEE><br>")
						.css({
							"cursor" : "pointer"
						})
						.appendTo($element);
					var $content = $("<div>")
						.addClass("content")
						.html(constructPopupEWordContent(card, "picview"))
						.appendTo($name);
					if (card.attachments.length > 0) {
						$element.css("background-image", "url(" + card.attachments[0].url + ")");

					}
				}

			});
		}
		$("#modelchoice").css('display', 'block');
		$('#butter1').fadeOut(0);
	});
}

function constructListModelContent() {
	console.log("second");
	$cardlist.html(" ");
	util.loadingDataPic();
	var word_num;
	Trello.get("boards/" + localStorage["board_id"] + "/cards", {
		filter : "open"
	}, function (cards) {
		if (cards.length == 0) {
			util.displayMsg(no_newwords);
			bgPage.setIcon({
				'text' : cards.length.toString()
			});
			$('#butter1').fadeOut(0);
			
		} else {
			//util.loadingDataPic();
			word_num = 0;
			$.each(cards, function (ix, card) {
				console.log("card: " + card);
				//tempWordList.push(card.name);
				var due = new Date(card.due);
				var now = new Date();
				console.log("card " + card.name);
                console.log("duetime " + card.due);
				console.log("due " + due);
				console.log("now " + now);
				console.log(now >= due);
				if (now >= due) {
					word_num++;
					var $word = $("<div>")
						.addClass("word1")
						.appendTo($cardlist);

					var $head = $("<div>")
						.addClass("head")
						.attr("id", card.id)
						.text(card.name)
						.appendTo($word)
						.click(function () {
							//$content.toggle(1000);
						});
					//card = card.replace('\n','');
					var $content = $("<div>")
						.addClass("content")
						.html(constructPopupEWordContent(card.desc.replace(/\\n/g, ""), "listview"))
						.appendTo($word);

					var $remembered = $("<img>")
						.attr({
							src : "img/icons/default/16/select.png",
							title : remember,
							alt : remember,
							width : "30px",
							height : "30px"
						})
						.addClass("remembered")
						.css({
							"cursor" : "pointer"
						})
						.appendTo($head)
						.click(function (event) {
							$word.fadeOut(1000);
							word_num = word_num - 1;
							bgPage.setIcon({
								'text' : word_num.toString()
							});
							remembereWord(card.idList, card.id);
							//showNeedRememberWordsNum(word_num);
							
							event.stopPropagation();
						});

					var $showmeaning = $("<img>")
						.attr({
							src : "img/icons/default/16/search.png",
							title : showmeaning,
							alt : showmeaning,
							width : "30px",
							height : "30px"
						})
						.addClass("remembered")
						.css({
							"cursor" : "pointer"
						})
						.appendTo($head)
						.click(function (event) {
							$content.toggle();
							$remembered.attr({
								src : "img/icons/default/16/select_invalid.png",
								title : remember,
								alt : remember,
								width : "30px",
								height : "30px"
							}).unbind("click");
						});

					var $familiarity = $("<div>")
						.addClass("vaalevel")
						.html(constructFamiliarityImage(card.name, localStorage[card.idList]))
						.appendTo($head);

				}
			});
			$('#butter1').fadeOut(0);
			bgPage.setIcon({
				'text' : word_num.toString()
			});
			if (word_num == 0) {
				var $noword = $("<div>")
					.addClass("nowordcontainer")
					.html('<div class="nowordtoremember">' + nowordremember + '</div><div class="great">'+ greatjob +'</div>')
					.appendTo($cardlist);
			}
		}
	});
}

var timeArray = [5, 30, 720, 1440, 2880, 5760, 10082, 21600, -1];
function remembereWord(list_id, card_id) {
	if (parseInt(localStorage[list_id]) == 8) {
		closedCard(card_id, true);
	} else {
		for (var key in localStorage) {
			console.log("key: " + key + " value:" + localStorage[key] + " type: " + typeof(localStorage[key]));
			if (parseInt(localStorage[key]) == parseInt(localStorage[list_id]) + 1) {
				console.log()
				var time = setTime(parseInt(localStorage[list_id]) + 1);
				changeCardList(card_id, key, time);
				return;
			}
		}

	}

}
/*
function setDue(idCard, date) {
Trello.put("cards/" + idCard + "/desc", {
value : date
}, function () {});
}

function deleteCard(idCard){
Trello.delete("cards/" + idCard);
}*/

function setTime(level) {
	//console.log(desc);
	var date = new Date();
	date.setMinutes(date.getMinutes() + timeArray[level]);
	console.log("date2 :" + date);
	console.log("ISO " + date.toISOString());
	console.log("date3 " + new Date(date.toISOString()));
	return date.toISOString();
}

String.prototype.chunk = function (n) {
	if (n < 0 || this.length < n) {
		return this;
	} else if (n > 0) {
		return this.substring(0, n) + '...';
	}
}

function constructFamiliarityImage(name, level) {
	//console.log(name + ":" + level);
	var degree = parseInt(level);
	var img = [];
	for (var j = 0; j < 8 - degree; j++) {
		//console.log(name + ": unlevel");
		img.push('<img src="img/icons/default/16/unlevel.png" alt="Rememered" width="15px" height="15px" class="level" style="cursor: pointer;">');
	}
	for (var i = 0; i < degree; i++) {
		//console.log(name + ": level");
		img.push('<img src="img/icons/default/16/level.png" alt="Rememered" width="15px" height="15px" class="level" style="cursor: pointer;">');
	}
	return img.join('');
}

function constructPopupEWordContent(card, modle) {
	var content = [];

	//console.log(card);
	var desc = JSON.parse(card);

	if (modle == "listview") {

		if (desc.pron.length > 0) {
			content.push("<div style='color:#4E7DC2; width:100%; border-top:1px solid #ddd;padding-top:5px;font-weight:normal;font-size:15px;'>");
			for (var i = 0; i < desc.pron.length; i++) {
				if (desc.pron[i].ps) {
					content.push("<span>")
					content.push(desc.pron[i].type == "en" ? "英 " : "美 ");
					content.push('[' + desc.pron[i].ps + ']');
					content.push('&nbsp&nbsp<span class="audio" data-src="');
					content.push(desc.pron[i].link);
					content.push('"><img id="speaker" src="img/speaker.png" class="' + desc.pron[i].link + '"/></span></span>&nbsp&nbsp');

				}
			}
			content.push("</div>");
		}
		if (desc.accettation.length > 0) {
			content.push('<div>');
			for (var j = 0; j < desc.accettation.length; j++) {
				content.push('<div style="padding-top:6px; line-height:1.5;"><strong style="padding-right:10px;">');
				content.push(desc.accettation[j].pos + ".");
				content.push('&nbsp</strong>');
				content.push(desc.accettation[j].accep + '</div>');
			}
			content.push('</div>');
		}

	} else {
		content.push("<div style='color:#4E7DC2; width:90%'><MARQUEE direction=left behavior=alternate scrollamount=1 scrolldelay=100>" + mean[1] + "</MARQUEE></div><br>")
		content.push("<div><b>" + mean[2] + "</b><br>");
		content.push(mean[3].chunk(80) + "</div>");
	}
	return content.join('');
}

// google spreadsheet operation

var gwords = {};
var gdocs = {};

var dictServerUrl = new Array("http://www.google.com/dictionary?langpair=en|zh&q=", "http://dict.cn/search.php?q=");
var creatvocabulary_displayMsg = chrome.i18n.getMessage("creatvocabulary_displayMsg");
var no_newwords = chrome.i18n.getMessage("no_newwords");

var pollIntervalMax = 1000 * 60 * 60; // 1 hour

gdocs.getAtom = function () {
	chrome.tabs.create({
		url : bgPage.wordslistAtom
	});
};
gdocs.openOption = function () {
	chrome.tabs.create({
		url : "options.html"
	});
};